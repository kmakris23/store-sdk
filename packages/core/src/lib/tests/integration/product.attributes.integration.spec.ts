import { describe, it, expect, beforeAll } from 'vitest';
import { StoreSdk } from '../../../index.js';

const WP_BASE_URL = 'http://localhost:8080';

describe('Integration: Product Attributes & Terms', () => {
  beforeAll(async () => {
    await StoreSdk.init({ baseUrl: WP_BASE_URL });
  });

  it('lists attributes and retrieves terms for the size attribute', async () => {
    const { data: attributes } = await StoreSdk.store.attributes.list();
    expect(Array.isArray(attributes)).toBe(true);
    const size =
      attributes?.find((a) => /size/i.test(a.name || '')) || attributes?.[0];
    if (size?.id) {
      // Request without unsupported paging params; default ordering
      const { data: terms } = await StoreSdk.store.attributesTerms.list(
        size.id,
        {
          id: size.id,
          order: 'asc',
          orderby: 'name',
        }
      );
      expect(Array.isArray(terms)).toBe(true);
      type TermLike = { name?: string };
      const names = (terms || []).map(
        (t) => (t as TermLike).name?.toLowerCase() || ''
      );
      expect(names.some((n) => n.startsWith('small'))).toBe(true);
    }
  });

  it('handles terms request for non-existent attribute id', async () => {
    const res = await StoreSdk.store.attributesTerms.list(999999, {
      id: 999999,
      order: 'asc',
      orderby: 'name',
    });
    if (res.error) {
      expect(res.error.code).toMatch(/invalid|does_not_exist|taxonomy/i);
    } else {
      expect(Array.isArray(res.data)).toBe(true);
    }
  });
});
