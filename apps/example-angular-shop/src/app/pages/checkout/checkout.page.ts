import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreSdk } from '@store-sdk/core';
import { PricePipe } from '../../pipes/price.pipe';

// Lightweight local shapes (subset of SDK types) for template convenience
interface ShippingPackageRate {
  rate_id: string;
  name: string;
  price: string; // minor units
  selected: boolean;
  currency_prefix: string;
  currency_suffix: string;
  currency_minor_unit: number;
}
interface ShippingPackage {
  package_id: number;
  name: string;
  shipping_rates: ShippingPackageRate[];
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe],
  templateUrl: './checkout.page.html',
})
export class CheckoutPageComponent implements OnInit {
  loading = signal<boolean>(false);
  placing = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);
  orderId = signal<number | null>(null);

  // Cart snapshot
  cart = signal<{
    items?: {
      name: string;
      quantity: number;
      prices?: { price?: string };
    }[];
    totals?: {
      total_items?: string;
      total_shipping?: string;
      total_discount?: string;
      total_price?: string;
    };
    payment_methods?: string[];
    shipping_rates?: ShippingPackage[];
    billing_address?: {
      first_name: string;
      last_name: string;
      company: string;
      address_1: string;
      address_2: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
      email: string;
      phone: string;
    };
    shipping_address?: {
      first_name: string;
      last_name: string;
      company: string;
      address_1: string;
      address_2: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
      phone: string;
    };
  } | null>(null);

  // Address forms (initialize with reasonable defaults for demo)
  billing = signal({
    first_name: 'John',
    last_name: 'Doe',
    company: '',
    address_1: '123 Demo Street',
    address_2: '',
    city: 'Demo City',
    state: 'CA',
    postcode: '90001',
    country: 'US',
    email: 'john.doe@example.com',
    phone: '+1234567890',
  });
  shipping = signal({
    first_name: 'John',
    last_name: 'Doe',
    company: '',
    address_1: '123 Demo Street',
    address_2: '',
    city: 'Demo City',
    state: 'CA',
    postcode: '90001',
    country: 'US',
    phone: '+1234567890',
  });

  paymentMethod = signal<string | null>(null);

  async ngOnInit() {
    await this.loadCart();
  }

  private async loadCart() {
    this.loading.set(true);
    const { data, error } = await StoreSdk.store.cart.get();
    if (error) this.error.set('Failed to load cart');
    this.cart.set(data || null);
    // Prefill from cart if present
    if (data?.billing_address) this.billing.set({ ...data.billing_address });
    if (data?.shipping_address) this.shipping.set({ ...data.shipping_address });
    if (data?.payment_methods?.length) {
      // Pick first if none selected yet
      this.paymentMethod.set(this.paymentMethod() || data.payment_methods[0]);
    }
    this.loading.set(false);
  }

  packages(): ShippingPackage[] {
    return (
      (this.cart()?.shipping_rates as ShippingPackage[])?.map((p) => ({
        ...p,
        shipping_rates: p.shipping_rates || [],
      })) || []
    );
  }

  fmtMinor(v?: string, pkg?: ShippingPackageRate): string {
    if (!v) return '';
    const num = Number(v);
    if (Number.isNaN(num)) return v;
    const minor = pkg?.currency_minor_unit ?? 2;
    const prefix = pkg?.currency_prefix || '';
    const suffix = pkg?.currency_suffix || '';
    return prefix + (num / Math.pow(10, minor)).toFixed(minor) + suffix;
  }

  async selectRate(pkg: ShippingPackage, rate: ShippingPackageRate) {
    if (rate.selected) return; // already
    this.loading.set(true);
    await StoreSdk.store.cart.selectShippingRate(pkg.package_id, rate.rate_id);
    await this.loadCart();
  }

  onBillingField(field: string, ev: Event) {
    const target = ev.target as HTMLInputElement | null;
    if (!target) return;
    this.billing.set({ ...this.billing(), [field]: target.value });
  }
  onShippingField(field: string, ev: Event) {
    const target = ev.target as HTMLInputElement | null;
    if (!target) return;
    this.shipping.set({ ...this.shipping(), [field]: target.value });
  }

  async updatePayment(method: string) {
    if (this.paymentMethod() === method) return;
    this.paymentMethod.set(method);
    // Inform backend (calc totals flagged true)
    await StoreSdk.store.checkout.update({ payment_method: method }, true);
    await this.loadCart();
  }

  async placeOrder() {
    this.error.set(null);
    if (!this.cart() || !this.cart()?.items?.length) {
      this.error.set('Cart is empty');
      return;
    }
    if (!this.paymentMethod()) {
      this.error.set('Select a payment method');
      return;
    }
    this.placing.set(true);
    // Ensure addresses on cart first (some gateways rely on cart data)
    await StoreSdk.store.cart.updateCustomer({
      billing_address: this.billing(),
      shipping_address: this.shipping(),
    });
    const { data, error } =
      await StoreSdk.store.checkout.processOrderAndPayment({
        billing_address: this.billing(),
        shipping_address: this.shipping(),
        payment_method: this.paymentMethod() || undefined,
      });
    if (error) {
      this.error.set('Checkout failed');
    } else if (data) {
      this.success.set(true);
      this.orderId.set(data.order_id);
      // Reset cart locally by refetching (backend will empty cart on success)
      await this.loadCart();
    }
    this.placing.set(false);
  }

  // Helper to prettify method id for template (avoid regex literal in binding)
  prettyMethod(id: string): string {
    return id.replace(/_/g, ' ');
  }
}
