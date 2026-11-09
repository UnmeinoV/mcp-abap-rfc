/**
 * Method-level surgery for ABAP class source (F-5 / K-8: "UpdateClassMethod / anchored patch").
 *
 * WHY THIS FILE EXISTS
 * ---------------------
 * `UpdateClass` only ever took a full `source_code` string. A reporting project measured 325
 * `Update*` calls carrying 3.00 MB of source in one session, with its largest classes re-sent
 * whole for four-line method-body changes (CLAUDE.md, F-5 / K-8). This file is the read (find a
 * method's boundaries / body) and write (replace one method's body in place) half of the fix.
 *
 * SCOPE, DELIBERATELY NARROW
 * --------------------------
 * This only ever touches the IMPLEMENTATION side of a class — the `METHOD x. ... ENDMETHOD.`
 * block — and only the BODY between those two statements. It never rewrites the DEFINITION
 * section (the `METHODS`/`CLASS-METHODS` declaration), so it cannot change a signature, add or
 * remove a method, or move one between visibility sections. Those are a materially different
 * (and materially riskier) kind of edit — reconstructing a chained `METHODS: a, b.` declaration
 * correctly requires reasoning about which comma is a chain separator, and getting that wrong
 * would corrupt a class that the anchored-patch caller never intended to touch there at all. A
 * body-only patch cannot corrupt anything outside the two statements it locates, because ABAP
 * disallows a nested METHOD/ENDMETHOD block: the boundaries are unambiguous once found.
 *
 * HOW METHOD BOUNDARIES ARE FOUND
 * --------------------------------
 * ABAP statements end at an unquoted `.` followed by whitespace/EOF (not a `.` inside a string
 * literal, a string template `|...|`, or a decimal number, and not one commented out). This file
 * tokenizes the source into statements on exactly that rule (see `splitStatements`), so a `.`
 * inside `lv_x = 'a.b'.` or `|price: { lv_amount }.|` does not fool it. Within the target class's
 * `CLASS <name> IMPLEMENTATION. ... ENDCLASS.` block, `METHOD <name>.` / `ENDMETHOD.` statement
 * pairs are matched by simple nesting depth — METHOD blocks cannot nest, so depth alone is
 * sufficient and there is no need for a full ABAP grammar.
 *
 * Method-name matching is case-insensitive (ABAP identifiers are case-insensitive) and the
 * interface-implementation form (`if_x~method_name`) is a normal identifier here — the `~` is
 * just another name character as far as this file is concerned.
 */

export interface StatementSpan {
  /** Statement text, including its own leading indentation but not surrounding blank lines. */
  text: string;
  /** 0-based index of the first line of this statement in the source. */
  startLine: number;
  /** 0-based index of the last line of this statement in the source. */
  endLine: number;
}

/**
 * Split ABAP source into statements on an unquoted, uncommented `.` followed by
 * whitespace/EOF. Tracks string literals (`'...'`, doubled `''` escape), string templates
 * (`|...|`, `\|` escape), and comments (`*` in column 1 = whole-line comment; `"` outside a
 * literal = rest-of-line comment) so a period inside any of those never splits a statement.
 */
