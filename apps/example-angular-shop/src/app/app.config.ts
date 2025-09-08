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

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAppInitializer(() =>
      from(
        StoreSdk.init({
          baseUrl: environment.baseUrl,
          auth: {
            getToken: async () =>
              (await Promise.resolve(localStorage.getItem('token'))) as string,
            setToken: async (value) => {
              await Promise.resolve(localStorage.setItem('token', value));
            },
            getRefreshToken: async () =>
              (await Promise.resolve(
                localStorage.getItem('re_token')
              )) as string,
            setRefreshToken: async (value) => {
              await Promise.resolve(localStorage.setItem('re_token', value));
            },
          },
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
          // No auth plugins: guest cart + checkout only.
        })
      )
    ),
  ],
};
