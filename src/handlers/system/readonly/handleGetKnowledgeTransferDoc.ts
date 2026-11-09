/**
 * GetKnowledgeTransferDoc Handler - read a Knowledge Transfer Document (SKTD).
 *
 * Ground-truthed live on DM2/310 (see CLAUDE.md). TWO TRAPS, both handled here rather than left
 * for the caller to rediscover:
 *  - the GET answers a bare HTTP 500 (a generic ICF error page, not a clean ADT exception) unless
 *    the request explicitly sends `Accept: application/vnd.sap.adt.sktdv2+xml` — omitting it
 *    looks exactly like a server bug and is actually a missing header;
 *  - the documentation text itself is base64-encoded on the wire; `src/lib/knowledgeTransferDocXml.ts`
 *    decodes it, so this response never hands back a base64 string that merely LOOKS like text.
 * A bogus name still answers a clean 404 `ExceptionResourceNotFound`, so existence is unambiguous.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import {
  type KnowledgeTransferDoc,
  parseKnowledgeTransferDoc,
} from '../../../lib/knowledgeTransferDocXml';
import {
  type AxiosResponse,
  makeAdtRequestWithTimeout,
  return_error,
  return_response,
} from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'GetKnowledgeTransferDoc',
  available_in: ['onprem'] as const,
  description: '[read-only] Read a Knowledge Transfer Document (SKTD).',
  notes: `Documentation SAP attaches to a CDS entity/element (e.g. explaining a RAP business
event). Documentation text is decoded from the base64 the wire sends. A bogus name answers a
clean 404, so existence is unambiguous.`,
  inputSchema: {
    type: 'object',
    properties: {
      document_name: {
        type: 'string',
        description: 'SKTD document name.',
      },
    },
    required: ['document_name'],
  },
} as const;

export async function handleGetKnowledgeTransferDoc(
  context: HandlerContext,
  args: { document_name: string },
) {
  const { connection } = context;
  try {
    if (!args?.document_name) {
      return return_error(new Error('document_name is required'));
    }
    const name = args.document_name.toUpperCase();

    let xml: string;
    try {
      const res = await makeAdtRequestWithTimeout(
        connection,
        `/sap/bc/adt/documentation/ktd/documents/${encodeURIComponent(name)}`,
        'GET',
        'default',
        undefined,
        undefined,
        { Accept: 'application/vnd.sap.adt.sktdv2+xml' },
      );
      xml = typeof res.data === 'string' ? res.data : '';
    } catch (e: any) {
      if (e?.response?.status === 404) {
        return return_error(
          new Error(`Knowledge transfer document "${name}" does not exist.`),
        );
      }
      throw e;
    }

    const doc: KnowledgeTransferDoc = parseKnowledgeTransferDoc(xml);

    return return_response({
      data: JSON.stringify(
        {
          success: true,
          document_name: doc.name || name,
          description: doc.description,
          type: doc.type,
          master_language: doc.master_language,
          language: doc.language,
          responsible: doc.responsible,
          created_at: doc.created_at,
          changed_at: doc.changed_at,
          package_name: doc.package_name,
          ref_object: doc.ref_object_name
            ? {
                name: doc.ref_object_name,
                type: doc.ref_object_type,
                uri: doc.ref_object_uri,
              }
            : undefined,
          elements: doc.elements.map((el) => ({
            id: el.id,
            text: el.text,
            short_text: el.short_text,
            short_text_obligation: el.short_text_obligation,
            can_have_documentation: el.can_have_documentation,
            ref_object: el.ref_object_name
              ? {
                  name: el.ref_object_name,
                  type: el.ref_object_type,
                  uri: el.ref_object_uri,
                }
              : undefined,
          })),
        },
        null,
        2,
      ),
    } as AxiosResponse);
  } catch (error: any) {
    return return_error(error);
  }
}
