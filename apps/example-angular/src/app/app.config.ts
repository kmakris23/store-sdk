import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { from } from 'rxjs';
import { StoreSdk } from '@store-sdk/core';
// import { useHippo } from '@store-sdk/hippoo';
import { environment } from '../environments/environment.development';
import { useSimpleJwt } from '@store-sdk/simple-jwt-login';

const useSimpleJwtPlugin = useSimpleJwt({
  fetchCartOnLogin: true,
  revokeTokenBeforeLogin: true,
  autoLoginUrl: environment.baseUrl,
  autoLoginRedirectUrl: `${environment.baseUrl}/checkout`,
  getToken: async () =>
    (await Promise.resolve(localStorage.getItem('simple_jwt'))) as string,
  setToken: async (token) => {
    const promise = Promise.resolve(localStorage.setItem('simple_jwt', token));
    await promise;
  },
  clearToken: async () => {
    Promise.resolve(localStorage.removeItem('simple_jwt'));
  },
});

// const hippo = useHippo({
//   getToken: async () =>
//     (await Promise.resolve(localStorage.getItem('jwt'))) as string,
//   setToken: async (token) => {
//     const promise = Promise.resolve(localStorage.setItem('jwt', token));
//     await promise;
//   },
// });
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAppInitializer(() => {
      return from(
        StoreSdk.init({
          baseUrl: environment.baseUrl,
          nonce: {
            disabled: false,
            clearToken: async () => {
              const promise = Promise.resolve(
                localStorage.removeItem('cart_nonce')
              );
              await promise;
            },
            getToken: async () => {
              const key = localStorage.getItem('cart_nonce');
              const promise = Promise.resolve(key);
              const result = (await promise) as string;
              return result;
            },
            setToken: async (cartToken) => {
              const promise = Promise.resolve(
                localStorage.setItem('cart_nonce', cartToken)
              );
              await promise;
            },
          },
          plugins: [useSimpleJwtPlugin],
          cartToken: {
            disabled: false,
            clearToken: async () => {
              const promise = Promise.resolve(
                localStorage.removeItem('cart_token')
              );
              await promise;
            },
            getToken: async () => {
              const key = localStorage.getItem('cart_token');
              const promise = Promise.resolve(key);
              const result = (await promise) as string;
              return result;
            },
            setToken: async (cartToken) => {
              const promise = Promise.resolve(
                localStorage.setItem('cart_token', cartToken)
              );
              await promise;
            },
          },
        })
      );
    }),
  ],
};
