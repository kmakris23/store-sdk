# WooCommerce Store API SDK

> ⚠️ **This project is currently under active development.**
>
> Features, APIs, and documentation may change frequently until a stable version is released.

A modern, TypeScript-first SDK for seamless integration with the **WooCommerce Store API**. Built for headless and decoupled storefronts, this SDK provides comprehensive typed utilities and abstractions that simplify e-commerce development. Whether you're building with React, Angular, Vue, or vanilla JavaScript, this SDK offers a consistent, type-safe interface for all your WooCommerce needs. The modular architecture allows you to import only the features you need while maintaining excellent tree-shaking support.

## ✨ Features

- 📦 **Complete WooCommerce Store API Coverage** - Full support for products, categories, cart, checkout, orders, and more
- 🔐 **Multi-Authentication Support** - Works with guest users, Simple JWT Login, JWT Authentication for WP REST API, and Hippoo plugins
- 🧩 **Modular Architecture** - Import only what you need with excellent tree-shaking support
- 🛠️ **Type-Safe & IntelliSense Ready** - Full TypeScript support with comprehensive type definitions
- ⚡ **Event-Driven Architecture** - Reactive programming with built-in event system for state management
- 🔄 **Automatic Token Management** - Seamless nonce and cart token handling with interceptors
- 📱 **Framework Agnostic** - Works with React, Angular, Vue, and vanilla JavaScript applications
- 🚀 **Modern Tooling** - Built with Nx monorepo, Vitest testing, and ESM-first architecture
- 🎯 **Pagination Support** - Built-in pagination handling for all list endpoints
- 🛡️ **Error Handling** - Comprehensive error handling with typed error responses
- 📊 **State Management** - Built-in state management with reactive updates
- 🔌 **Plugin System** - Extensible plugin architecture for custom functionality

## 📦 Installation

### Core Package

```bash
npm install @store-sdk/core
```

### Authentication Plugins (Optional)

Choose the authentication plugin that matches your WordPress setup:

```bash
# For Simple JWT Login plugin
npm install @store-sdk/simple-jwt-login

# For JWT Authentication for WP REST API plugin  
npm install @store-sdk/jwt-authentication-for-wp-rest-api

# For Hippoo plugin
npm install @store-sdk/hippoo
```

### Required Peer Dependencies

The SDK requires these peer dependencies:

```bash
npm install axios qs
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { StoreSdk } from '@store-sdk/core';

// Initialize the SDK
await StoreSdk.init({
  baseUrl: 'https://your-woocommerce-site.com',
});

// Fetch products
const { data: products } = await StoreSdk.store.products.list();
console.log('Products:', products);

// Get cart
const { data: cart } = await StoreSdk.store.cart.get();
console.log('Cart:', cart);
```

### With Authentication

```typescript
import { StoreSdk } from '@store-sdk/core';
import { useSimpleJwt } from '@store-sdk/simple-jwt-login';

// Initialize with authentication plugin
await StoreSdk.init({
  baseUrl: 'https://your-woocommerce-site.com',
  plugins: [
    useSimpleJwt({
      jwtSecret: 'your-jwt-secret',
      authNamespace: 'simple-jwt-login/v1',
      fetchCartOnLogin: true, // Automatically fetch cart after login
    }),
  ],
});

// Login user
const { data: loginResult } = await StoreSdk.simpleJwt.auth.token({
  username: 'user@example.com',
  password: 'password123',
});

// User is now authenticated, all subsequent requests include auth headers
const { data: userOrders } = await StoreSdk.store.orders.list();
```

## 📚 API Documentation

### Products

```typescript
// List products with pagination
const { data: products } = await StoreSdk.store.products.list({
  page: 1,
  per_page: 20,
  status: 'publish',
});

// Get single product
const { data: product } = await StoreSdk.store.products.retrieve(123);

// Search products
const { data: searchResults } = await StoreSdk.store.products.list({
  search: 'laptop',
  orderby: 'popularity',
});
```

### Categories

```typescript
// List categories
const { data: categories } = await StoreSdk.store.categories.list();

// Get category with products
const { data: category } = await StoreSdk.store.categories.retrieve(15);
```

### Cart Management

```typescript
// Get current cart
const { data: cart } = await StoreSdk.store.cart.get();

// Add item to cart
const { data: updatedCart } = await StoreSdk.store.cartItems.create({
  product_id: 123,
  quantity: 2,
});

// Update cart item
const { data: item } = await StoreSdk.store.cartItems.update('item-key', {
  quantity: 3,
});

// Remove item from cart
await StoreSdk.store.cartItems.delete('item-key');

// Apply coupon
const { data: cartWithCoupon } = await StoreSdk.store.cartCoupons.create({
  code: 'DISCOUNT10',
});
```

### Orders

```typescript
// List customer orders (requires authentication)
const { data: orders } = await StoreSdk.store.orders.list();

// Get specific order
const { data: order } = await StoreSdk.store.orders.retrieve(456);
```

### Checkout

