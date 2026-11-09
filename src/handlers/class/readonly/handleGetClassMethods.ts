/**
 * GetClassMethods Handler - method table of contents for a class (F-5 / K-8, read half)
 *
 * Lists every method in the class's main-source IMPLEMENTATION, WITHOUT sending the full source
 * back. Meant to be called before UpdateClassMethod so a caller knows the exact method_name to
 * target — this is the discovery step that makes an anchored patch possible without first
 * downloading the whole class.
 *
 * `visibility`/`is_static`/`is_redefinition` come from a best-effort scan of the DEFINITION
 * section (see src/lib/classMethodSurgery.ts). When a method's declaration could not be
 * resolved unambiguously (chiefly: methods that come from `INTERFACES <intf>.` rather than
 * their own METHODS statement), visibility is reported as "unknown" rather than guessed — a
 * wrong-but-plausible visibility is the exact "caller cannot tell success from vacuum" shape
 * this project refuses to ship.
 */

import { listClassMethods } from '../../../lib/classMethodSurgery';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetClassMethods',
  available_in: ['onprem', 'legacy'] as const,
  description:
    "[read-only] List a class's methods (name, visibility, static/redefinition flags, line range, whether it has a body) WITHOUT returning the full source. Use this before UpdateClassMethod to find the exact method_name to target — avoids downloading a whole class just to locate one method.",
  inputSchema: {
    type: 'object',
    properties: {
      class_name: {
        type: 'string',
        description: 'Class name (e.g., ZCL_MY_CLASS).',
      },
      version: {
        type: 'string',
        enum: ['active', 'inactive'],
        description: 'Version to read: "active" (default) or "inactive".',
        default: 'active',
      },
    },
    required: ['class_name'],
  },
} as const;

export async function handleGetClassMethods(
  context: HandlerContext,
  args: { class_name: string; version?: 'active' | 'inactive' },
) {
  const { connection, logger } = context;
  try {
    const { class_name, version = 'active' } = args;
    if (!class_name) return return_error(new Error('class_name is required'));

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

    const methods = listClassMethods(sourceCode, className);
    const unresolvedCount = methods.filter(
      (m) => m.visibility === 'unknown',
    ).length;

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          class_name: className,
          version,
          method_count: methods.length,
          methods: methods.map((m) => ({
            name: m.name,
            visibility: m.visibility,
            is_static: m.isStatic,
            is_redefinition: m.isRedefinition,
            is_interface_method: m.isInterfaceMethod,
            start_line: m.startLine,
            end_line: m.endLine,
            line_count: m.lineCount,
            has_body: m.hasBody,
          })),
          ...(unresolvedCount > 0
            ? {
                warning: `${unresolvedCount} of ${methods.length} method(s) report visibility "unknown" — their declaration could not be resolved unambiguously (commonly: methods implemented from an INTERFACES statement rather than their own METHODS declaration). This does not affect UpdateClassMethod, which only ever edits a method's body.`,
              }
            : {}),
        },
        null,
        2,
      ),
    } as AxiosResponse);
  } catch (error: any) {
    return return_error(error);
  }
}
