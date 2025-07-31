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
import { StoreSdkHippooo } from '@store-sdk/hippoo';
import { environment } from '../environments/environment.development';

StoreSdk.plugins([StoreSdkHippooo]);
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAppInitializer(() => {
      return from(
        StoreSdk.init({
          baseUrl: environment.baseUrl,
          nonce: { disabled: true },
          jwt: {
            getToken: async () =>
              (await Promise.resolve(localStorage.getItem('jwt'))) as string,
            setToken: async (cartToken) => {
              const promise = Promise.resolve(
                localStorage.setItem('jwt', cartToken)
              );
              await promise;
            },
          },
          cartToken: {
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