```typescript
// Process checkout
const { data: order } = await StoreSdk.store.checkout.processOrder({
  billing: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address_1: '123 Main St',
    city: 'New York',
    postcode: '10001',
    country: 'US',
  },
  shipping: {
    first_name: 'John',
    last_name: 'Doe',
    address_1: '123 Main St',
    city: 'New York',
    postcode: '10001',
    country: 'US',
  },
  payment_method: 'stripe',
});
```

## 🎯 Event System

The SDK includes a powerful event system for reactive programming:

```typescript
// Listen to cart updates
StoreSdk.events.on('cart:updated', (cart) => {
  console.log('Cart updated:', cart);
  updateUICartCount(cart.items?.length || 0);
});

// Listen to authentication changes
StoreSdk.events.on('auth:changed', (authenticated) => {
  if (authenticated) {
    console.log('User logged in');
    // Redirect to dashboard or fetch user-specific data
  } else {
    console.log('User logged out');
    // Clear sensitive data, redirect to login
  }
});

// Listen to nonce changes (for CSRF protection)
StoreSdk.events.on('nonce:changed', (newNonce) => {
  console.log('Nonce updated:', newNonce);
});

// Listen to all events
StoreSdk.events.onAny((eventName, payload) => {
  console.log(`Event: ${eventName}`, payload);
});
```

## 🔐 Authentication Setup

### Simple JWT Login Plugin

1. Install and configure the Simple JWT Login WordPress plugin
2. Set up your JWT secret in WordPress admin
3. Use the SDK with the plugin:

```typescript
import { useSimpleJwt } from '@store-sdk/simple-jwt-login';

await StoreSdk.init({
  baseUrl: 'https://your-site.com',
  plugins: [
    useSimpleJwt({
      jwtSecret: 'your-secret-key',
      authNamespace: 'simple-jwt-login/v1',
      refreshTokenEndpoint: '/auth/refresh',
      fetchCartOnLogin: true,
    }),
  ],
});

// Login
await StoreSdk.simpleJwt.auth.token({
  username: 'user@example.com',
  password: 'password',
});

// Auto-login URL generation
const autoLoginUrl = await StoreSdk.simpleJwt.auth.getAutoLoginUrl({
  redirectUrl: 'https://your-frontend.com/dashboard',
});
```

### JWT Authentication for WP REST API

```typescript
import { useJwtAuth } from '@store-sdk/jwt-authentication-for-wp-rest-api';

await StoreSdk.init({
  baseUrl: 'https://your-site.com',
  plugins: [
    useJwtAuth({
      authNamespace: 'jwt-auth/v1',
      // Additional configuration options
    }),
  ],
});

// Login
await StoreSdk.jwtAuth.auth.token({
  username: 'user@example.com',
  password: 'password',
});
```

## ⚙️ Configuration Options

```typescript
await StoreSdk.init({
  baseUrl: 'https://your-woocommerce-site.com',
  
  // Custom route namespace (default: 'wc/store/v1')
  routeNamespace: 'wc/store/v1',
  
  // Nonce handling (for CSRF protection)
  nonce: {
    getToken: async () => localStorage.getItem('wc_nonce'),
    setToken: async (nonce) => localStorage.setItem('wc_nonce', nonce),
    clearToken: async () => localStorage.removeItem('wc_nonce'),
    disabled: false, // Set to true to disable nonce handling
  },
  
  // Cart token handling
  cartToken: {
    getToken: async () => localStorage.getItem('cart_token'),
    setToken: async (token) => localStorage.setItem('cart_token', token),
    clearToken: async () => localStorage.removeItem('cart_token'),
    disabled: false, // Set to true to disable cart token handling
  },
  
  // Authentication plugins
  plugins: [
    // Your authentication plugins here
  ],
});
```

## 🧪 Framework Integration Examples

### React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { StoreSdk } from '@store-sdk/core';

export function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to cart updates
    const unsubscribe = StoreSdk.events.on('cart:updated', setCart);
    
    // Initial cart fetch
    StoreSdk.store.cart.get().then(({ data }) => {
      setCart(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addToCart = async (productId: number, quantity: number) => {
    await StoreSdk.store.cartItems.create({
      product_id: productId,
      quantity,
    });
  };

  return { cart, loading, addToCart };
}
```

### Angular Service Example

```typescript
import { Injectable, signal } from '@angular/core';
import { StoreSdk } from '@store-sdk/core';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartCount = signal(0);
  
  constructor() {
    StoreSdk.events.on('cart:updated', (cart) => {
      const count = cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      this.cartCount.set(count);
    });
  }

  async addToCart(productId: number, quantity: number) {
    return await StoreSdk.store.cartItems.create({
      product_id: productId,
      quantity,
    });
  }
}
```

## 🛠️ Development

### Building the Project

```bash
# Install dependencies
npm install

# Build all packages
npm run dev:rebuild

# Build specific package
npx nx build core

# Run tests
npx nx test core

# Lint code
npx nx lint core
```

### Running the Example

```bash
# Start the Angular example application
npm run serve:angular
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📞 Support

- 📧 Email: kostasmakris23@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/kmakris23/store-sdk/issues)
- 📖 Documentation: [GitHub Repository](https://github.com/kmakris23/store-sdk)
