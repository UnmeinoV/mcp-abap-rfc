import { XMLParser } from 'fast-xml-parser';
import { createAdtClient } from '../../../lib/clients';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';
import {
  parseServiceBindingPayload,
  type ServiceBindingResponseFormat,
} from './serviceBindingPayloadUtils';

export const TOOL_DEFINITION = {
  name: 'GetServiceBinding',
  available_in: ['onprem'] as const,
  description:
    'Retrieve ABAP service binding source/metadata by name via ADT Business Services endpoint, plus the RESOLVED service root URL (service_root) for a published binding — the path to call for $metadata or an entity set, taken from SAP rather than guessed.',
  notes: `service_root is NOT derived. The binding document itself does not carry a URL, so the
handler follows the binding's own OData category link — GET /sap/bc/adt/businessservices/odatav4/{name}
?servicename={declared service name} (Accept application/vnd.sap.adt.businessservices.odatav4.v1+xml),
or the odatav2 equivalent with .odatav2.v2+xml — and reports what SAP answers there. The first
named srvb:services declaration supplies servicename; only a missing declaration falls back to
the binding name. Its first explicitly declared content version supplies serviceversion when
present. If that query returns no service URL, the handler makes at most one further GET with
the same servicename and no serviceversion. declared_service_version retains the binding's
declaration; service_version remains the actual category response value. The binding document's
explicit published state takes precedence over the category response, even when SAP returns no URL.

That answer carries odatav4:serviceUrl (the complete root), odatav4:serviceUrlPrefix,
odatav4:repositoryId and the entity collections with their isRoot flag. repositoryId is the segment
that cannot be guessed: a UI binding resolves to SRVD and an A2X/Web-API binding to SRVD_A2X, so a
caller copying the shape of somebody else's URL gets

    403 Service '<SRVD>' repository 'SRVD_A2X' is not assigned to group '<binding>'

Measured on S/4HANA 2023 FPS02: an ODATA_V4_WEB_API binding answers repositoryId SRVD_A2X and
serviceUrl /sap/opu/odata4/sap/<binding>/srvd_a2x/sap/<service>/0001/. The V2 endpoint answers 200
with empty values for a V4 binding, so the version is taken from the binding's own srvb:binding.

When SAP returns no service URL, service_root is null and service_root_note says why. A failure
to resolve it never fails the read — the binding document is still returned, with the reason in
service_root_note. Returned URLs are preserved independently of the binding's published state.`,
  inputSchema: {
    type: 'object',
    properties: {
      service_binding_name: {
        type: 'string',
        description:
          'Service binding name (for example: ZUI_MY_BINDING). Case-insensitive.',
      },
      response_format: {
        type: 'string',
        enum: ['xml', 'json', 'plain'],
        description:
          'Preferred response format. "json" requests JSON from endpoint, "xml" parses XML payload, "plain" returns raw text.',
        default: 'xml',
      },
    },
    required: ['service_binding_name'],
  },
} as const;

interface ResolvedServiceRoot {
  service_root: string | null;
  service_url_prefix?: string;
  repository_id?: string;
  service_id?: string;
  service_version?: string;
  published?: boolean;
  collections?: Array<{ name: string; is_root: boolean }>;
  service_root_note?: string;
}

const PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  parseAttributeValue: false,
  trimValues: true,
});

