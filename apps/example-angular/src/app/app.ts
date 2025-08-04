import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StoreSdk } from '@store-sdk/core';
import { environment } from '../environments/environment.development';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'example-angular';


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

  async listProducts() {
    const { data, error } = await StoreSdk.products.list();
    console.log('list products:', data);
    if (error) {
      console.log('list products error:', error);
    }
  }
  async singleProduct() {
    const { data, error } = await StoreSdk.products.single({
      id: environment.test.productId,
    });
    console.log('single product:', data);
    if (error) {
      console.log('single product error:', error);
    }
  }

  async getCart() {
    const { data, error } = await StoreSdk.cart.get();
    console.log('get cart:', data);
    if (error) {
      console.log('get cart error:', error);
    }
  }
  async addToCart() {
    const { data, error } = await StoreSdk.cart.add({
      id: environment.test.productId,
    });
    console.log('add to cart:', data);
    if (error) {
      console.log('add to cart error:', error);
    }
  }
}
