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
import { environment } from '../environments/environment.development';

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
          cartToken: {
            getToken: async () => {
              const key = localStorage.getItem('cart_token');
              const promise = Promise.resolve(key);
              const result = (await promise) as string;
              console.log('getToken', result);
              return result;
            },
            setToken: async (cartToken) => {
              console.log('setToken', cartToken);
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
