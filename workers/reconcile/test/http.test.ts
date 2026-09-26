import { describe, expect, it, vi } from 'vitest';
import { ServiceError, createHttp } from '../src/http';

const noSleep = async () => {};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('createHttp().getJson', () => {
  it('sends a GET with the given headers and returns the parsed body', async () => {
    const fetchImpl = vi.fn(async () => json(200, { ok: 1 }));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    await expect(http.getJson('Cal ID', 'https://x.test/a', { Authorization: 'Bearer k' })).resolves.toEqual({ ok: 1 });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe('GET');
    expect(init.headers).toEqual({ Authorization: 'Bearer k' });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('retries 429 and 5xx, then succeeds', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json(429, {}))
      .mockResolvedValueOnce(json(503, {}))
      .mockResolvedValueOnce(json(200, { ok: 2 }));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    await expect(http.getJson('Razorpay', 'https://x.test', {})).resolves.toEqual({ ok: 2 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('gives up after 3 retries (4 attempts) with a ServiceError naming the service', async () => {
    const fetchImpl = vi.fn(async () => json(500, {}));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    const error = (await http.getJson('Razorpay', 'https://x.test', {}).catch((e) => e)) as ServiceError;
    expect(error).toBeInstanceOf(ServiceError);
    expect(error.service).toBe('Razorpay');
    expect(error.status).toBe(500);
    expect(error.message).toBe('answered HTTP 500.');
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it('does not retry 401, and says the key was rejected', async () => {
    const fetchImpl = vi.fn(async () => json(401, {}));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    const error = (await http.getJson('Cal ID', 'https://x.test', {}).catch((e) => e)) as ServiceError;
    expect(error.message).toBe('rejected the API key (401).');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries network errors, then reports the service unreachable', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const http = createHttp(fetchImpl, { sleep: noSleep });

    const error = (await http.getJson('Cal ID', 'https://x.test', {}).catch((e) => e)) as ServiceError;
    expect(error).toBeInstanceOf(ServiceError);
    expect(error.status).toBeNull();
    expect(error.message).toBe('could not be reached.');
    expect(fetchImpl).toHaveBeenCalledTimes(4);
  });

  it('reports a non-JSON success body without retrying', async () => {
    const fetchImpl = vi.fn(async () => new Response('<html>', { status: 200 }));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    const error = (await http.getJson('Cal ID', 'https://x.test', {}).catch((e) => e)) as ServiceError;
    expect(error.message).toBe('sent a response that is not JSON.');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('never puts header values (credentials) in the error message', async () => {
    const fetchImpl = vi.fn(async () => json(403, {}));
    const http = createHttp(fetchImpl, { sleep: noSleep });

    const error = (await http.getJson('Razorpay', 'https://x.test', { Authorization: 'Basic SECRET123' }).catch((e) => e)) as ServiceError;
    expect(String(error.message)).not.toContain('SECRET123');
  });
});
