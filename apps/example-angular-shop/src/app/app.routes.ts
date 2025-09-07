import { Route } from '@angular/router';
import { HomePageComponent } from './pages/home/home.page';
import { ProductsPageComponent } from './pages/products/products.page';
import { ProductDetailPageComponent } from './pages/product-detail/product-detail.page';
import { CartPageComponent } from './pages/cart/cart.page';
import { CheckoutPageComponent } from './pages/checkout/checkout.page';
// Auth removed: all routes public.

export const routes: Route[] = [
  { path: '', component: HomePageComponent, title: 'Shop Home' },
  { path: 'products', component: ProductsPageComponent, title: 'Products' },
  {
    path: 'products/:id',
    component: ProductDetailPageComponent,
    title: 'Product Detail',
  },
  { path: 'cart', component: CartPageComponent, title: 'Your Cart' },
  { path: 'checkout', component: CheckoutPageComponent, title: 'Checkout' },
  { path: '**', redirectTo: '' },
];
