export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]: Required<Pick<T, K>> & Partial<Omit<T, K>>;
  }[Keys];

export const parseLinkHeader = (linkHeader?: string) => {
  if (!linkHeader) return undefined;

  const links: Record<string, string> = {};
  const parts = linkHeader.split(',');
  for (const part of parts) {
    const match = part.trim().match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const [, url, rel] = match;
      if (rel === 'prev' || rel === 'next' || rel === 'up') {
        links[rel] = url;
      }
    }
  }

  return links;
};
