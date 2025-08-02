export const getJwtExpiration = (token?: string) => {
  if (!token) return null;
  const arrayToken = token.split('.');
  const tokenPayload = JSON.parse(atob(arrayToken[1]));
  return new Date(parseInt(tokenPayload?.exp) * 1000);
};
export const isJwtExpired = (token?: string) => {
  if (!token) return true;
  const arrayToken = token.split('.');
  const tokenPayload = JSON.parse(atob(arrayToken[1]));
  return Math.floor(new Date().getTime() / 1000) >= tokenPayload?.exp;
};
