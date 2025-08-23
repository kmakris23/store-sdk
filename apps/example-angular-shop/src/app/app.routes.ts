import { Route, CanMatchFn, Router } from '@angular/router';
import { StoreSdk } from '@store-sdk/core';
import { inject } from '@angular/core';
import { HomePageComponent } from './pages/home/home.page';
import { ProductsPageComponent } from './pages/products/products.page';
import { ProductDetailPageComponent } from './pages/product-detail/product-detail.page';
import { CartPageComponent } from './pages/cart/cart.page';
import { LoginPageComponent } from './pages/auth/login.page';

const requireAuth: CanMatchFn = () => {
  if (StoreSdk.state.authenticated) return true;
  const router = inject(Router);
  return router.parseUrl('/login');
};

export const routes: Route[] = [
  { path: '', component: HomePageComponent, title: 'Shop Home' },
  { path: 'login', component: LoginPageComponent, title: 'Login' },
  {
    path: 'products',
    canMatch: [requireAuth],
    component: ProductsPageComponent,
    title: 'Products',
  },
  {
    path: 'products/:id',
    canMatch: [requireAuth],
    component: ProductDetailPageComponent,
    title: 'Product Detail',
  },
  {
    path: 'cart',
    canMatch: [requireAuth],
    component: CartPageComponent,
    title: 'Your Cart',
  },
  { path: '**', redirectTo: '' },
];