export function splitStatements(source: string): StatementSpan[] {
  const lines = source.split(/\r\n|\r|\n/);
  const statements: StatementSpan[] = [];
  let buf: string[] = [];
  let startLine = 0;
  // True once `buf` holds at least one entry for the statement currently being accumulated.
  // Distinct from `buf.length === 0`: a split that lands exactly at end-of-line leaves nothing
  // to push for that line, and that must NOT be mistaken for "the next statement already
  // started here" — `started` only flips true when real content (possibly an empty string
  // placeholder for a genuinely blank line inside a multi-line statement) is actually pushed.
  let started = false;
  let inString = false; // inside '...'
  let inTemplate = false; // inside |...|

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    // A whole-line comment (ABAP: '*' in column 1) never participates in statement text and
    // never terminates a statement — treat it as if the line were blank for splitting purposes.
    if (!inString && !inTemplate && /^\*/.test(line)) {
      continue;
    }

    let cur = '';
    let i = 0;
    while (i < line.length) {
      const ch = line[i];

      if (inString) {
        cur += ch;
        if (ch === "'") {
          // '' inside a string literal is an escaped quote, not the closing quote.
          if (line[i + 1] === "'") {
            cur += "'";
            i += 2;
            continue;
          }
          inString = false;
        }
        i++;
        continue;
      }

      if (inTemplate) {
        cur += ch;
        if (ch === '\\' && line[i + 1] === '|') {
          cur += '|';
          i += 2;
          continue;
        }
        if (ch === '|') inTemplate = false;
        i++;
        continue;
      }

      if (ch === '"') {
        // Rest-of-line comment outside any literal — stop scanning this line's code.
        break;
      }
      if (ch === "'") {
        inString = true;
        cur += ch;
        i++;
        continue;
      }
      if (ch === '|') {
        inTemplate = true;
        cur += ch;
        i++;
        continue;
      }
      if (ch === '.') {
        // A statement-terminating period is followed by whitespace or end of line. A decimal
        // literal's period ("1.5") is followed by another digit, which alone disambiguates it —
        // no need to also inspect the character before the period.
        const next = line[i + 1];
        if (next === undefined || /\s/.test(next)) {
          cur += ch;
          if (!started) startLine = lineIdx;
          buf.push(cur);
          statements.push({
            text: buf.join('\n'),
            startLine,
            endLine: lineIdx,
          });
          buf = [];
          cur = '';
          started = false;
          i++;
          continue;
        }
      }
      cur += ch;
      i++;
    }

    // Only credit this line to the in-progress statement when there is something to credit:
    // real trailing content, or a blank line that is genuinely inside an already-multi-line
    // statement. A line that ended exactly on a split (cur === '' and nothing had started here
    // yet) contributes nothing and must not make the NEXT statement think it began on this line.
    if (cur.trim().length > 0 || started) {
      if (!started) startLine = lineIdx;
      buf.push(cur);
      started = true;
    }
  }

  // Trailing content with no terminating period (malformed source, or a dangling fragment) is
  // not silently dropped — surfaced as a final unterminated statement so callers can see it
  // rather than have the last method quietly lose its close.
  const remainder = buf.join('\n');
  if (remainder.trim().length > 0) {
    statements.push({
      text: remainder,
      startLine,
      endLine: lines.length - 1,
    });
  }

  return statements;
}

function firstWord(statementText: string): string {
  return (statementText.trim().split(/\s+/)[0] ?? '').replace(/\.$/, '');
}

/** True when a statement is `KEYWORD <name>.` (whitespace-normalised, case-insensitive keyword). */
function matchesKeywordName(
  statementText: string,
  keyword: string,
): string | null {
  const trimmed = statementText.trim().replace(/\.\s*$/, '');
  const re = new RegExp(`^${keyword}\\s+(\\S+)$`, 'i');
  const m = re.exec(trimmed);
  return m ? m[1] : null;
}

export interface MethodBlock {
  name: string;
  /** 0-based line of the `METHOD <name>.` statement. */
  headerLine: number;
  /** 0-based line of the `ENDMETHOD.` statement. */
  footerLine: number;
  /** 0-based first line of the body (the line after `METHOD <name>.`). */
  bodyStartLine: number;
  /** 0-based last line of the body (the line before `ENDMETHOD.`). Body may be empty. */
  bodyEndLine: number;
}

export interface ImplementationBlock {
  /** The local class name from `CLASS <name> IMPLEMENTATION.` (may differ from a global class's
   * own name inside a CCIMP-style include holding a local class, though the common case — a
   * global class's own main source — has them equal). */
  className: string;
  headerLine: number;
  footerLine: number;
  methods: MethodBlock[];
}

/**
 * Find every `CLASS <x> IMPLEMENTATION. ... ENDCLASS.` block in source and, within each, every
 * `METHOD <y>. ... ENDMETHOD.` pair. METHOD blocks cannot nest in ABAP, so a simple depth counter
 * inside each IMPLEMENTATION block is sufficient — no grammar needed.
 */
