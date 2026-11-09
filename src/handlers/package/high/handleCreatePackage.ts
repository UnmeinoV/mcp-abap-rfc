/**
 * CreatePackage Handler - Create ABAP Package via ADT API
 *
 * Uses PackageBuilder from @mcp-abap-adt/adt-clients for all operations.
 * Session and lock management handled internally by builder.
 *
 * Workflow: validate -> create -> check
 */

import type { IPackageConfig } from '@mcp-abap-adt/adt-clients';
import type { IAbapConnection, ILogger } from '@mcp-abap-adt/interfaces';
import * as z from 'zod';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { getSystemContext } from '../../../lib/systemContext';
import {
  type AxiosResponse,
  assertNameLength,
  assertObjectDoesNotExist,
  ErrorCode,
  McpError,
  return_error,
  return_response,
  withExplicitStatelessHeader,
} from '../../../lib/utils';

// Content types mirrored from @mcp-abap-adt/adt-clients (core/constants/contentTypes).
const ACCEPT_VALIDATION = 'application/vnd.sap.as+xml';
const ACCEPT_PACKAGE =
  'application/vnd.sap.adt.packages.v2+xml, application/vnd.sap.adt.packages.v1+xml';
const CT_PACKAGE = 'application/vnd.sap.adt.packages.v2+xml';

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function resolveMasterLanguage(): string {
  return (
    getSystemContext().masterLanguage ||
    process.env.SAP_LANGUAGE ||
    'EN'
  ).toUpperCase();
}

/**
 * Direct-POST create for a TRUE top-level package (no super package).
 *
 * `@mcp-abap-adt/adt-clients` `AdtPackage.validate()`/`create()` hard-throw
 * "Super package is required" before ever reaching the network, so a top-level
 * package can't go through the client. The underlying low-level `createPackage`
 * / `validatePackageBasic` do NOT require a parent (they emit an empty
 * `<pak:superPackage/>`), but those modules aren't exported from the package
 * (`exports` exposes only `.`). We therefore replicate their two requests here
 * with `connection.makeAdtRequest`. Because `createAdtClient(connection)` has
 * already wrapped `makeAdtRequest` with the P1 sap-language injector, these
 * direct calls inherit the same logon-language pinning as every other request.
 */
async function createTopLevelPackageDirect(
  connection: IAbapConnection,
  packageName: string,
  args: CreatePackageArgs,
  logger?: ILogger,
): Promise<void> {
  if (!args.software_component) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Software component is required to create a top-level package (e.g. HOME, LOCAL, ZLOCAL).',
    );
  }

  const conn = connection as unknown as {
    makeAdtRequest: (request: any) => Promise<any>;
  };

  const description = (args.description || packageName).slice(0, 60);
  const packageType = args.package_type || 'development';
  const lang = resolveMasterLanguage();
  const ctx = getSystemContext();
  const responsible = ctx.responsible || process.env.SAP_USERNAME || '';
  const masterSystem = ctx.masterSystem || process.env.SAP_MASTER_SYSTEM || '';
  const responsibleAttr = responsible
    ? ` adtcore:responsible="${escapeXml(responsible)}"`
    : '';
  const masterSystemAttr = masterSystem
    ? ` adtcore:masterSystem="${escapeXml(masterSystem)}"`
    : '';

  // 1. Existence pre-check (fail fast) — mirrors validatePackageBasic. No
  //    `packagename` (super package) is sent for a top-level package.
  await assertObjectDoesNotExist(`Package ${packageName}`, async () => {
    const validationResponse = await conn.makeAdtRequest({
      url: '/sap/bc/adt/packages/validation',
      method: 'POST',
      params: {
        objname: packageName,
        description,
        packagetype: packageType,
        checkmode: 'basic',
      },
      headers: { Accept: ACCEPT_VALIDATION },
    });
    return { validationResponse };
  });

  // 2. Create — mirrors low-level createPackage XML with an empty
  //    <pak:superPackage/> (the marker of a top-level package).
  const applicationComponentXml = args.application_component
    ? `<pak:applicationComponent pak:name="${escapeXml(args.application_component)}"/>`
    : '<pak:applicationComponent/>';
  const transportLayerXml = args.transport_layer
    ? `<pak:transportLayer pak:name="${escapeXml(args.transport_layer)}"/>`
    : '<pak:transportLayer/>';
  const softwareComponentXml = `<pak:softwareComponent pak:name="${escapeXml(args.software_component)}"/>`;

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<pak:package xmlns:pak="http://www.sap.com/adt/packages" xmlns:adtcore="http://www.sap.com/adt/core" adtcore:description="${escapeXml(description)}" adtcore:language="${lang}" adtcore:name="${escapeXml(packageName)}" adtcore:type="DEVC/K" adtcore:version="active" adtcore:masterLanguage="${lang}"${masterSystemAttr}${responsibleAttr}>
  <adtcore:packageRef adtcore:name="${escapeXml(packageName)}"/>
  <pak:attributes pak:isEncapsulated="false" pak:packageType="${packageType}" pak:recordChanges="${args.record_changes ? 'true' : 'false'}"/>
  <pak:superPackage/>
  ${applicationComponentXml}
  <pak:transport>
    ${softwareComponentXml}
    ${transportLayerXml}
  </pak:transport>
  <pak:translation/>
  <pak:useAccesses/>
  <pak:packageInterfaces/>
  <pak:subPackages/>
