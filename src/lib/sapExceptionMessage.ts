/**
 * Carry SAP's own explanation of a failed ADT request in error.message.
 *
 * WHY THIS EXISTS (2026-10-13): over RFC the dependency throws a plain Error
 * whose message is only `Request failed with status N: GET <uri>`. The ADT
 * exception XML that says WHY — e.g. a 406 naming the content type the
 * resource accepts — sits on error.response.data, and everything that reports
 * error.message dropped it: handlers that format `error.message` directly
 * (GetInclude), and return_error, which reads response.data only for an
 * AxiosError. A bare 400 on GetInclude took a throwaway probe to diagnose.
 *
 * Appends rather than replaces, so the status prefix that callers and logs
 * match on stays where it was. Only ADT `<exc:exception>` bodies are read:
 * an HTML error page has its own reducer (sapErrorPage.ts), and a body that
 * is neither is left for return_error to forward as it always has.
 */
import { XMLParser } from 'fast-xml-parser';

const MARKER = ' — SAP: ';
const EMPTY_T100 = /^[A-Z]?::\d*$/;

function text(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'object') return text((node as any)['#text']);
  return String(node).trim();
}

/** `message [T100-ID/NO]` from an ADT exception body, or undefined. */
export function sapExceptionText(body: unknown): string | undefined {
  if (typeof body !== 'string' || !body.includes('<exc:exception')) {
    return undefined;
  }
  let exception: any;
  try {
    exception = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: false, // T100 number "044" must stay a string
    }).parse(body)?.['exc:exception'];
  } catch {
    return undefined;
  }
  // A missing PROGRAM or INCLUDE answers 404 with `I::000` — a T100 message
  // with no class, i.e. no text at all. The exception type is then the only
  // thing SAP said (measured 2026-10-13; a missing CLASS gets a real sentence).
  const raw = text(exception?.message) || text(exception?.localizedMessage);
  const message = EMPTY_T100.test(raw) ? text(exception?.type?.['@_id']) : raw;
  if (!message) return undefined;

  const entries = [exception?.properties?.entry ?? []].flat();
  const entry = (key: string) =>
    text(entries.find((e: any) => e?.['@_key'] === key));
  const id = entry('T100KEY-ID');
  const no = entry('T100KEY-NO');
  return id && no ? `${message} [${id}/${no}]` : message;
}

export function annotateSapException<T>(error: T): T {
  if (!(error instanceof Error)) return error;
  if (error.message.includes(MARKER)) return error;
  const explanation = sapExceptionText((error as any).response?.data);
  if (explanation) error.message = `${error.message}${MARKER}${explanation}`;
  return error;
}