export function findImplementationBlocks(
  source: string,
): ImplementationBlock[] {
  const statements = splitStatements(source);
  const blocks: ImplementationBlock[] = [];

  const implementationHeaderRe = /^CLASS\s+(\S+)\s+IMPLEMENTATION\s*\.$/i;

  let i = 0;
  while (i < statements.length) {
    const stmt = statements[i];
    const headerMatch = implementationHeaderRe.exec(stmt.text.trim());
    if (!headerMatch) {
      i++;
      continue;
    }
    const implName = headerMatch[1];

    const methods: MethodBlock[] = [];
    let j = i + 1;
    let openMethod: {
      name: string;
      headerLine: number;
      bodyStart: number;
    } | null = null;
    let footerLine = stmt.endLine;
    for (; j < statements.length; j++) {
      const s = statements[j];
      const word = firstWord(s.text).toUpperCase();

      if (!openMethod) {
        if (word === 'ENDCLASS') {
          footerLine = s.endLine;
          j++;
          break;
        }
        if (word === 'METHOD') {
          const name = matchesKeywordName(s.text, 'METHOD');
          if (name) {
            openMethod = {
              name,
              headerLine: s.endLine,
              bodyStart: s.endLine + 1,
            };
          }
        }
        continue;
      }

      // Inside an open METHOD block: only ENDMETHOD closes it. Everything else, including a
      // literal string that happens to start with the word "endclass", is body content — we are
      // scanning STATEMENTS here (already comment/string-aware), so this is safe.
      if (word === 'ENDMETHOD') {
        methods.push({
          name: openMethod.name,
          headerLine: openMethod.headerLine,
          footerLine: s.startLine,
          bodyStartLine: openMethod.bodyStart,
          bodyEndLine: s.startLine - 1,
        });
        openMethod = null;
      }
    }

    blocks.push({
      className: implName,
      headerLine: stmt.startLine,
      footerLine,
      methods,
    });
    i = j;
  }

  return blocks;
}

export interface FoundMethod extends MethodBlock {
  implementationClassName: string;
}

/**
 * Locate one method by name within the (usually single) IMPLEMENTATION block whose class name
 * matches `className`, case-insensitively. Falls back to searching ALL implementation blocks in
 * the source when no block matches `className` exactly (covers CCIMP includes where the local
 * class inside the include is not literally the global class name) — but only when that search
 * finds the method in exactly one block; an ambiguous match is reported as not found rather than
 * guessed.
 */
export function findMethod(
  source: string,
  className: string,
  methodName: string,
): FoundMethod | null {
  const blocks = findImplementationBlocks(source);
  const wantClass = className.toUpperCase();
  const wantMethod = methodName.toUpperCase();

  const inNamedClass = blocks.filter(
    (b) => b.className.toUpperCase() === wantClass,
  );
  const searchIn = inNamedClass.length > 0 ? inNamedClass : blocks;

  const hits: FoundMethod[] = [];
  for (const block of searchIn) {
    for (const m of block.methods) {
      if (m.name.toUpperCase() === wantMethod) {
        hits.push({ ...m, implementationClassName: block.className });
      }
    }
  }

  if (hits.length === 1) return hits[0];
  return null;
}

/** Every method name found across all IMPLEMENTATION blocks (for a helpful "not found" list). */
export function listAllMethodNames(source: string): string[] {
  const names: string[] = [];
  for (const block of findImplementationBlocks(source)) {
    for (const m of block.methods) names.push(m.name);
  }
  return names;
}

/**
 * Extract one method's implementation body as text (lines between `METHOD x.` and `ENDMETHOD.`,
 * exclusive of both). Returns `null` when the body is empty (a method with no statements).
 */
export function extractMethodBody(
  source: string,
  method: MethodBlock,
): string | null {
  const lines = source.split(/\r\n|\r|\n/);
  if (method.bodyEndLine < method.bodyStartLine) return null;
  return lines.slice(method.bodyStartLine, method.bodyEndLine + 1).join('\n');
}

/**
 * Replace one method's body in place, leaving everything else in the source — including the
 * `METHOD x.` / `ENDMETHOD.` lines themselves, the DEFINITION section, and every other method —
 * byte-identical. `newBody` is inserted verbatim (the caller owns indentation).
 */
export function spliceMethodBody(
  source: string,
  method: MethodBlock,
  newBody: string,
): string {
  const lines = source.split(/\r\n|\r|\n/);
  const before = lines.slice(0, method.headerLine + 1);
  const after = lines.slice(method.footerLine);
  const bodyLines = newBody.length > 0 ? newBody.split(/\r\n|\r|\n/) : [];
  return [...before, ...bodyLines, ...after].join('\n');
}

// ─── DEFINITION-section visibility (read-only; the write path above never touches this) ───

export type MethodVisibility = 'public' | 'protected' | 'private' | 'unknown';

export interface MethodDeclaration {
  name: string;
  visibility: MethodVisibility;
  isStatic: boolean;
  isRedefinition: boolean;
  /** Why visibility is 'unknown' — only set when it is. */
  unknownReason?: string;
}

const SECTION_RE = /^(PUBLIC|PROTECTED|PRIVATE)\s+SECTION\s*\.$/i;

