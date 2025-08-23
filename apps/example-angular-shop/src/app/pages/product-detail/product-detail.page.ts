import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PricePipe } from '../../pipes/price.pipe';
import { StoreSdk } from '@store-sdk/core';

interface ProductDetail {
  id: number;
  name: string;
  description?: string;
  prices?: { price?: string };
  images?: { src: string; alt: string }[];
}

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe],
  templateUrl: './product-detail.page.html',
})
export class ProductDetailPageComponent implements OnInit {
  product = signal<ProductDetail | null>(null);
  private route = inject(ActivatedRoute);
  qty = 1;
  // Currency formatting handled centrally by PricePipe

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      const { data } = await StoreSdk.store.products.single({ id });
      this.product.set(data || null);
    }
  }

  async addToCart() {
    const p = this.product();
    if (p) {
      await StoreSdk.store.cart.add({ id: p.id, quantity: this.qty });
    }
  }

  // Replaced by PricePipe in template
}
