/**
 * Two round-3 asks that are both "parse and forward, do not dump":
 *   K-5 — an SAP ICF HTML error page arrived unparsed, up to 10.8 KB of markup
 *         per failure, nine times in one session.
 *   K-2 — an ATC check variant name was echoed back where a caller reads a
 *         verdict, and a name that does not exist runs the system default.
 */

import {
  describeUnknownVariant,
  isPlausibleVariantName,
} from '../../lib/atcCheckVariant';
import {
  describeSapErrorPage,
  isSapErrorPage,
  parseSapErrorPage,
} from '../../lib/sapErrorPage';

/** Shaped like the page SAP's ICF error handler emits, with its usual padding. */
const ERROR_PAGE = `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">
<html><head><title>Application Server Error</title>
<style type="text/css">body { font-family: Arial; } .head { color: #444; }
table.diag td { padding: 3px; }</style>
<script type="text/javascript">function noop(){ return 0; }</script>
</head><body>
<h1>The following error text was processed in the system DM2 : Screen output without connection to user.</h1>
<table class="diag">
<tr><th>Error code</th><td>ICF-IE-http-c:310-l:E-T:100</td></tr>
<tr><th>Termination occurred in the ABAP program</th><td>SAPMHTTP</td></tr>
<tr><th>HTTP 500</th><td>Internal Server Error</td></tr>
</table>
</body></html>`;

describe('isSapErrorPage', () => {
  it('recognises an HTML page and rejects XML and non-strings', () => {
    expect(isSapErrorPage(ERROR_PAGE)).toBe(true);
    expect(isSapErrorPage('<?xml version="1.0"?><exc:exception/>')).toBe(false);
    expect(isSapErrorPage({ not: 'a string' })).toBe(false);
    expect(isSapErrorPage(undefined)).toBe(false);
  });
});

describe('parseSapErrorPage', () => {
  const page = parseSapErrorPage(ERROR_PAGE);

  it('extracts the sentence, the error code and the program', () => {
    expect(page.message_text).toContain(
      'Screen output without connection to user',
    );
    expect(page.error_code).toBe('ICF-IE-http-c:310-l:E-T:100');
    expect(page.program).toBe('SAPMHTTP');
  });

  it('keeps CSS and script out of the excerpt', () => {
    // The excerpt exists so a caller sees context without the stylesheet; if
    // the furniture leaks back in, the whole point is lost.
    expect(page.excerpt).not.toContain('font-family');
    expect(page.excerpt).not.toContain('function noop');
  });

  it('produces an excerpt far smaller than the page', () => {
    expect(page.excerpt.length).toBeLessThan(ERROR_PAGE.length / 2);
  });
});

describe('describeSapErrorPage', () => {
  it('builds a one-line message and says where it came from', () => {
    const described = describeSapErrorPage(
      { response: { status: 500, data: ERROR_PAGE } },
      'RuntimeRunProgram',
    );
    expect(described?.message).toContain('RuntimeRunProgram failed (HTTP 500)');
    expect(described?.message).toContain('ICF-IE-http-c:310-l:E-T:100');
    expect(described?.message).toContain('SAPMHTTP');
    expect(described?.message).toContain('HTML error page');
  });

  it('returns undefined for a normal ADT XML fault, so callers fall through', () => {
    expect(
      describeSapErrorPage(
        { response: { status: 400, data: '<?xml version="1.0"?><exc/>' } },
        'RuntimeRunProgram',
      ),
    ).toBeUndefined();
  });
});

describe('isPlausibleVariantName', () => {
  it('accepts real variant names seen in SCICHKV_HD', () => {
    for (const name of [
      'DEFAULT',
      'ZMY_CHECK_VARIANT',
      'CDS_RANK',
      'SAP_COM_DB_ORDER_AND_CLUSTER',
    ]) {
      expect(isPlausibleVariantName(name)).toBe(true);
    }
  });

  it('rejects anything that could not be an object name', () => {
    // The name reaches a WHERE clause, so it is rejected rather than escaped.
    for (const name of [
      "X' OR '1'='1",
      'has space',
      '',
      'A'.repeat(31),
      'semi;colon',
    ]) {
      expect(isPlausibleVariantName(name)).toBe(false);
    }
  });
});

describe('describeUnknownVariant', () => {
  it('explains the silent fallback, which is the reason for refusing', () => {
    const text = describeUnknownVariant('ZNO_SUCH_VARIANT_XX');
    expect(text).toContain('ZNO_SUCH_VARIANT_XX');
    expect(text).toContain('SCICHKV_HD');
    expect(text).toContain('silently falls back');
    // A caller must be told the way forward, not just the refusal.
    expect(text).toContain('omit check_variant');
  });
});
