/**
 * GetFeatureToggle Handler - read a Switch Framework feature toggle (FTGL).
 *
 * Ground-truthed live on DM2/310 (see CLAUDE.md): the metadata GET on
 * `/sap/bc/adt/sfw/featuretoggles/{name}` answers `<blue:blueSource>` XML; `/source/main`
 * (Accept: application/json) answers JSON — rollout status/strategy, free-form key/value
 * attributes, and a longtext. A bogus name answers a clean 404
 * `ExceptionResourceNotFound "Feature Toggle X does not exist."`, so existence is unambiguous —
 * this uses the same pattern every other Get* handler in this project relies on.
 */

import {
  parseFeatureToggleContent,
  parseFeatureToggleMetadata,
} from '../../../lib/featureToggleXml';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetFeatureToggle',
  available_in: ['onprem'] as const,
  description:
    '[read-only] Read a Switch Framework feature toggle (FTGL): metadata plus rollout status/strategy and attributes.',
  notes: `Metadata comes from a GET on /sap/bc/adt/sfw/featuretoggles/{name} (a <blue:blueSource>
document); rollout_status/strategy/attributes come from a second GET on that object's
/source/main, which answers JSON rather than XML. A bogus name answers a clean 404 rather than an
empty result, so existence is unambiguous.`,
  inputSchema: {
    type: 'object',
    properties: {
      toggle_name: {
        type: 'string',
        description: 'Feature toggle name.',
      },
    },
    required: ['toggle_name'],
  },
} as const;

export async function handleGetFeatureToggle(
  context: HandlerContext,
  args: { toggle_name: string },
) {
  const { connection, logger } = context;
  try {
    if (!args?.toggle_name) {
      return return_error(new Error('toggle_name is required'));
    }
    const name = args.toggle_name.toUpperCase();

    let metadataXml: string;
    try {
      const metaRes = await makeAdtRequestWithTimeout(
        connection,
        `/sap/bc/adt/sfw/featuretoggles/${encodeURIComponent(name)}`,
        'GET',
      );
      metadataXml = typeof metaRes.data === 'string' ? metaRes.data : '';
    } catch (e: any) {
      if (e?.response?.status === 404) {
        return return_error(
          new Error(`Feature toggle "${name}" does not exist.`),
        );
      }
      throw e;
    }

    const metadata = parseFeatureToggleMetadata(metadataXml);

    let content: ReturnType<typeof parseFeatureToggleContent> | undefined;
    try {
      const contentRes = await makeAdtRequestWithTimeout(
        connection,
        `/sap/bc/adt/sfw/featuretoggles/${encodeURIComponent(name)}/source/main`,
        'GET',
        'default',
        undefined,
        undefined,
        { Accept: 'application/json' },
      );
      const body =
        typeof contentRes.data === 'string'
          ? JSON.parse(contentRes.data)
          : contentRes.data;
      content = parseFeatureToggleContent(body);
    } catch (e: any) {
      logger?.warn(
        `Could not read /source/main for feature toggle ${name}: ${e?.message ?? e}`,
      );
    }

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          toggle_name: metadata.name || name,
          description: metadata.description,
          type: metadata.type,
          master_language: metadata.master_language,
          language: metadata.language,
          responsible: metadata.responsible,
          created_at: metadata.created_at,
          changed_at: metadata.changed_at,
          ...(content
            ? {
                lifecycle_status: content.lifecycle_status,
                rollout_strategy: content.rollout_strategy,
                longtext: content.longtext,
                toggled_packages: content.toggled_packages,
                related_toggles: content.related_toggles,
                attributes: content.attributes,
              }
            : {
                warning:
                  "Could not read the toggle's rollout/attribute content (/source/main); metadata above is still valid.",
              }),
        },
        null,
        2,
      ),
    } as AxiosResponse);
  } catch (error: any) {
    return return_error(error);
  }
}
