import { describe, it, expect, beforeAll } from 'vitest';
import { getJwtExpiration, isJwtExpired } from '../../../index.js';

beforeAll(() => {
  if (!(globalThis as any).atob) {
    (globalThis as any).atob = (b64: string) =>
      Buffer.from(b64, 'base64').toString('binary');
  }
});

function buildJwt(expSecondsFromNow: number) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64');
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64');
  return `${header}.${payload}.signature`;
}

describe('jwt.utility', () => {
  it('getJwtExpiration returns null when no token', () => {
    expect(getJwtExpiration(undefined)).toBeNull();
  });

  it('getJwtExpiration returns a future date', () => {
    const token = buildJwt(60);
    const exp = getJwtExpiration(token);
    expect(exp).toBeInstanceOf(Date);
    if (!exp) throw new Error('exp should be defined');
    expect(exp.getTime()).toBeGreaterThan(Date.now());
  });

  it('isJwtExpired true for missing token', () => {
    expect(isJwtExpired(undefined)).toBe(true);
  });

  it('isJwtExpired false for future token', () => {
    const token = buildJwt(30);
    expect(isJwtExpired(token)).toBe(false);
  });

  it('isJwtExpired true for past token', () => {
    const token = buildJwt(-30);
    expect(isJwtExpired(token)).toBe(true);
  });
});
