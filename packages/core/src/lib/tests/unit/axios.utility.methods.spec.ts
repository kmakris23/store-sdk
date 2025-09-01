import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use hoisted variable so it's available when the mock factory is evaluated.
const { requestMock } = vi.hoisted(() => ({ requestMock: vi.fn() }));
vi.mock('../../services/api.js', () => ({
  httpClient: { request: (...args: unknown[]) => requestMock(...args) },
  createHttpClient: vi.fn(),
}));

import {
  doGet,
  doPost,
  doPut,
  doDelete,
  doHead,
} from '../../utilities/axios.utility.js';

describe('axios.utility helper methods', () => {
  beforeEach(() => {
    requestMock.mockReset();
    requestMock.mockResolvedValue({ data: { ok: true }, headers: { h: 'v' } });
  });

  it('doGet invokes request with method get', async () => {
    const res = await doGet<{ ok: boolean }>('/x');
    expect(res.data?.ok).toBe(true);
    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'get', url: '/x' })
    );
  });

  it('doPost sends data with method post', async () => {
    const res = await doPost<{ ok: boolean }, { a: number }>('/y', { a: 1 });
    expect(res.data?.ok).toBe(true);
    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'post', url: '/y', data: { a: 1 } })
    );
  });

  it('doPut sends data with method put', async () => {
    await doPut<unknown, { b: string }>('/z', { b: 'v' });
    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'put', url: '/z', data: { b: 'v' } })
    );
  });

  it('doDelete uses delete method', async () => {
    await doDelete('/d');
    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'delete', url: '/d' })
    );
  });

  it('doHead sets method head and custom validateStatus', async () => {
    await doHead('/h');
    const call = requestMock.mock.calls.find((c) => c[0].method === 'head');
    expect(call?.[0].validateStatus?.()).toBe(true);
  });
});
