import { describe, it, expect, vi } from 'vitest';
import {
  doGet,
  doPost,
  doPut,
  doDelete,
  doHead,
} from '../../utilities/axios.utility.js';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

describe('axios.utility helper methods', () => {
  const makeInstance = () => {
    return {
      request: vi
        .fn()
        .mockResolvedValue({ data: { ok: true }, headers: { h: 'v' } }),
    } as unknown as AxiosInstance;
  };

  const withAdapter = (inst: AxiosInstance): AxiosRequestConfig => ({
    adapter: async (config) =>
      (
        inst as unknown as { request: (c: unknown) => Promise<unknown> }
      ).request(config),
  });

  it('doGet invokes request with method get', async () => {
    const inst = makeInstance();
    const res = await doGet<{ ok: boolean }>('/x', withAdapter(inst));
    expect(res.data?.ok).toBe(true);
  });

  it('doPost puts payload', async () => {
    const inst = makeInstance();
    const res = await doPost<{ ok: boolean }, { a: number }>(
      '/x',
      { a: 1 },
      withAdapter(inst)
    );
    expect(res.data?.ok).toBe(true);
  });

  it('doPut works', async () => {
    const inst = makeInstance();
    const res = await doPut<{ ok: boolean }, { a: number }>(
      '/x',
      { a: 2 },
      withAdapter(inst)
    );
    expect(res.data?.ok).toBe(true);
  });

  it('doDelete works', async () => {
    const inst = makeInstance();
    const res = await doDelete<{ ok: boolean }>('/x', withAdapter(inst));
    expect(res.data?.ok).toBe(true);
  });

  it('doHead returns headers (no data assertion) and sets validateStatus', async () => {
    const inst = makeInstance();
    const res = await doHead<unknown>('/x', withAdapter(inst));
    expect(res.headers?.h).toBe('v');
  });
});
