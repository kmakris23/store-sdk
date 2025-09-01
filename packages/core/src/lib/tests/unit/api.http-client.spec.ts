import { describe, it, expect } from 'vitest';
import { createHttpClient, httpClient } from '../../services/api.js';

describe('api http client', () => {
  it('createHttpClient is idempotent and proxy forwards methods', () => {
    const first = createHttpClient({ baseURL: 'https://example.com' });
    const second = createHttpClient({ baseURL: 'https://ignored.com' });
    expect(first).toBe(second);
    expect(typeof httpClient.get).toBe('function');
  });
});
