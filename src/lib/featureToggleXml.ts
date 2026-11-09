/**
 * Parser for the Switch Framework "feature toggle" (FTGL / discovery category `ftg2ft`) metadata
 * document and its JSON `/source/main` body.
 *
 * Ground-truthed live on DM2/310 against `SREUSE_START_SECURE` (a real, SAP-shipped toggle found
 * via `SELECT obj_name FROM tadir WHERE object = 'FTGL'`): the metadata GET on
 * `/sap/bc/adt/sfw/featuretoggles/{name}` answers `<blue:blueSource>` (the same root element
 * family other workbench objects use), and `/source/main` (Accept: application/json) answers a
 * JSON body — NOT XML — describing rollout status/strategy and free-form attributes. A bogus name
 * answers a clean `404 ExceptionResourceNotFound "Feature Toggle X does not exist."`, which is why
 * this can use the same existence-oracle pattern every other Get* handler in this project relies
 * on rather than treating an empty result as ambiguous.
 */

import { XMLParser } from 'fast-xml-parser';

export interface FeatureToggleMetadata {
  name: string;
  description?: string;
  type?: string;
  master_language?: string;
  language?: string;
  responsible?: string;
  created_at?: string;
  changed_at?: string;
}

export function parseFeatureToggleMetadata(xml: string): FeatureToggleMetadata {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  const parsed = parser.parse(xml ?? '');
  const root = parsed?.['blue:blueSource'] ?? {};
  return {
    name: String(root['@_adtcore:name'] ?? ''),
    description: root['@_adtcore:description']
      ? String(root['@_adtcore:description'])
      : undefined,
    type: root['@_adtcore:type'] ? String(root['@_adtcore:type']) : undefined,
    master_language: root['@_adtcore:masterLanguage']
      ? String(root['@_adtcore:masterLanguage'])
      : undefined,
    language: root['@_adtcore:language']
      ? String(root['@_adtcore:language'])
      : undefined,
    responsible: root['@_adtcore:responsible']
      ? String(root['@_adtcore:responsible'])
      : undefined,
    created_at: root['@_adtcore:createdAt']
      ? String(root['@_adtcore:createdAt'])
      : undefined,
    changed_at: root['@_adtcore:changedAt']
      ? String(root['@_adtcore:changedAt'])
      : undefined,
  };
}

export interface FeatureToggleContent {
  description?: string;
  lifecycle_status?: string;
  rollout_strategy?: string;
  longtext?: string;
  toggled_packages?: string[];
  related_toggles?: string[];
  attributes?: Record<string, string>;
}

/** The `/source/main` body is JSON, not XML — parsed as data, not scanned as text. */
export function parseFeatureToggleContent(json: unknown): FeatureToggleContent {
  const body = (json ?? {}) as Record<string, any>;
  const attributesList: Array<{ key?: string; value?: string }> =
    body.attributes ?? [];
  const attributes: Record<string, string> = {};
  for (const a of attributesList) {
    if (a?.key) attributes[a.key] = String(a.value ?? '');
  }
  return {
    description: body.header?.description,
    lifecycle_status: body.rollout?.lifecycleStatus,
    rollout_strategy: body.rollout?.strategy,
    longtext: body.longtext,
    toggled_packages: Array.isArray(body.toggledPackages)
      ? body.toggledPackages
      : undefined,
    related_toggles: Array.isArray(body.relatedToggles)
      ? body.relatedToggles
      : undefined,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
  };
}
