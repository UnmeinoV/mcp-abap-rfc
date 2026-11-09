/**
 * The guard's T100 read is retried once before it degrades (round 4, R4-F1).
 *
 * Measured by a reporting project over 109 consecutive translation writes: this
 * read failed on 5 of them (4.6%), scattered across the run, same class and
 * session, with their own direct reads of those exact rows succeeding in the
 * same period. The read is idempotent and the write has already happened by the
 * time it runs, so a retry cannot do harm — and this read IS the safety story,
 * so letting it degrade to a warning is the expensive outcome.
 */

import { readT100Rows } from '../../handlers/messageclass/high/editMessageCore';

const XML = `<?xml version="1.0" encoding="utf-8"?>
<dataPreview:tableData xmlns:dataPreview="http://www.sap.com/adt/dataPreview">
  <dataPreview:totalRows>2</dataPreview:totalRows>
  <dataPreview:columns>
    <dataPreview:metadata dataPreview:name="SPRSL" dataPreview:type="C" dataPreview:description="SPRSL"/>
    <dataPreview:dataSet><dataPreview:data>E</dataPreview:data><dataPreview:data>1</dataPreview:data></dataPreview:dataSet>
  </dataPreview:columns>
  <dataPreview:columns>
    <dataPreview:metadata dataPreview:name="TEXT" dataPreview:type="C" dataPreview:description="TEXT"/>
    <dataPreview:dataSet><dataPreview:data>English</dataPreview:data><dataPreview:data>中文</dataPreview:data></dataPreview:dataSet>
  </dataPreview:columns>
</dataPreview:tableData>`;

function clientReturning(...outcomes: Array<'throw' | 'bad' | 'ok'>) {
  const getSqlQuery = jest.fn();
  for (const outcome of outcomes) {
    if (outcome === 'throw')
      getSqlQuery.mockRejectedValueOnce(
        new Error('ADT 500: Data Preview failed'),
      );
    else if (outcome === 'bad')
      getSqlQuery.mockResolvedValueOnce({ status: 500, data: '' });
    else getSqlQuery.mockResolvedValueOnce({ status: 200, data: XML });
  }
  return { client: { getUtils: () => ({ getSqlQuery }) }, getSqlQuery };
}

describe('readT100Rows', () => {
  it('reads the rows when the first attempt works — and does not retry needlessly', async () => {
    const { client, getSqlQuery } = clientReturning('ok');
    const result = await readT100Rows(client, 'ZMY_MSGCLASS', '001');
    expect(getSqlQuery).toHaveBeenCalledTimes(1);
    expect(result.rows).toEqual([
      { language: 'E', text: 'English' },
      { language: '1', text: '中文' },
    ]);
    expect(result.attempts).toBe(1);
  });

  it('THE FIX: a thrown first attempt is retried, and the retry answers', async () => {
    const { client, getSqlQuery } = clientReturning('throw', 'ok');
    const result = await readT100Rows(client, 'ZMY_MSGCLASS', '001');
    expect(getSqlQuery).toHaveBeenCalledTimes(2);
    expect(result.rows).toHaveLength(2);
    // THE TELEMETRY (round-4 follow-up): a rescued read must be distinguishable
    // from a clean one, or the endpoint's failure rate becomes unmeasurable.
    expect(result.attempts).toBe(2);
  });

  it('a non-200 first attempt is retried too', async () => {
    const { client, getSqlQuery } = clientReturning('bad', 'ok');
    const result = await readT100Rows(client, 'ZMY_MSGCLASS', '001');
    expect(result.rows).toHaveLength(2);
    expect(result.attempts).toBe(2);
    expect(getSqlQuery).toHaveBeenCalledTimes(2);
  });

  it('degrades to undefined after two failures — never to an empty row set', async () => {
    const { client, getSqlQuery } = clientReturning('throw', 'throw');
    // undefined means "could not determine". An empty array would read as "the
    // message has no T100 rows at all", which the caller would report as a
    // missing translation — a false verdict built out of a read failure.
    const result = await readT100Rows(client, 'ZMY_MSGCLASS', '001');
    expect(result.rows).toBeUndefined();
    expect(result.attempts).toBe(2);
    expect(getSqlQuery).toHaveBeenCalledTimes(2);
  });

  it('retries at most once — a write is never blocked by a stuck read', async () => {
    const { client, getSqlQuery } = clientReturning('throw', 'throw', 'ok');
    expect(
      (await readT100Rows(client, 'ZMY_MSGCLASS', '001')).rows,
    ).toBeUndefined();
    expect(getSqlQuery).toHaveBeenCalledTimes(2);
  });

  it('quotes the class name safely', async () => {
    const { client, getSqlQuery } = clientReturning('ok');
    await readT100Rows(client, "ZMY'INJECT", '001');
    expect(getSqlQuery.mock.calls[0][0].sql_query).toContain("ZMY''INJECT");
  });
});
