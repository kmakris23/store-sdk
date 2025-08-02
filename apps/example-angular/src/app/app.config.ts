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
import { useAuth } from '@store-sdk/jwt-authentication-for-wp-rest-api';
import { environment } from '../environments/environment.development';

const auth = useAuth({
  getToken: async () =>
    (await Promise.resolve(localStorage.getItem('jwt'))) as string,
  setToken: async (token) => {
    const promise = Promise.resolve(localStorage.setItem('jwt', token));
    await promise;
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
          nonce: { disabled: false },
          plugins: [auth],
          cartToken: {
            disabled: true,
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
