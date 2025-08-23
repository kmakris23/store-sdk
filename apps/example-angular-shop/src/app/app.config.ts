import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { from } from 'rxjs';
import { StoreSdk } from '@store-sdk/core';
import { environment } from '../environments/environment.development';
import { useSimpleJwt } from '@store-sdk/simple-jwt-login';

const simpleJwtPlugin = useSimpleJwt({
  fetchCartOnLogin: true,
  revokeTokenBeforeLogin: true,
  autoLoginUrl: environment.baseUrl,
  autoLoginRedirectUrl: `${environment.baseUrl}/checkout`,
  getToken: async () =>
    (await Promise.resolve(localStorage.getItem('simple_jwt'))) as string,
  setToken: async (token: string) => {
    await Promise.resolve(localStorage.setItem('simple_jwt', token));
  },
  clearToken: async () => {
    await Promise.resolve(localStorage.removeItem('simple_jwt'));
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAppInitializer(() =>
      from(
        StoreSdk.init({
          baseUrl: environment.baseUrl,
          nonce: {
            disabled: false,
            clearToken: async () => {
              await Promise.resolve(localStorage.removeItem('cart_nonce'));
            },
            getToken: async () =>
              (await Promise.resolve(
                localStorage.getItem('cart_nonce')
              )) as string,
            setToken: async (value) => {
              await Promise.resolve(localStorage.setItem('cart_nonce', value));
            },
          },
          cartToken: {
            disabled: false,
            clearToken: async () => {
              await Promise.resolve(localStorage.removeItem('cart_token'));
            },
            getToken: async () =>
              (await Promise.resolve(
                localStorage.getItem('cart_token')
              )) as string,
            setToken: async (value) => {
              await Promise.resolve(localStorage.setItem('cart_token', value));
            },
          },
          plugins: [simpleJwtPlugin],
        })
      )
    ),
  ],
};