</pak:package>`;

  logger?.info(
    `[CreatePackage] top-level direct POST for ${packageName} (no super package)`,
  );

  await conn.makeAdtRequest({
    url: '/sap/bc/adt/packages',
    method: 'POST',
    data: xmlBody,
    params: args.transport_request
      ? { corrNr: args.transport_request }
      : undefined,
    headers: { Accept: ACCEPT_PACKAGE, 'Content-Type': CT_PACKAGE },
  });
}

export const TOOL_DEFINITION = {
  name: 'CreatePackage',
  available_in: ['onprem'] as const,
  description:
    'Create a new ABAP package in SAP system. Packages are containers for development objects and are essential for organizing code.',
  inputSchema: {
    package_name: z
      .string()
      .describe(
        'Package name (e.g., ZOK_TEST_0002). Must follow SAP naming conventions (start with Z or Y for customer namespace).',
      ),
    description: z
      .string()
      .optional()
      .describe(
        'Package description. If not provided, package_name will be used.',
      ),
    super_package: z
      .string()
      .optional()
      .describe(
        'Parent package name (e.g., ZOK_PACKAGE). Optional — omit for a top-level package; required only for structure packages.',
      ),
    package_type: z
      .enum(['development', 'structure'])
      .default('development')
      .describe("Package type: 'development' (default) or 'structure'"),
    software_component: z
      .string()
      .optional()
      .describe(
        'Software component (e.g., HOME, ZLOCAL). If not provided, SAP will set a default (typically ZLOCAL for local packages).',
      ),
    transport_layer: z
      .string()
      .optional()
      .describe(
        'Transport layer (e.g., ZE19). Required for transportable packages.',
      ),
    transport_request: z
      .string()
      .optional()
      .describe(
        'Transport request number (e.g., ABCK900001). Required if package is transportable.',
      ),
    record_changes: z
      .boolean()
      .optional()
      .describe(
        'Enable change recording for the package. Required for transportable packages. Default: false.',
      ),
    application_component: z
      .string()
      .optional()
      .describe('Application component (optional, e.g., BC-ABA)'),
  },
} as const;

interface CreatePackageArgs {
  package_name: string;
  description?: string;
  super_package?: string;
  package_type?: string;
  software_component?: string;
  transport_layer?: string;
  transport_request?: string;
  record_changes?: boolean;
  application_component?: string;
}

/**
 * Main handler for CreatePackage MCP tool
 *
 * Uses PackageBuilder from @mcp-abap-adt/adt-clients for all operations
 * Session and lock management handled internally by builder
 */
export async function handleCreatePackage(
  context: HandlerContext,
  args: CreatePackageArgs,
) {
  const { connection, logger } = context;
  try {
    // Validate required parameters
    if (!args?.package_name) {
      throw new McpError(ErrorCode.InvalidParams, 'Package name is required');
    }
    // super_package is OPTIONAL: SAP allows creating a top-level package (the
    // adt-clients create emits an empty <pak:superPackage/> when none is given).
    // Only 'structure' packages conventionally need a parent — leave that to
    // SAP's own validation rather than blocking every top-level package here.
    if (args?.package_type === 'structure' && !args?.super_package) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Super package (parent package) is required for structure packages',
      );
    }

    const typedArgs = args;

    // Get connection from session context (set by ProtocolHandler)
    // Connection is managed and cached per session, with proper token refresh via AuthBroker
    const packageName = typedArgs.package_name.toUpperCase();
    assertNameLength('package', packageName, 'Package');

    logger?.info(`Starting package creation: ${packageName}`);

    const client = createAdtClient(connection, logger);

    // A TRUE top-level package (no super package) cannot go through the
    // adt-clients AdtPackage wrapper, which hard-throws "Super package is
    // required" in both validate() and create(). Use a direct-POST bypass that
    // replicates the low-level requests (which do support empty superPackage).
    const isTopLevel =
      !typedArgs.super_package && typedArgs.package_type !== 'structure';

    // Force an EXPLICIT `x-sap-adt-sessiontype: stateless` header on every
    // request below (validation + create + read). A long-running MCP session
    // that has done heavy stateful work (locks/activations) leaves the shared
    // connection with a lingering server session; the `/packages/validation`
    // POST then returns a body the existence gate misreads as "already exists",
    // so CreatePackage starts false-rejecting EVERY new name until restart.
    // Sending the header explicitly terminates that session for these requests
    // (same remedy as the P4 GetPackageContents nodestructure-bleed fix).
    const restoreStateless = withExplicitStatelessHeader(connection);

    try {
      if (isTopLevel) {
        await createTopLevelPackageDirect(
          connection,
          packageName,
          typedArgs,
          logger,
        );
        // Confirm readable (create endpoint returns 200 but object may lag).
        try {
          await client
            .getPackage()
            .read({ packageName }, 'active', { withLongPolling: true });
        } catch (readError: any) {
          logger?.warn?.(
            `[CreatePackage] top-level ${packageName} created but not yet readable: ${readError?.message || readError}`,
          );
        }
      } else {
        // Validate — fail fast BEFORE create if the name is taken.
        await assertObjectDoesNotExist(`Package ${packageName}`, () =>
          client.getPackage().validate({
            packageName: packageName,
            superPackage: typedArgs.super_package,
            description: typedArgs.description || packageName,
            softwareComponent: typedArgs.software_component,
            transportLayer: typedArgs.transport_layer,
            transportRequest: typedArgs.transport_request,
            applicationComponent: typedArgs.application_component,
          }),
        );

        // Create - build config object with proper typing
        const createConfig: Partial<IPackageConfig> &
          Pick<
            IPackageConfig,
            'packageName' | 'superPackage' | 'description' | 'softwareComponent'
          > = {
          packageName,
          superPackage: typedArgs.super_package,
          description: typedArgs.description || packageName,
          packageType: typedArgs.package_type,
          softwareComponent: typedArgs.software_component,
        };

        // Only add optional params if explicitly provided
        if (typedArgs.transport_layer) {
          createConfig.transportLayer = typedArgs.transport_layer;
        }
        if (typedArgs.transport_request) {
          createConfig.transportRequest = typedArgs.transport_request;
        }
        if (typedArgs.record_changes !== undefined) {
          createConfig.recordChanges = typedArgs.record_changes;
        }
        if (typedArgs.application_component) {
          createConfig.applicationComponent = typedArgs.application_component;
        }

        // DEBUG: Log softwareComponent at each step
        logger?.debug(
          `[CreatePackage] software_component in args: ${typedArgs.software_component || 'undefined'}`,
        );
        logger?.debug(
          `[CreatePackage] softwareComponent in config: ${createConfig.softwareComponent || 'undefined'}`,
        );

        await client.getPackage().create(createConfig);

        // Check
        await client.getPackage().check({
          packageName: packageName,
          superPackage: typedArgs.super_package,
        });
      }

      logger?.info(`✅ CreatePackage completed successfully: ${packageName}`);

      return return_response({
        data: JSON.stringify(
          {
            success: true,
            package_name: packageName,
            description: typedArgs.description || packageName,
            super_package: typedArgs.super_package,
            package_type: typedArgs.package_type || 'development',
            software_component: typedArgs.software_component || null,
            transport_layer: typedArgs.transport_layer || null,
            transport_request: typedArgs.transport_request || null,
            uri: `/sap/bc/adt/packages/${packageName.toLowerCase()}`,
            message: `Package ${packageName} created successfully`,
          },
          null,
          2,
        ),
      } as AxiosResponse);
    } catch (error: any) {
      logger?.error(`CreatePackage ${packageName}`, error);
      const responseData =
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data
            ? JSON.stringify(error.response.data)
            : '';
      const responseSnippet = responseData
        ? responseData.slice(0, 1000)
        : undefined;
      if (responseSnippet) {
        logger?.warn(
          `CreatePackage returned HTTP ${error.response?.status} for ${packageName}. Response: ${responseSnippet}`,
        );
      }

      // Check for authentication errors (expired tokens)
      if (
        error.message?.includes('Refresh token has expired') ||
        error.message?.includes('JWT token has expired') ||
        error.message?.includes('Please re-authenticate')
      ) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Authentication failed: ${error.message}. Please re-authenticate using the authentication tool or update your credentials.`,
        );
      }

      // Check if package already exists
      const errorMessageLower = error.message?.toLowerCase() || '';
      const errorDataLower =
        typeof error.response?.data === 'string'
          ? error.response.data.toLowerCase()
          : '';
      if (
        errorMessageLower.includes('already exists') ||
        errorMessageLower.includes('does already exist') ||
        errorDataLower.includes('already exists') ||
        errorDataLower.includes('does already exist') ||
        errorDataLower.includes('exceptionresourcealreadyexists') ||
        error.response?.status === 409
      ) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Package ${packageName} already exists. Please delete it first or use a different name.`,
        );
      }

      // Check for 401/403 authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        const authError =
          error.response?.status === 401
            ? 'Unauthorized: Authentication failed. Please check your credentials and re-authenticate.'
            : 'Forbidden: Access denied. Please check your permissions.';
        throw new McpError(ErrorCode.InvalidRequest, authError);
      }

      const errorMessage = error.response?.data
        ? typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data)
        : error.message || String(error);

      if (
        error.response?.status === 404 &&
        typeof errorMessage === 'string' &&
        errorMessage.includes('Error while importing object')
      ) {
        try {
          const readState = await client
            .getPackage()
            .read({ packageName: packageName }, 'active', {
              withLongPolling: true,
            });
          if (readState?.readResult) {
            logger?.warn(
              `CreatePackage returned import error, but ${packageName} is readable; continuing as success`,
            );
            return return_response({
              data: JSON.stringify(
                {
                  success: true,
                  package_name: packageName,
                  description: typedArgs.description || packageName,
                  super_package: typedArgs.super_package,
                  package_type: typedArgs.package_type || 'development',
                  software_component: typedArgs.software_component || null,
                  transport_layer: typedArgs.transport_layer || null,
                  transport_request: typedArgs.transport_request || null,
                  uri: `/sap/bc/adt/packages/${packageName.toLowerCase()}`,
                  warning:
                    'Import warning during create (404). Object verified by read.',
                  message: `Package ${packageName} created successfully (import warning ignored).`,
                },
                null,
                2,
              ),
            } as AxiosResponse);
          }
        } catch (_readError) {
          // Fall through to standard error handling below.
        }
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create package ${packageName}: ${errorMessage}`,
      );
    } finally {
      // Always restore the original makeAdtRequest (removes the forced header).
      restoreStateless();
    }
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    return return_error(error);
  }
}
