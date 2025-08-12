import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StoreSdk } from '@store-sdk/core';
import { environment } from '../environments/environment.development';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'example-angular';

  async ngOnInit() {
    StoreSdk.events.onAny((event, payload) => {
      console.log('Event:', event, 'Payload:', payload);
    });
  }

  async login() {
    const { data, error } = await StoreSdk.simpleJwt.auth.token({
      username: environment.auth.username,
      password: environment.auth.password,
    });
    console.log('login:', data);
    if (error) {
      console.log('login error:', error);
    }
  }

  async login2() {
    const { data, error } = await StoreSdk.simpleJwt.auth.token({
      username: environment.auth.username2,
      password: environment.auth.password2,
    });
    console.log('login:', data);
    if (error) {
      console.log('login error:', error);
    }
  }

  async logout() {
    await StoreSdk.simpleJwt.auth.revokeToken();
  }

  async listCoupons() {
    const { data, error } = await StoreSdk.store.cartCoupons.list();
    console.log('list cart coupons:', data);
    if (error) {
      console.log('list cart coupons error:', error);
    }
  }

  async listCartItems() {
    const { data, error } = await StoreSdk.store.cartItems.list();
    console.log('list cart items:', data);
    if (error) {
      console.log('list cart items error:', error);
    }
  }

  async listProducts() {
    const { data, error } = await StoreSdk.store.products.list();
    console.log('list products:', data);
    if (error) {
      console.log('list products error:', error);
    }
  }
  async singleProduct() {
    const { data, error } = await StoreSdk.store.products.single({
      id: environment.test.productId,
    });
    console.log('single product:', data);
    if (error) {
      console.log('single product error:', error);
    }
  }

  async getCart() {
    const { data, error } = await StoreSdk.store.cart.get();
    console.log('get cart:', data);
    if (error) {
      console.log('get cart error:', error);
    }
  }
  async addToCart() {
    const { data, error } = await StoreSdk.store.cart.add({
      id: environment.test.productId,
    });
    console.log('add to cart:', data);
    if (error) {
      console.log('add to cart error:', error);
    }
  }
}
