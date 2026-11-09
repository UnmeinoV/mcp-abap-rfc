/**
 * GetClassMethod Handler - read ONE method's implementation body (F-5 / K-8, read half)
 *
 * Returns a single method's body instead of the whole class source — the token-efficient
 * counterpart to UpdateClassMethod's write side. If the method is not found, the response lists
 * every method name the class actually has (via GetClassMethods' listing logic) instead of a
 * bare "not found", so the caller's next call can go straight to the right name.
 */

import {
  extractMethodBody,
  findMethod,
  findMethodDeclarations,
  listAllMethodNames,
} from '../../../lib/classMethodSurgery';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetClassMethod',
  available_in: ['onprem', 'legacy'] as const,
  description:
    "[read-only] Read ONE method's implementation (signature line + body), not the whole class. Use GetClassMethods first to find the exact method_name. A method not found returns every method name the class has, instead of a bare error.",
  inputSchema: {
    type: 'object',
    properties: {
      class_name: {
        type: 'string',
        description: 'Class name (e.g., ZCL_MY_CLASS).',
      },
      method_name: {
        type: 'string',
        description:
          'Method name, case-insensitive. Interface-implementation methods use the ABAP form "if_x~method_name".',
      },
      version: {
        type: 'string',
        enum: ['active', 'inactive'],
        description: 'Version to read: "active" (default) or "inactive".',
        default: 'active',
      },
    },
    required: ['class_name', 'method_name'],
  },
} as const;

export async function handleGetClassMethod(
  context: HandlerContext,
  args: {
    class_name: string;
    method_name: string;
    version?: 'active' | 'inactive';
  },
) {
  const { connection, logger } = context;
  try {
    const { class_name, method_name, version = 'active' } = args;
    if (!class_name) return return_error(new Error('class_name is required'));
    if (!method_name) return return_error(new Error('method_name is required'));

    const className = class_name.toUpperCase();
    const client = createAdtClient(connection, logger);

    let sourceCode: string | null = null;
    try {
      const readResult = await client
        .getClass()
        .read({ className }, version as 'active' | 'inactive');
      if (typeof readResult?.readResult?.data === 'string') {
        sourceCode = readResult.readResult.data;
      }
    } catch (e: any) {
      return return_error(
        new Error(
          `Could not read source for class ${className}: ${e?.message ?? e}`,
        ),
      );
    }

    if (!sourceCode) {
      return return_error(
        new Error(`Class ${className} (${version}) has no readable source.`),
      );
    }

    const found = findMethod(sourceCode, className, method_name);
    if (!found) {
      const available = listAllMethodNames(sourceCode);
      return return_error(
        new Error(
          `Method "${method_name}" was not found in class ${className}. ` +
            (available.length > 0
              ? `Available methods: ${available.join(', ')}.`
              : "No methods could be parsed from this class's IMPLEMENTATION section at all."),
        ),
      );
    }

    const body = extractMethodBody(sourceCode, found);
    const decl = findMethodDeclarations(sourceCode, className).get(
      found.name.toUpperCase(),
    );

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          class_name: className,
          method_name: found.name,
          version,
          implementation_class: found.implementationClassName,
          visibility: decl?.visibility ?? 'unknown',
          is_static: decl?.isStatic ?? false,
          is_redefinition: decl?.isRedefinition ?? false,
          start_line: found.headerLine,
          end_line: found.footerLine,
          // null means the method's body is genuinely empty, not that it is missing.
          body,
        },
        null,
        2,
      ),
    } as AxiosResponse);
  } catch (error: any) {
    return return_error(error);
  }
}
