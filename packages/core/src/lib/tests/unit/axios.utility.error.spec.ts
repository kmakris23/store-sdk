import { describe, it, expect, vi } from 'vitest';
import { doRequest } from '../../utilities/axios.utility.js';
import type { AxiosInstance } from 'axios';

describe('axios.utility error path', () => {
  it('returns error structure on axios error', async () => {
    const instance: Partial<AxiosInstance> = {
      request: vi.fn().mockRejectedValue({
        response: {
          data: { message: 'failed' },
          headers: { 'x-test': 'y' },
        },
      }),
    };
    const result = await doRequest<{ ok: boolean }>(
      instance as AxiosInstance,
      '/x',
      { method: 'get' }
    );
    expect(result.error?.message).toBe('failed');
    expect(result.headers?.['x-test']).toBe('y');
  });
});
