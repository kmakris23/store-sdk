import { jwtAuthenticationForWpRestApi } from './jwt-authentication-for-wp-rest-api';

describe('jwtAuthenticationForWpRestApi', () => {
  it('should work', () => {
    expect(jwtAuthenticationForWpRestApi()).toEqual(
      'jwt-authentication-for-wp-rest-api'
    );
  });
});
