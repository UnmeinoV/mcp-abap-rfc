/**
 * An RFC system addressed as application server + instance number instead of
 * a URL: `SAP_ASHOST` + `SAP_SYSNR`.
 *
 * WHY: an RFC connection never uses the URL as a URL. The dependency's
 * `RfcAbapConnection` takes `ashost` from its hostname and `sysnr` from
 * SAP_SYSNR or the port (80XX -> XX). Behind a SAProuter the HTTP port is not
 * even reachable, so `SAP_URL=http://<ip>:8000` is a fiction that encodes the
 * two values SAP Logon actually shows: the server and the instance number.
 *
 * HOW: the dependency's connection is still built from a URL, so it is
 * DERIVED from the two keys (`rfcServiceUrl`, used by rfcEnv.ts) —
 * `http://<ashost>:80<sysnr>`, which the dependency turns back into exactly
 * that ashost and sysnr.
 *
 * Refused, never guessed:
 *  - SAP_ASHOST without SAP_CONNECTION_TYPE=rfc: HTTP needs the real ICM port,
 *    and 80XX is only a convention.
 *  - SAP_ASHOST without SAP_SYSNR: the instance number is the half the user
 *    is replacing the port with; defaulting it to 00 would connect to whatever
 *    answers there.
 *  - SAP_URL and SAP_ASHOST naming different hosts: one of them would be
 *    silently ignored.
 */

export type EnvValues = Record<string, string | undefined>;

const SYSNR = /^\d{2}$/;
// A hostname or IPv4 address — no scheme, port, path or credentials.
const HOST = /^[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$/;

function value(env: EnvValues, key: string): string | undefined {
  const v = env[key]?.trim();
  return v ? v : undefined;
}

/**
 * Throws a message naming the key when SAP_ASHOST/SAP_SYSNR are present but
 * unusable. A no-op when SAP_ASHOST is absent.
 */
export function assertRfcAddress(
  env: EnvValues,
  source = 'the env file',
  /** Where a REFUSED key's value came from (the file or the shell); default `(in <source>)`. */
  refusedAt?: (key: string) => string,
): void {
  const ashost = value(env, 'SAP_ASHOST');
  if (!ashost) return;
  const where = ` (in ${source})`;
  const at = (key: string): string => (refusedAt ? refusedAt(key) : where);
  // The file may leave the connection type to the shell or --connection-type
  // (which the launcher copies into process.env before any broker is built).
  const connectionType =
    value(env, 'SAP_CONNECTION_TYPE') ??
    process.env.SAP_CONNECTION_TYPE?.trim();
  if (connectionType?.toLowerCase() !== 'rfc') {
    throw new Error(
      `SAP_ASHOST${where} addresses an RFC system, but SAP_CONNECTION_TYPE is not "rfc". ` +
        'Set SAP_CONNECTION_TYPE=rfc, or use SAP_URL with the real HTTP(S) port for an HTTP connection.',
    );
  }
  if (!HOST.test(ashost)) {
    throw new Error(
      `SAP_ASHOST=${ashost}${at('SAP_ASHOST')} is not a host name or IP address. ` +
        'Give only the application server (e.g. 10.0.0.5) — no http://, port or path.',
    );
  }
  const sysnr = value(env, 'SAP_SYSNR');
  if (!sysnr) {
    throw new Error(
      `SAP_ASHOST${where} needs SAP_SYSNR, the two-digit instance number (SAP Logon "Instance Number", e.g. 00).`,
    );
  }
  if (!SYSNR.test(sysnr)) {
    throw new Error(
      `SAP_SYSNR=${sysnr}${at('SAP_SYSNR')} must be two digits (e.g. 00).`,
    );
  }
  const url = value(env, 'SAP_URL');
  if (url) {
    let host: string | undefined;
    try {
      host = new URL(url).hostname;
    } catch {
      host = undefined;
    }
    if (host?.toLowerCase() !== ashost.toLowerCase()) {
      throw new Error(
        `SAP_URL=${url} and SAP_ASHOST=${ashost}${where} name different servers. ` +
          'Keep one: for RFC, SAP_ASHOST + SAP_SYSNR is enough.',
      );
    }
  }
}

/** The URL an RFC connection is built from, derived from SAP_ASHOST + SAP_SYSNR. */
export function rfcServiceUrl(ashost: string, sysnr: string): string {
  return `http://${ashost.trim()}:80${sysnr.trim()}`;
}