/**
 * Best-effort map of method name (upper-cased) -> declaration, read from a class's DEFINITION
 * section. Deliberately conservative: a method this cannot account for gets `visibility:
 * 'unknown'` with a reason, rather than a guess — a wrong-but-plausible visibility is the exact
 * shape of defect this project refuses to ship (see the standing "caller cannot tell success
 * from vacuum" class in CLAUDE.md).
 *
 * Handles: a plain `METHODS foo ...` / `CLASS-METHODS foo ...` statement, and a colon-chained
 * `METHODS: a ..., b ....` statement — ABAP's chain syntax repeats the keyword before each
 * comma-separated segment, so splitting on top-level commas and re-prefixing the keyword
 * recovers each method exactly (METHODS/CLASS-METHODS parameter lists are space-separated, so a
 * comma inside one never legitimately occurs).
 *
 * Does NOT resolve methods that come from `INTERFACES <intf>.` (the interface's own methods
 * are declared in the INTERFACE, not here) — those get `visibility: 'unknown'`.
 */
export function findMethodDeclarations(
  source: string,
  className: string,
): Map<string, MethodDeclaration> {
  const declarations = new Map<string, MethodDeclaration>();
  const statements = splitStatements(source);
  const definitionHeaderRe = /^CLASS\s+(\S+)\s+DEFINITION\b.*\.$/i;

  let i = 0;
  while (i < statements.length) {
    const header = definitionHeaderRe.exec(statements[i].text.trim());
    if (!header || header[1].toUpperCase() !== className.toUpperCase()) {
      i++;
      continue;
    }

    let section: MethodVisibility = 'unknown';
    let j = i + 1;
    for (; j < statements.length; j++) {
      const text = statements[j].text.trim();
      const word = firstWord(text).toUpperCase();

      if (word === 'ENDCLASS') {
        j++;
        break;
      }

      const sectionMatch = SECTION_RE.exec(text);
      if (sectionMatch) {
        section = sectionMatch[1].toLowerCase() as MethodVisibility;
        continue;
      }

      // firstWord() keeps a trailing ':' (the chain-opener form is "METHODS:"), so compare
      // against the colon-stripped form.
      const keyword = word.replace(/:$/, '');
      if (keyword !== 'METHODS' && keyword !== 'CLASS-METHODS') continue;

      const isStatic = keyword === 'CLASS-METHODS';
      // Strip the leading keyword (with its optional colon) — what remains is one or more
      // comma-separated method segments, each already carrying its own full clause.
      const withoutKeyword = text
        .replace(/^\S+:?\s*/, '')
        .replace(/\.\s*$/, '');
      const segments = withoutKeyword.split(',');
      for (const raw of segments) {
        const segment = raw.trim();
        if (!segment) continue;
        const name = segment.split(/\s+/)[0];
        if (!name) continue;
        declarations.set(name.toUpperCase(), {
          name,
          visibility: section,
          isStatic,
          isRedefinition: /\bREDEFINITION\b/i.test(segment),
        });
      }
    }
    i = j;
  }

  return declarations;
}

export interface MethodSummary {
  name: string;
  visibility: MethodVisibility;
  isStatic: boolean;
  isRedefinition: boolean;
  isInterfaceMethod: boolean;
  startLine: number;
  endLine: number;
  lineCount: number;
  hasBody: boolean;
}

/**
 * The read-side counterpart to `findMethod`: every method in the class's IMPLEMENTATION,
 * cross-referenced with its DEFINITION-section declaration where one could be found unambiguously.
 */
export function listClassMethods(
  source: string,
  className: string,
): MethodSummary[] {
  const declarations = findMethodDeclarations(source, className);
  const blocks = findImplementationBlocks(source).filter(
    (b) => b.className.toUpperCase() === className.toUpperCase(),
  );
  const searchIn =
    blocks.length > 0 ? blocks : findImplementationBlocks(source);

  const summaries: MethodSummary[] = [];
  for (const block of searchIn) {
    for (const m of block.methods) {
      const decl = declarations.get(m.name.toUpperCase());
      const isInterfaceMethod = m.name.includes('~');
      summaries.push({
        name: m.name,
        visibility: decl?.visibility ?? 'unknown',
        isStatic: decl?.isStatic ?? false,
        isRedefinition: decl?.isRedefinition ?? false,
        isInterfaceMethod,
        startLine: m.headerLine,
        endLine: m.footerLine,
        lineCount: m.footerLine - m.headerLine + 1,
        hasBody: m.bodyEndLine >= m.bodyStartLine,
      });
    }
  }
  return summaries;
}