function arr<T>(x: T | T[] | undefined | null): T[] {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

interface BindingMetadata {
  version: 'V2' | 'V4';
  serviceName?: string;
  serviceVersion?: string;
  published?: boolean;
}

interface DeclaredService {
  '@_name'?: string;
  content?: { '@_version'?: string } | Array<{ '@_version'?: string }>;
}

function bindingMetadata(bindingXml: string): BindingMetadata {
  try {
    const root = PARSER.parse(bindingXml)?.serviceBinding;
    const binding = arr<{ '@_version'?: string }>(root?.binding)[0];
    const service = arr<DeclaredService>(root?.services).find(
      (entry) => String(entry?.['@_name'] ?? '').trim().length > 0,
    );
    const published = root?.['@_published'];
    return {
      version: binding?.['@_version']?.toUpperCase() === 'V2' ? 'V2' : 'V4',
      serviceName: String(service?.['@_name'] ?? '').trim() || undefined,
      serviceVersion: arr(service?.content)
        .map((content) => String(content?.['@_version'] ?? '').trim())
        .find((version) => version.length > 0),
      published:
        published === 'true' ? true : published === 'false' ? false : undefined,
    };
  } catch {
    // Root resolution is best effort; never discard the successfully read document.
    return { version: 'V4' };
  }
}

/**
 * Ask SAP for the binding's service root instead of building one.
 *
 * A URL assembled from binding + service definition names is wrong for half of
 * all bindings: the repository segment is SRVD for a UI binding and SRVD_A2X for
 * an A2X/Web-API one, and getting it wrong is a 403 that names neither cause.
 * The OData category resource knows, so it is asked. Never throws — a binding
 * that cannot be resolved still returns its document, with the reason attached.
 */
async function resolveServiceRoot(
  context: HandlerContext,
  bindingName: string,
  binding: BindingMetadata,
): Promise<ResolvedServiceRoot> {
  const { version, published: bindingPublished } = binding;
  const serviceName = binding.serviceName ?? bindingName;
  const category = version === 'V2' ? 'odatav2' : 'odatav4';
  const accept =
    version === 'V2'
      ? 'application/vnd.sap.adt.businessservices.odatav2.v2+xml'
      : 'application/vnd.sap.adt.businessservices.odatav4.v1+xml';
  const readCategory = async (serviceVersion?: string) => {
    const response = await makeAdtRequestWithTimeout(
      context.connection,
      `/sap/bc/adt/businessservices/${category}/${bindingName}`,
      'GET',
      'default',
      undefined,
      // Required: without it the endpoint answers 400 ExceptionParameterNotFound
      // "Parameter servicename could not be found."
      {
        servicename: serviceName,
        ...(serviceVersion ? { serviceversion: serviceVersion } : {}),
      },
      { Accept: accept },
    );
    const xml = String(response?.data ?? '');
    const parsed = PARSER.parse(xml);
    const group = parsed?.serviceGroup ?? parsed?.serviceList ?? {};
    const service = arr<any>(group?.services)[0];
    return { group, service };
  };
  try {
    let categoryResult = await readCategory(binding.serviceVersion);
    let fallbackNote = '';
    if (
      binding.serviceVersion &&
      !String(categoryResult.service?.['@_serviceUrl'] ?? '')
    ) {
      try {
        categoryResult = await readCategory();
      } catch (error: unknown) {
        const failure = error as {
          response?: { status?: number };
          message?: string;
        };
        fallbackNote =
          ` The query without serviceversion failed${failure?.response?.status ? ` (HTTP ${failure.response.status})` : ''}: ` +
          `${failure?.message ?? String(error)}. No further resolution was attempted.`;
      }
    }
    const { group, service } = categoryResult;
    if (!service) {
      return {
        service_root: null,
        published: bindingPublished,
        service_root_note: `The ${category} resource returned no service entry for ${serviceName} in ${bindingName}.${fallbackNote}`,
      };
    }
    const url = String(service['@_serviceUrl'] ?? '');
    const collections = arr<any>(service?.serviceInformation?.collection).map(
      (c) => ({
        name: String(c?.['@_name'] ?? ''),
        is_root: c?.['@_isRoot'] === 'true',
      }),
    );
    const published =
      bindingPublished ??
      (group?.['@_published'] === 'true' || service['@_published'] === 'true');
    return {
      service_root: url || null,
      service_url_prefix:
        String(group?.['@_serviceUrlPrefix'] ?? '') || undefined,
      repository_id: String(service['@_repositoryId'] ?? '') || undefined,
      service_id: String(service['@_serviceId'] ?? '') || undefined,
      service_version: String(service['@_serviceVersion'] ?? '') || undefined,
      published,
      ...(collections.length ? { collections } : {}),
      ...(url
        ? {}
        : {
            service_root_note:
              (published
                ? `SAP reported no service URL for ${bindingName}.`
                : `${bindingName} is not published, so it has no service root yet. Publish it with PublishServiceBinding.`) +
              fallbackNote,
          }),
    };
  } catch (error: any) {
    const status = error?.response?.status;
    return {
      service_root: null,
      published: bindingPublished,
      service_root_note:
        `The service root could not be resolved via /sap/bc/adt/businessservices/${category}` +
        `${status ? ` (HTTP ${status})` : ''}: ${error?.message ?? String(error)}. ` +
        'The binding document above is unaffected.',
    };
  }
}

interface GetServiceBindingArgs {
  service_binding_name: string;
  response_format?: ServiceBindingResponseFormat;
}

export async function handleGetServiceBinding(
  context: HandlerContext,
  args: GetServiceBindingArgs,
) {
  const { connection, logger } = context;

  try {
    if (!args?.service_binding_name) {
      throw new Error('service_binding_name is required');
    }

    const serviceBindingName = args.service_binding_name.trim().toUpperCase();
    const responseFormat = args.response_format ?? 'xml';
    const client = createAdtClient(connection, logger);
    const state = await client.getServiceBinding().read({
      bindingName: serviceBindingName,
    });
    const response = state?.readResult;
    if (!response) {
      throw new Error(
        `Read did not return a response for service binding ${serviceBindingName}`,
      );
    }

    const binding = bindingMetadata(String(response.data ?? ''));
    const serviceRoot = await resolveServiceRoot(
      context,
      serviceBindingName,
      binding,
    );

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          service_binding_name: serviceBindingName,
          response_format: responseFormat,
          status: response.status,
          declared_service_version: binding.serviceVersion,
          ...serviceRoot,
          payload: parseServiceBindingPayload(response.data, responseFormat),
        },
        null,
        2,
      ),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: response.config,
    });
  } catch (error: unknown) {
    logger?.error('Error reading service binding:', error);
    return return_error(error);
  }
}
