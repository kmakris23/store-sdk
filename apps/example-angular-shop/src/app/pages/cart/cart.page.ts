import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PricePipe } from '../../pipes/price.pipe';
import { StoreSdk } from '@store-sdk/core';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  prices?: { price?: string };
}
interface CartData {
  items: CartItem[];
}

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe],
  templateUrl: './cart.page.html',
})
export class CartPageComponent implements OnInit {
  cart = signal<CartData | null>(null);
  loading = signal<boolean>(false);
  totalItems = signal<number>(0);
  // Currency formatting handled centrally by PricePipe

  async ngOnInit() {
    await this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    const { data } = await StoreSdk.store.cart.get();
    this.cart.set(data || null);
    const total = data?.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
    this.totalItems.set(total);
    this.loading.set(false);
  }

  // Replaced by PricePipe in template
}
