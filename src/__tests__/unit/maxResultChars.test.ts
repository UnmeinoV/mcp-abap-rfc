import {
  MAX_RESULT_CHARS_META_KEY,
  parseMaxResultChars,
  toolResultMeta,
} from '../../lib/config/maxResultChars';

describe('parseMaxResultChars', () => {
  it('is off when unset or blank', () => {
    expect(parseMaxResultChars(undefined)).toBeUndefined();
    expect(parseMaxResultChars('  ')).toBeUndefined();
  });

  it('accepts a positive integer up to the client ceiling', () => {
    expect(parseMaxResultChars('200000')).toBe(200_000);
    expect(parseMaxResultChars('500000')).toBe(500_000);
  });

  it('rejects values the client would ignore or cap, naming the option', () => {
    for (const bad of ['0', '-1', '1.5', 'abc', '500001']) {
      expect(() => parseMaxResultChars(bad)).toThrow('--max-result-chars');
    }
  });
});

describe('toolResultMeta', () => {
  it('declares the Claude result-size key when configured', () => {
    expect(toolResultMeta({ MCP_MAX_RESULT_CHARS: '200000' })).toEqual({
      [MAX_RESULT_CHARS_META_KEY]: 200_000,
    });
    expect(MAX_RESULT_CHARS_META_KEY).toBe('anthropic/maxResultSizeChars');
  });

  it('adds nothing by default', () => {
    expect(toolResultMeta({})).toBeUndefined();
  });
});
