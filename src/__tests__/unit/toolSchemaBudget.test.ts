/**
 * Budget for the tool-schema surface — the fixed cost every request pays.
 *
 * WHY (field report round 7, F-10). Measured on their build: `readonly,high` shipped
 * ~229,865 characters of tool schema, about 57,000 tokens, before a single tool
 * was called. It got there honestly — every round of that engagement ADDED
 * prose to descriptions, and most of it was asked for, including the
 * `check_variant` paragraph that stops a silent fallback to DEFAULT. But it
 * accrues, and nothing in the process noticed.
 *
 * Their ask was a budget WITH A TEST, and the reason they gave for the test is
 * the reason this file exists rather than a guideline: *"A test is what stops
 * the drift; review has already failed to."*
 *
 * HOW THIS IS A RATCHET, NOT A WALL. 1,500 characters is the target for a tool
 * definition on the wire. 63 tools exceed it today, and rewriting all 63 in one
 * round would be a large, risky diff over descriptions that are load-bearing.
 * So they are listed by name below. The list is the debt, and the test enforces
 * two things about it: a tool NOT on it may not cross the budget, and a name may
 * only ever be REMOVED from it. That makes today the high-water mark.
 *
 * `notes` does not count. It is not sent over the wire (see `ToolDefinition`),
 * so moving a mechanism paragraph out of `description` and into `notes` both
 * pays the budget and keeps the documentation — that is the split the reporter
 * proposed, and it is how `RunAtc` and `SearchSource` came
 * down.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const HANDLERS_ROOT = path.resolve(__dirname, '../../handlers');

/** Target for one tool definition, excluding `notes`. */
const PER_TOOL_BUDGET = 1500;

/**
 * Total wire-visible schema across every tool. Today's figure plus a little
 * headroom for a genuinely new tool — not room for existing ones to grow.
 *
 * Raised 2026-09-22 for six genuinely new tools in one round (UpdateClassMethod,
 * GetClassMethods, GetClassMethod, LintSourceLocal, GetFeatureToggle,
 * GetKnowledgeTransferDoc) — not because any existing tool grew.
 * Raised 2026-11-03 for one genuinely new tool (MergeTransport).
 * Raised 2026-11-05 for three genuinely new tools (GetTranslation,
 * UpdateTranslation, SetupTranslationHelper).
 * Raised 2026-11-05 for one genuinely new tool (AddTranslationToTransport).
 * Raised 2026-11-05 for two genuinely new tools (GetTextElements, UpdateTextElements).
 * Raised 2026-11-05 for three genuinely new tools (CreateTransaction,
 * DeleteTransaction, SetupTransactionHelper).
 */
const TOTAL_BUDGET = 424_000;

/**
 * Tools over budget as of 2026-08-26. NAMES MAY ONLY BE REMOVED FROM THIS LIST.
 * If a change puts a tool over budget, move its background into `notes` rather
 * than adding a line here.
 */
const OVER_BUDGET_TODAY: readonly string[] = [
  'ActivateObjects',
  'CheckClassLow',
  'CheckObjectLow',
  'CheckStructureLow',
  'CheckTableLow',
  'CheckViewLow',
  'CreateAccessControl',
  'CreateBehaviorDefinitionLow',
  'CreateBehaviorImplementationLow',
  'CreateClassLow',
  'CreateDataElement',
  'CreateDataElementLow',
  'CreateDomain',
  'CreateFunctionGroupLow',
  'CreateFunctionModuleLow',
  'CreateInterfaceLow',
  'CreateMetadataExtensionLow',
  'CreatePackage',
  'CreatePackageLow',
  'CreateProgram',
  'CreateProgramLow',
  'CreateServiceBinding',
  'CreateStructure',
  'CreateStructureLow',
  'CreateTableIndex',
  'CreateTableType',
  'CreateUnitTest',
  'CreateViewLow',
  'GenerateRepoObjects',
  'GetFunctionModule',
  'GetMessageClass',
  'GetNodeStructureLow',
  'GetVirtualFoldersLow',
  'GetWhereUsed',
  'LockObjectLow',
  'RunAtc',
  'RunClassUnitTestsLow',
  'RuntimeRunClass',
  'RuntimeRunClassWithProfiling',
  'RuntimeRunProgram',
  'RunUnitTest',
  'SearchSource',
  'SetTableTechnicalSettings',
  'UnlockObjectLow',
  'UpdateBehaviorDefinitionLow',
  'UpdateBehaviorImplementation',
  'UpdateClassTestClassesLow',
  'UpdateDataElement',
  'UpdateDataElementLow',
  'UpdateDomain',
  'UpdateFunctionModule',
  'UpdateFunctionModuleLow',
  'UpdateMessageClass',
  'UpdatePackageLow',
  'UpdateStructure',
  'UpdateTableIndex',
  'UpdateTableLow',
  'ValidateBehaviorDefinitionLow',
  'ValidateBehaviorImplementationLow',
  'ValidateClassLow',
  'ValidateObjectLow',
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

interface ToolSize {
  name: string;
  wire: number;
}

function measure(): ToolSize[] {
  const sizes: ToolSize[] = [];
  for (const file of walk(HANDLERS_ROOT)) {
    const src = fs.readFileSync(file, 'utf-8');
    const block = src.match(
      /export const TOOL_DEFINITION = \{[\s\S]*?\n\} as const;/,
    );
    if (!block) continue;
    const name = src.match(/name: '([^']+)'/)?.[1];
    if (!name) continue;
    // `notes` never reaches the wire, so it never counts against the budget.
    const notes = block[0].match(/notes: `[\s\S]*?`,/)?.[0] ?? '';
    sizes.push({ name, wire: block[0].length - notes.length });
  }
  return sizes;
}

const sizes = measure();

describe('tool schema budget', () => {
  it('finds the tool definitions (guards against a broken scan)', () => {
    expect(sizes.length).toBeGreaterThan(300);
  });

  it('no NEW tool exceeds the per-tool budget', () => {
    const offenders = sizes
      .filter((t) => t.wire > PER_TOOL_BUDGET)
      .filter((t) => !OVER_BUDGET_TODAY.includes(t.name))
      .map((t) => `${t.name} (${t.wire} > ${PER_TOOL_BUDGET})`);
    expect(offenders).toEqual([]);
  });

  it('the over-budget list only shrinks', () => {
    // A name still listed that is now under budget is not a failure — it is
    // progress, and the message says to delete the line.
    const stillOver = new Set(
      sizes.filter((t) => t.wire > PER_TOOL_BUDGET).map((t) => t.name),
    );
    const nowUnderBudget = OVER_BUDGET_TODAY.filter((n) => !stillOver.has(n));
    if (nowUnderBudget.length > 0) {
      throw new Error(
        `These tools are now within budget — remove them from OVER_BUDGET_TODAY: ${nowUnderBudget.join(', ')}`,
      );
    }
  });

  it('the total wire-visible surface stays within budget', () => {
    const total = sizes.reduce((sum, t) => sum + t.wire, 0);
    expect(total).toBeLessThanOrEqual(TOTAL_BUDGET);
  });
});
