/**
 * CreateProgram Handler - ABAP Program Creation via ADT API
 *
 * Workflow: validate -> create (object in initial state)
 * Source code is set via UpdateProgram handler.
 */

import type { IAdtResponse } from '@mcp-abap-adt/interfaces';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  buildIncludeCreateXml,
  judgeProgramType,
} from '../../../lib/programCreate';
import { readTrdirRow } from '../../../lib/programTrdir';
import { getSystemContext } from '../../../lib/systemContext';
import {
  assertNameLength,
  encodeSapObjectName,
  isCloudConnection,
  makeAdtRequestWithTimeout,
  parseValidationResponse,
  return_error,
  return_response,
} from '../../../lib/utils';
import { validateTransportRequest } from '../../../utils/transportValidation.js';

export const TOOL_DEFINITION = {
  name: 'CreateProgram',
  available_in: ['onprem', 'legacy'] as const,
  description:
    'Operation: Create. Subject: Program. Will be useful for creating program. Create a new ABAP program (report) in SAP system. Creates the program object in initial state.',
  inputSchema: {
    type: 'object',
    properties: {
      program_name: {
        type: 'string',
        description:
          'Program name (e.g., Z_TEST_PROGRAM_001). Must follow SAP naming conventions (start with Z or Y).',
      },
      description: {
        type: 'string',
        description:
          'Program description. If not provided, program_name will be used.',
      },
      package_name: {
        type: 'string',
        description: 'Package name (e.g., ZOK_LAB, $TMP for local objects)',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request number (e.g., ABCK900001). Required for transportable packages.',
      },
      program_type: {
        type: 'string',
        description:
          "Program type: 'executable' (Report), 'include', 'module_pool', 'function_group', 'class_pool', 'interface_pool'. Default: 'executable'",
        enum: [
          'executable',
          'include',
          'module_pool',
          'function_group',
          'class_pool',
          'interface_pool',
        ],
      },
      application: {
        type: 'string',
        description:
          "Application area (e.g., 'S' for System, 'M' for Materials Management). Default: '*'",
      },
      main_program: {
        type: 'string',
        description: 'include only: the main program it belongs to (optional).',
      },
    },
    required: ['program_name', 'package_name'],
  },
} as const;

interface CreateProgramArgs {
  program_name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  program_type?: string;
  application?: string;
  main_program?: string;
}

export async function handleCreateProgram(
  context: HandlerContext,
  params: any,
) {
  const { connection, logger } = context;
  const args: CreateProgramArgs = params;

  // Validate required parameters
  if (!args.program_name || !args.package_name) {
    return return_error(
      new Error('Missing required parameters: program_name and package_name'),
    );
  }

  // Check if cloud - programs are not available on cloud systems
  if (isCloudConnection(connection)) {
    return return_error(
      new Error(
        'Programs are not available on cloud systems (ABAP Cloud). This operation is only supported on on-premise systems.',
      ),
    );
  }

  // Validate transport_request: required for non-$TMP packages
  try {
    validateTransportRequest(args.package_name, args.transport_request);
  } catch (error) {
    return return_error(error as Error);
  }

  const programName = args.program_name.toUpperCase();
  logger?.info(`Starting program creation: ${programName}`);

  try {
    assertNameLength('program', programName, 'Program');

    const client = createAdtClient(connection, logger);

    // Validate
    logger?.debug(`Validating program: ${programName}`);
    const validationState = await client.getProgram().validate({
      programName,
      description: args.description || programName,
      packageName: args.package_name,
    });
    const validationResponse = validationState.validationResponse;
    if (!validationResponse) {
      throw new Error('Validation did not return a result');
    }
    const validationResult = parseValidationResponse(
      validationResponse as IAdtResponse,
    );
    if (!validationResult || validationResult.valid === false) {
      throw new Error(
        `Program name validation failed: ${validationResult?.message || 'Invalid program name'}`,
      );
    }
    logger?.debug(`Program validation passed: ${programName}`);

    // Create. An include is its own ADT resource: /programs/programs only
    // creates PROG/P and silently drops programType="I" (see lib/programCreate).
    const programType = args.program_type || 'executable';
    const isInclude = programType === 'include';
    logger?.debug(`Creating program: ${programName} (${programType})`);
    if (isInclude) {
      const ctx = getSystemContext();
      await makeAdtRequestWithTimeout(
        connection,
        '/sap/bc/adt/programs/includes',
        'POST',
        'default',
        buildIncludeCreateXml({
          name: programName,
          description: args.description || programName,
          packageName: args.package_name,
          masterLanguage: ctx.masterLanguage,
          responsible: ctx.responsible,
          mainProgram: args.main_program,
        }),
        args.transport_request ? { corrNr: args.transport_request } : undefined,
        { Accept: 'application/*', 'Content-Type': 'application/*' },
      );
    } else {
      await client.getProgram().create({
        programName,
        description: args.description || programName,
        packageName: args.package_name,
        transportRequest: args.transport_request,
        programType: args.program_type,
        application: args.application,
      });
    }
    logger?.info(`Program created: ${programName}`);

    // Read back what SAP stored: the program type is not taken on trust.
    const stored = await readTrdirRow(client, programName, logger);
    const check = judgeProgramType(
      programType,
      args.application,
      stored === 'missing' ? null : stored,
    );
    if (check.verdict === 'wrong_type') {
      return return_error(
        new Error(
          `${programName} was created, but SAP stored program type (TRDIR-SUBC) ` +
            `'${check.stored_subc}', not '${check.requested_subc}' (${programType}). ` +
            'The object EXISTS with the wrong type — delete it with DeleteProgram ' +
            'before creating it again.',
        ),
      );
    }
    const warnings: string[] = [];
    if (check.verdict === 'unverified') {
      warnings.push(
        `The program type could not be read back from TRDIR. Confirm with GetSqlQuery: SELECT name, subc FROM trdir WHERE name = '${programName}'.`,
      );
    }
    if (check.application_ignored) {
      warnings.push(
        `application '${check.application_requested}' was not stored (TRDIR-APPL is '${check.application_stored ?? ''}'); set it in SE38 attributes if it matters.`,
      );
    }

    const objectPath = isInclude ? 'includes' : 'programs';
    const result = {
      success: true,
      program_name: programName,
      package_name: args.package_name,
      transport_request: args.transport_request || null,
      program_type: programType,
      type: isInclude ? 'PROG/I' : 'PROG/P',
      program_type_check: check,
      ...(warnings.length ? { warnings } : {}),
      message: `${isInclude ? 'Include' : 'Program'} ${programName} created${
        check.verdict === 'as_requested'
          ? ` (TRDIR-SUBC '${check.stored_subc}' confirmed)`
          : ' (type NOT verified — see warnings)'
      }. Use UpdateProgram to set source code.`,
      uri: `/sap/bc/adt/programs/${objectPath}/${encodeSapObjectName(programName).toLowerCase()}`,
      steps_completed: ['validate', 'create', 'verify_type'],
    };

    return return_response({
      data: JSON.stringify(result, null, 2),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger?.error(`Error creating program ${programName}: ${errorMessage}`);
    return return_error(
      new Error(`Failed to create program ${programName}: ${errorMessage}`),
    );
  }
}
