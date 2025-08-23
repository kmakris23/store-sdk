import { Component, OnInit, signal, InjectionToken } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoreSdk } from '@store-sdk/core';
// Pull in module augmentation so Sdk.simpleJwt is typed in strict production builds
import '@store-sdk/simple-jwt-login';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  prefix: string;
  suffix: string;
  minorUnit: number;
}
export const APP_CURRENCY = new InjectionToken<CurrencyInfo>('APP_CURRENCY');
// Mutable reference shared via provider so consumers see live updates without needing a new DI instance
export const APP_CURRENCY_REF: CurrencyInfo = {
  code: 'USD',
  symbol: '$',
  prefix: '$',
  suffix: '',
  minorUnit: 2,
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './app.component.html',
  providers: [{ provide: APP_CURRENCY, useValue: APP_CURRENCY_REF }],
})
export class AppComponent implements OnInit {
  title = 'example-angular-shop';
  cartCount = signal<number>(0);
  authenticated = signal<boolean>(false);
  // Local signal mirrors mutable provider object; consumers injecting APP_CURRENCY get the same live object
  currency = signal<CurrencyInfo>(APP_CURRENCY_REF);

  ngOnInit(): void {
    StoreSdk.events.onAny((e, p) => console.log('SDK Event', e, p));
    StoreSdk.events.on('auth:changed', async (a) => {
      const loggedIn = !!a;
      this.authenticated.set(loggedIn);
      if (loggedIn) {
        await this.fetchCartAndCurrency();
      } else {
        // reset mutable ref + signal
        APP_CURRENCY_REF.code = 'USD';
        APP_CURRENCY_REF.symbol = '$';
        APP_CURRENCY_REF.prefix = '$';
        APP_CURRENCY_REF.suffix = '';
        APP_CURRENCY_REF.minorUnit = 2;
        this.currency.set(APP_CURRENCY_REF);
      }
    });
    this.authenticated.set(!!StoreSdk.state.authenticated);
    interface MiniCartItem {
      quantity?: number;
    }
    interface MiniCart {
      items?: MiniCartItem[];
    }
    const update = (cart?: MiniCart) => {
      const count =
        cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      this.cartCount.set(count);
    };
    StoreSdk.events.on(
      'cart:updated',
      (
        c:
          | {
              items?: MiniCartItem[];
              totals?: {
                currency_code: string;
                currency_symbol: string;
                currency_prefix: string;
                currency_suffix: string;
                currency_minor_unit: number;
              };
            }
          | undefined
      ) => {
        update(c);
        const totals = c?.totals;
        if (totals && totals.currency_code) {
          APP_CURRENCY_REF.code = totals.currency_code;
          APP_CURRENCY_REF.symbol = totals.currency_symbol;
          APP_CURRENCY_REF.prefix =
            totals.currency_prefix || totals.currency_symbol || '';
          APP_CURRENCY_REF.suffix = totals.currency_suffix || '';
          APP_CURRENCY_REF.minorUnit = totals.currency_minor_unit || 2;
          this.currency.set(APP_CURRENCY_REF); // notify local signal listeners
        }
      }
    );

    // Initialize currency immediately if cart already prefetched before subscription
    const existingTotals = (
      StoreSdk.state.cart as unknown as
        | {
            totals?: {
              currency_code: string;
              currency_symbol: string;
              currency_prefix: string;
              currency_suffix: string;
              currency_minor_unit: number;
            };
          }
        | undefined
    )?.totals;
    if (existingTotals?.currency_code) {
      this.setCurrencyFromTotals(existingTotals);
    } else if (this.authenticated()) {
      // fetch if already authenticated
      this.fetchCartAndCurrency();
    }
  }

  private setCurrencyFromTotals(t: {
    currency_code: string;
    currency_symbol: string;
    currency_prefix: string;
    currency_suffix: string;
    currency_minor_unit: number;
  }) {
    APP_CURRENCY_REF.code = t.currency_code;
    APP_CURRENCY_REF.symbol = t.currency_symbol;
    APP_CURRENCY_REF.prefix = t.currency_prefix || t.currency_symbol || '';
    APP_CURRENCY_REF.suffix = t.currency_suffix || '';
    APP_CURRENCY_REF.minorUnit = t.currency_minor_unit || 2;
    this.currency.set(APP_CURRENCY_REF);
  }

  private async fetchCartAndCurrency() {
    try {
      const { data } = await StoreSdk.store.cart.get();
      const t = data?.totals;
      if (t?.currency_code) this.setCurrencyFromTotals(t);
    } catch {
      /* ignore */
    }
  }

  async logout() {
    await StoreSdk.simpleJwt?.auth.revokeToken();
  }
}
