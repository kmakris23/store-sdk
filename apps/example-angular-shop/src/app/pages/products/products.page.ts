import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricePipe } from '../../pipes/price.pipe';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StoreSdk } from '@store-sdk/core';

interface ProductListItem {
  id: number;
  name: string;
  prices?: { price?: string };
  images?: { src: string; alt: string }[];
  on_sale?: boolean;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  image?: { src: string | null };
  count: number;
  parent: number;
}

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe],
  templateUrl: './products.page.html',
})
export class ProductsPageComponent implements OnInit {
  products = signal<ProductListItem[]>([]);
  loading = signal<boolean>(false);
  skeleton = Array.from({ length: 8 });
  categories = signal<CategoryItem[]>([]);
  selectedCategory = signal<number | null>(null);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // Currency formatting handled centrally by PricePipe; no local injection needed

  async ngOnInit() {
    // Load categories (don't block product skeleton for long)
    this.loadCategories();

    // Read category from query param if present
    const qp = this.route.snapshot.queryParamMap.get('category');
    if (qp) {
      const parsed = Number(qp);
      if (!Number.isNaN(parsed)) this.selectedCategory.set(parsed);
    }

    // Initial product load
    await this.loadProducts();

    // React to query param changes (user navigation/back)
    this.route.queryParamMap.subscribe((pm) => {
      const catParam = pm.get('category');
      const id = catParam ? Number(catParam) : null;
      if (id !== this.selectedCategory()) {
        this.selectedCategory.set(id);
        this.loadProducts();
      }
    });
  }

  private async loadCategories() {
    const { data } = await StoreSdk.store.categories.list({ per_page: 100 });
    const mapped = (data || [])
      .filter((c) => !c.parent) // top-level only for simplicity
      .map(
        (c) =>
          ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            image: c.image ? { src: c.image.src } : { src: null },
            count: c.count,
            parent: c.parent,
          } satisfies CategoryItem)
      );
    this.categories.set(mapped);
  }

  private async loadProducts() {
    this.loading.set(true);
    const category = this.selectedCategory();
    const { data } = await StoreSdk.store.products.list({
      per_page: 24,
      category: category ? String(category) : undefined,
    });
    this.products.set(data || []);
    this.loading.set(false);
  }

  async selectCategory(cat: CategoryItem | null) {
    const id = cat ? cat.id : null;
    if (id === this.selectedCategory()) return; // no change
    this.selectedCategory.set(id);
    // Update URL (merge other params)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: id || undefined },
      queryParamsHandling: 'merge',
    });
    await this.loadProducts();
  }

  // Replaced by PricePipe in template
}
