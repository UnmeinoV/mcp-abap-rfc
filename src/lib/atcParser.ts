/**
 * Shared parsing helpers for the ADT ATC (ABAP Test Cockpit) REST endpoints.
 * Used by handleRunAtc / handleGetAtcWorklist / handleGetAtcCustomizing.
 *
 * Field coverage aligned with abap-adt-api's atcWorklists parser
 * (quickfixInfo, processor, lastChangedBy, link, objectTypeId).
 */

/** Ensure a parsed XML node is always an array (fast-xml-parser collapses single children). */
export function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseAtcXml(xml: string): any {
  const { XMLParser } = require('fast-xml-parser');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
  });
  return parser.parse(xml);
}

export interface AtcCustomizingInfo {
  properties: Record<string, string | boolean | number>;
  exemption_reasons: Array<{
    id: string;
    title: string;
    justification_mandatory: boolean;
  }>;
  system_check_variant: string | null;
}

/** Parse ATC customizing XML: properties + exemption reasons. */
export function parseAtcCustomizing(
  customizingXml: string,
): AtcCustomizingInfo {
  const parsed = parseAtcXml(customizingXml);
  const customizing = parsed?.customizing ?? {};

  const properties: Record<string, string | boolean | number> = {};
  for (const p of asArray<any>(customizing.properties?.property)) {
    const name = p['@_name'];
    if (!name) continue;
    let value: any = p['@_value'];
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    properties[name] = value;
  }
  // some releases put it as a root attribute instead
  if (customizing['@_systemCheckVariant']) {
    properties.systemCheckVariant = String(customizing['@_systemCheckVariant']);
  }

  const exemption_reasons = asArray<any>(
    customizing.exemption?.reasons?.reason,
  ).map((r: any) => ({
    id: String(r['@_id'] ?? ''),
    title: String(r['@_title'] ?? ''),
    justification_mandatory: r['@_justificationMandatory'] === 'true',
  }));

  return {
    properties,
    exemption_reasons,
    system_check_variant:
      properties.systemCheckVariant != null
        ? String(properties.systemCheckVariant)
        : null,
  };
}

export interface AtcWorklistResult {
  worklist_id: string | null;
  worklist_timestamp: string | null;
  object_set_is_complete: boolean | null;
  objects: any[];
  findings: any[];
}

/** Flatten an ATC worklist XML into object summaries + a findings array. */
export function parseAtcWorklist(worklistXml: string): AtcWorklistResult {
  const parsed = parseAtcXml(worklistXml);
  const worklist = parsed?.worklist;
  const objects = asArray<any>(worklist?.objects?.object);
  const findings: any[] = [];
  const objectSummaries: any[] = [];

  for (const obj of objects) {
    const objFindings = asArray<any>(obj.findings?.finding);
    objectSummaries.push({
      name: obj['@_name'],
      type: obj['@_type'],
      object_type_id: obj['@_objectTypeId'],
      package: obj['@_packageName'],
      uri: obj['@_uri'],
      author: obj['@_author'],
      finding_count: objFindings.length,
    });
    for (const f of objFindings) {
      const link = f.link ? (f.link['@_href'] ?? null) : null;
      findings.push({
        object_name: obj['@_name'],
        object_type: obj['@_type'],
        priority: Number(f['@_priority'] ?? 0),
        check_id: f['@_checkId'],
        check_title: f['@_checkTitle'],
        message_id: f['@_messageId'],
        message_title: f['@_messageTitle'],
        uri: f['@_uri'],
        location: f['@_location'],
        processor: f['@_processor'] || null,
        last_changed_by: f['@_lastChangedBy'] || null,
        quickfix_info: f['@_quickfixInfo'] || null,
        link,
        exemption_approval: f['@_exemptionApproval'] || null,
        exemption_kind: f['@_exemptionKind'] || null,
      });
    }
  }
  findings.sort((a, b) => a.priority - b.priority);

  return {
    worklist_id: worklist?.['@_id'] ?? null,
    worklist_timestamp: worklist?.['@_timestamp'] ?? null,
    object_set_is_complete:
      worklist?.['@_objectSetIsComplete'] != null
        ? worklist['@_objectSetIsComplete'] === 'true' ||
          worklist['@_objectSetIsComplete'] === true
        : null,
    objects: objectSummaries,
    findings,
  };
}

/** Summarize findings by priority (priority_1: n, ...). */
export function findingsByPriority(findings: any[]): Record<string, number> {
  const byPriority: Record<string, number> = {};
  for (const f of findings) {
    const key = `priority_${f.priority}`;
    byPriority[key] = (byPriority[key] ?? 0) + 1;
  }
  return byPriority;
}

/** Build the ATC run request XML for one or more object URIs. */
export function buildAtcRunBody(
  objectUris: string[],
  maxResults: number,
): string {
  const refs = objectUris
    .map((u) => `        <adtcore:objectReference adtcore:uri="${u}"/>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<atc:run maximumVerdicts="${maxResults}" xmlns:atc="http://www.sap.com/adt/atc">
  <objectSets xmlns:adtcore="http://www.sap.com/adt/core">
    <objectSet kind="inclusive">
      <adtcore:objectReferences>
${refs}
      </adtcore:objectReferences>
    </objectSet>
  </objectSets>
</atc:run>`;
}
