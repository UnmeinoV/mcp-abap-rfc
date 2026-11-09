import { parseExpositionValue } from '../../lib/config/ServerConfigManager';

describe('--exposition', () => {
  it('accepts the valid set names, trimming blanks', () => {
    expect(parseExpositionValue('readonly, high')).toEqual([
      'readonly',
      'high',
    ]);
    expect(parseExpositionValue('readonly,high,low,compact')).toEqual([
      'readonly',
      'high',
      'low',
      'compact',
    ]);
    expect(parseExpositionValue(undefined)).toEqual([]);
    expect(parseExpositionValue('')).toEqual([]);
  });

  it('refuses an unknown set name, naming it and the valid values', () => {
    expect(() => parseExpositionValue('readonly,hihg')).toThrow(
      'Unknown --exposition set "hihg": valid values are readonly, high, low, compact.',
    );
    expect(() => parseExpositionValue('search,system')).toThrow(
      /"search", "system"/,
    );
    // Case matters: the groups are matched exactly.
    expect(() => parseExpositionValue('High')).toThrow(/"High"/);
  });
});
