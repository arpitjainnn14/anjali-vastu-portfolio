/**
 * The only way this Worker talks to Razorpay and Cal ID. GET only: the live
 * Razorpay key can refund, and nothing here may ever write. Error messages
 * name the service and the status, never a header value.
 */

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export class ServiceError extends Error {
  constructor(
    readonly service: string,
    readonly status: number | null,
    message: string,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export type Http = {
  getJson(service: string, url: string, headers: Record<string, string>): Promise<unknown>;
};

type Options = { retries?: number; timeoutMs?: number; sleep?: (ms: number) => Promise<void> };

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function createHttp(fetchImpl: FetchLike, opts: Options = {}): Http {
  const retries = opts.retries ?? 3;
  const timeoutMs = opts.timeoutMs ?? 10_000;
  const sleep = opts.sleep ?? defaultSleep;

  return {
    async getJson(service, url, headers) {
      let lastStatus: number | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        if (attempt > 0) await sleep(500 * 2 ** (attempt - 1));

        let response: Response;
        try {
          response = await fetchImpl(url, { method: 'GET', headers, signal: AbortSignal.timeout(timeoutMs) });
        } catch {
          lastStatus = null;
          continue; // network error or timeout: retry
        }

        if (response.ok) {
          try {
            return await response.json();
          } catch {
            throw new ServiceError(service, response.status, 'sent a response that is not JSON.');
          }
        }

        lastStatus = response.status;
        if (response.status === 429 || response.status >= 500) continue;
        if (response.status === 401 || response.status === 403) {
          throw new ServiceError(service, response.status, `rejected the API key (${response.status}).`);
        }
        throw new ServiceError(service, response.status, `answered HTTP ${response.status}.`);
      }

      if (lastStatus === null) throw new ServiceError(service, null, 'could not be reached.');
      throw new ServiceError(service, lastStatus, `answered HTTP ${lastStatus}.`);
    },
  };
}
