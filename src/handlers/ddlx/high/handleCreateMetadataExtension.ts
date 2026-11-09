/**
 * CreateMetadataExtension Handler - ABAP Metadata Extension Creation via ADT API
 */

import { describeActivation } from '../../../lib/adtMessages';
import {
  activateWrittenObject,
  writtenActivationFields,
} from '../../../lib/adtObjectOps';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  assertObjectDoesNotExist,
  return_error,
  return_response,
} from '../../../lib/utils';
import { validateTransportRequest } from '../../../utils/transportValidation.js';
export const TOOL_DEFINITION = {
  name: 'CreateMetadataExtension',
  available_in: ['onprem'] as const,
  description:
    'Operation: Create. Subject: MetadataExtension. Will be useful for creating metadata extension. Create a new ABAP Metadata Extension (DDLX) in SAP system. Creates the metadata extension object in initial state.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Metadata Extension name',
      },
      description: {
        type: 'string',
        description: 'Description',
      },
      package_name: {
        type: 'string',
        description: 'Package name',
      },
      transport_request: {
        type: 'string',
        description: 'Transport request number',
      },
      activate: {
        type: 'boolean',
        description:
          'Activate after creation. DEFAULT FALSE, and passing true will normally FAIL. ' +
          'This tool creates an EMPTY metadata extension: it writes no source, so the new ' +
          'object has no `annotate` statement and SAP rejects its activation with ' +
          'Illegal syntax. Malformed annotate statement. Write the source with ' +
          'UpdateMetadataExtension (which activates by default) as the second step.',
      },
    },
    required: ['name', 'package_name'],
  },
} as const;

interface CreateMetadataExtensionArgs {
  name: string;
  description?: string;
  package_name: string;
  transport_request?: string;
  activate?: boolean;
}

export async function handleCreateMetadataExtension(
  context: HandlerContext,
  params: any,
) {
  const { connection, logger } = context;
  const args: CreateMetadataExtensionArgs = params;
  if (!args.name || !args.package_name) {
    return return_error(new Error('Missing required parameters'));
  }

  try {
    validateTransportRequest(args.package_name, args.transport_request);
  } catch (error) {
    return return_error(error as Error);
  }

  const name = args.name.toUpperCase();

  logger?.info(`Starting DDLX creation: ${name}`);

  try {
    const client = createAdtClient(connection, logger);
    // DEFAULT FALSE, changed in the field report round-3 pass. The default used to be
    // true and the activation could NEVER succeed: this handler creates a bare
    // DDLX shell and writes no source, so there is no `annotate` statement to
    // activate and SAP answers "Illegal syntax. Malformed 'annotate'
    // statement.". The result literal reported success unconditionally, so the
    // failure was invisible — including in this repo's own integration test,
    // which passed for as long as the handler lied. Same shell-then-fill
    // contract as CreateTable and CreateView.
    const shouldActivate = args.activate === true;

    // Fail fast if the name is already taken (stateless-pinned validation).
    await assertObjectDoesNotExist(
      `Metadata extension ${name}`,
      () =>
        client.getMetadataExtension().validate({
          name,
          packageName: args.package_name,
          description: args.description || name,
        }),
      connection,
    );

    // Create
    await client.getMetadataExtension().create({
      name,
      description: args.description || name,
      packageName: args.package_name,
      transportRequest: args.transport_request || '',
    });

    // Lock
    let activation:
      | Awaited<ReturnType<typeof activateWrittenObject>>
      | undefined;
    const lockHandle = await client.getMetadataExtension().lock({ name: name });

    try {
      // Check
      await client.getMetadataExtension().check({ name: name });

      // Unlock
      await client.getMetadataExtension().unlock({ name: name }, lockHandle);

      // Wait for object to be ready after update (long polling)
      try {
        await client
          .getMetadataExtension()
          .read({ name }, 'inactive', { withLongPolling: true });
      } catch {
        // Continue anyway — activation will fail explicitly if object isn't ready
      }

      // Activate if requested — and report SAP's verdict, not the request flag.
      if (shouldActivate) {
        activation = await activateWrittenObject(
          connection,
          name,
          'DDLX',
          `Metadata Extension ${name}`,
          'created',
        );
      }
    } catch (error) {
      // Unlock on error (principle 1: if lock was done, unlock is mandatory)
      try {
        await client.getMetadataExtension().unlock({ name: name }, lockHandle);
      } catch (unlockError) {
        logger?.error(
          `Failed to unlock metadata extension after error: ${unlockError instanceof Error ? unlockError.message : String(unlockError)}`,
        );
      }
      // Principle 2: first error and exit
      throw error;
    }

    const result = {
      success: true,
      name: name,
      package_name: args.package_name,
      type: 'DDLX',
      ...writtenActivationFields(activation),
      message: activation
        ? describeActivation(activation, `Metadata Extension ${name}`)
        : `Metadata Extension ${name} created successfully as an EMPTY shell ` +
          '(no source, not activated). Write its `annotate` source with ' +
          'UpdateMetadataExtension to make it usable.',
    };

    return return_response({
      data: JSON.stringify(result, null, 2),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
  } catch (error: any) {
    logger?.error(`Error creating DDLX ${name}: ${error?.message || error}`);
    return return_error(error);
  }
}
