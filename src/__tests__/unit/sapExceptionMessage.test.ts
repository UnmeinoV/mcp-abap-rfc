/**
 * A failed ADT request must carry SAP's own explanation in error.message.
 *
 * Over RFC the dependency throws a plain Error whose message is only
 * `Request failed with status N: GET <uri>`; the ADT exception XML that says
 * WHY sits on error.response.data, and every handler that reports
 * error.message (GetInclude, and return_error for any non-Axios error) dropped
 * it. The body below is verbatim from a live 406 (2026-10-13).
 */
import { annotateSapException } from '../../lib/sapExceptionMessage';

const NOT_ACCEPTABLE_406 =
  '<?xml version="1.0" encoding="utf-8"?><exc:exception xmlns:exc="http://www.sap.com/abapxml/types/communicationframework"><namespace id="com.sap.adt"/><type id="ExceptionResourceNotAcceptable"/><message lang="EN">The message content is not acceptable. Accepted content types: application/vnd.sap.adt.functions.fincludes.v2+xml</message><localizedMessage lang="ZH">The message content is not acceptable. Accepted content types: application/vnd.sap.adt.functions.fincludes.v2+xml</localizedMessage><properties><entry key="T100KEY-ID">SADT_RESOURCE</entry><entry key="T100KEY-NO">044</entry><entry key="T100KEY-V1">application/vnd.sap.adt.functions.fincludes.v2+xml</entry></properties></exc:exception>';

const PREFIX =
  'Request failed with status 406: GET /sap/bc/adt/functions/groups/zfg_wms_jt/includes/lzfg_wms_jtf02';

function failure(body: unknown, message = PREFIX) {
  const error: any = new Error(message);
  error.response = { status: 406, statusText: '', data: body, headers: {} };
  return error;
}

describe('annotateSapException', () => {
  it("appends SAP's message and T100 key, keeping the original prefix", () => {
    const error = annotateSapException(failure(NOT_ACCEPTABLE_406));

    expect(error.message).toBe(
      `${PREFIX} — SAP: The message content is not acceptable. Accepted ` +
        'content types: application/vnd.sap.adt.functions.fincludes.v2+xml ' +
        '[SADT_RESOURCE/044]',
    );
  });

  it('is idempotent when the same error passes two wrappers', () => {
    const error = annotateSapException(
      annotateSapException(failure(NOT_ACCEPTABLE_406)),
    );
    expect(error.message.match(/— SAP:/g)).toHaveLength(1);
  });

  it('leaves the message alone without an ADT exception body', () => {
    for (const body of [
      undefined,
      '',
      '<html>Application Server Error</html>',
    ]) {
      expect(annotateSapException(failure(body)).message).toBe(PREFIX);
    }
  });

  // Verbatim live 404 for a missing PROGRAM or INCLUDE (2026-10-13): SAP's
  // text is an empty T100 placeholder; only the exception type says anything.
  it('names the exception type when the message is an empty T100 placeholder', () => {
    const body =
      '<?xml version="1.0" encoding="utf-8"?><exc:exception xmlns:exc="http://www.sap.com/abapxml/types/communicationframework"><namespace id="com.sap.adt"/><type id="ExceptionResourceNotFound"/><message lang="EN">I::000</message><localizedMessage lang="ZH">I::000</localizedMessage><properties><entry key="T100KEY-ID"/><entry key="T100KEY-NO">000</entry></properties></exc:exception>';
    expect(annotateSapException(failure(body)).message).toBe(
      `${PREFIX} — SAP: ExceptionResourceNotFound`,
    );
  });

  it('omits the T100 key when SAP sends none', () => {
    const body =
      '<exc:exception xmlns:exc="x"><message lang="EN">Object not found</message></exc:exception>';
    expect(annotateSapException(failure(body)).message).toBe(
      `${PREFIX} — SAP: Object not found`,
    );
  });

  it('passes non-Error values through untouched', () => {
    expect(annotateSapException('boom')).toBe('boom');
  });
});
