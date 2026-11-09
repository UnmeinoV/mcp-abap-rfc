/**
 * GetObjectRevisions Handler - list the version/revision history of an object.
 *
 * Mirrors abap-adt-api's revisions:
 *   1. GET {object_uri}                       -> object structure with atom:links
 *   2. find the link rel="http://www.sap.com/adt/relations/versions"
 *      (for classes the links live inside <class:include> elements)
 *   3. GET {versionsUrl}  Accept: application/atom+xml;type=feed
 *   4. parse the atom feed entries into revisions
 *
 * Read-only.
 */

import { asArray } from '../../../lib/atcParser';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetObjectRevisions',
  available_in: ['onprem'] as const,
  description:
    "[read-only] List the version/revision history of an ABAP object (version id, title, date, author, and each revision's content URI). Provide the object ADT uri (e.g. /sap/bc/adt/oo/classes/zcl_foo or /sap/bc/adt/programs/programs/zfoo); for a class pass include_name (main/definitions/implementations/testclasses) to select the include. Does not modify anything.",
  inputSchema: {
    type: 'object',
    properties: {
      object_uri: {
        type: 'string',
        description:
          'ADT object URI, e.g. /sap/bc/adt/oo/classes/zcl_foo or /sap/bc/adt/programs/programs/zfoo.',
      },
      include_name: {
        type: 'string',
        description:
          '(class only, optional) Include to read revisions for: main (default), definitions, implementations, testclasses.',
      },
    },
    required: ['object_uri'],
  },
} as const;

interface GetObjectRevisionsArgs {
  object_uri: string;
  include_name?: string;
}

const VERSIONS_REL = 'http://www.sap.com/adt/relations/versions';

/** Join a base URL with a relative href the same way abap-adt-api's followUrl does. */
function followUrl(base: string, extra: string): string {
  if (/^\.\//.test(extra)) {
    base = base.replace(/[^/]*$/, '');
    extra = extra.replace(/^\.\//, '');
  } else {
    extra = extra.replace(/^\//, '');
  }
  base = base.replace(/\/$/, '');
  return `${base}/${extra}`;
}

function parseXml(xml: string): any {
  const { XMLParser } = require('fast-xml-parser');
  // Keep namespace prefixes: link discovery relies on atom:link / class:include.
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  return parser.parse(xml);
}

export async function handleGetObjectRevisions(
  context: HandlerContext,
  args: GetObjectRevisionsArgs,
) {
  const { connection, logger } = context;
  try {
    const object_uri = args?.object_uri;
    const include_name = args?.include_name;
    if (!object_uri) {
      return return_error(new Error('object_uri is required'));
    }

    // 1) Object structure (to discover the versions link).
    const structResp = await makeAdtRequestWithTimeout(
      connection,
      object_uri,
      'GET',
      'default',
      undefined,
      undefined,
      { Accept: 'application/*' },
    );
    const parsed = parseXml(String(structResp.data));
    const rootKey = Object.keys(parsed).find((k) => k !== '?xml');
    const root = rootKey ? parsed[rootKey] : undefined;
    if (!root || typeof root !== 'object') {
      return return_error(
        new Error(`Unexpected object structure for ${object_uri}`),
      );
    }

    // Collect atom:links from the root and from any class includes.
    let links = asArray<any>(root['atom:link']);
    const includes = asArray<any>(root['class:include']);
    if (includes.length > 0) {
      const wanted = include_name || 'main';
      const matching = includes.filter(
        (inc: any) => (inc['@_class:includeType'] ?? 'main') === wanted,
      );
      const source = matching.length > 0 ? matching : includes;
      for (const inc of source) {
        links = links.concat(asArray<any>(inc['atom:link']));
      }
    }

    const versionsLink = links.find((l: any) => l['@_rel'] === VERSIONS_REL);
    if (!versionsLink || !versionsLink['@_href']) {
      return return_error(
        new Error(
          `No version history link found for ${object_uri}${include_name ? ` (include ${include_name})` : ''}`,
        ),
      );
    }
    const versionsUrl = followUrl(object_uri, versionsLink['@_href']);

    // 2) The versions feed.
    const feedResp = await makeAdtRequestWithTimeout(
      connection,
      versionsUrl,
      'GET',
      'default',
      undefined,
      undefined,
      { Accept: 'application/atom+xml;type=feed' },
    );
    const feed = parseXml(String(feedResp.data));
    const entries = asArray<any>(feed?.['atom:feed']?.['atom:entry']);

    const revisions = entries.map((entry: any) => {
      const content = entry['atom:content'];
      const uri = content ? (content['@_src'] ?? null) : null;
      // version id lives on an atom:link's adtcore:name attribute
      const entryLinks = asArray<any>(entry['atom:link']);
      const versionLink =
        entryLinks.find(
          (l: any) =>
            l['@_type'] === 'application/vnd.sap.adt.transportrequests.v1+xml',
        ) ?? entryLinks[0];
      const version = versionLink ? (versionLink['@_adtcore:name'] ?? '') : '';
      const title = entry['atom:title'];
      return {
        version,
        version_title:
          typeof title === 'string' ? title : (title?.['#text'] ?? ''),
        date: entry['atom:updated'] ?? '',
        author: entry['atom:author']?.['atom:name'] ?? '',
        content_uri: uri,
      };
    });

    logger?.info(
      `GetObjectRevisions: ${revisions.length} revision(s) for ${object_uri}`,
    );

    return return_response({
      data: JSON.stringify({
        success: true,
        object_uri,
        include_name: include_name ?? null,
        revision_count: revisions.length,
        revisions,
      }),
    } as AxiosResponse);
  } catch (error: any) {
    logger?.error(`GetObjectRevisions failed: ${error?.message || error}`);
    return return_error(error);
  }
}
