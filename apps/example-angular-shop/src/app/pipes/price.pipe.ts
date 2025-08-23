import { Pipe, PipeTransform, inject } from '@angular/core';
import { APP_CURRENCY, CurrencyInfo } from '../app.component';
import { StoreSdk } from '@store-sdk/core';

@Pipe({
  name: 'price',
  standalone: true,
  pure: false, // depends on mutable StoreSdk.state + currency ref
})
export class PricePipe implements PipeTransform {
  private appCurrency = inject(APP_CURRENCY, {
    optional: true,
  }) as CurrencyInfo | null;

  transform(value?: string | number | null): string {
    if (value === undefined || value === null || value === '') return '';
    const raw = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(raw)) return String(value);
    const totals = StoreSdk.state.cart?.totals as unknown as
      | {
          currency_prefix?: string;
          currency_suffix?: string;
          currency_symbol?: string;
          currency_minor_unit?: number;
        }
      | undefined;
    const minor =
      totals?.currency_minor_unit ?? this.appCurrency?.minorUnit ?? 2;
    const prefix = totals?.currency_prefix ?? '';
    const suffix = totals?.currency_suffix ?? this.appCurrency?.suffix ?? '';
    return prefix + (raw / Math.pow(10, minor)).toFixed(minor) + suffix;
  }
}
