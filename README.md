# WooCommerce Store API SDK

<!-- Status & Quality Badges -->

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/kmakris23/store-sdk/post-merge.yml)
![Codecov](https://img.shields.io/codecov/c/github/kmakris23/store-sdk)
![NPM Version](https://img.shields.io/npm/v/%40store-sdk%2Fcore)

A modern, TypeScript-first SDK for seamless integration with the **WooCommerce Store API**. Built for headless and decoupled storefronts, this SDK provides comprehensive typed utilities and abstractions that simplify e-commerce development. Whether you're building with React, Angular, Vue, or vanilla JavaScript, this SDK offers a consistent, type-safe interface for all your WooCommerce needs.

## Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [📦 Installation](#-installation)
- [🔌 WordPress Plugin](#-wordpress-plugin)
- [🚀 Quick Start](#-quick-start)
- [📚 API Reference](#-api-reference)
- [🎯 Event System](#-event-system)
- [⚙️ Configuration](#️-configuration)
- [🧪 Framework Integration](#-framework-integration)
- [🛠️ Development](#️-development)
- [📄 Testing](#-testing)
- [📞 Support](#-support)
- [📄 License](#-license)

## ✨ Features

- **📦 Complete WooCommerce Store API Coverage** - Full support for products, categories, cart, checkout, orders, and catalog metadata
- **🔐 Guest User Support** - Works seamlessly with guest users and shopping carts
- **🔌 WordPress Plugin** - Essential Store SDK WordPress plugin extends WooCommerce API capabilities and provides JWT authentication
- **🧩 Modular Plugin Architecture** - Extensible plugin system for custom functionality
- **🛠️ Type-Safe & IntelliSense Ready** - Full TypeScript support with comprehensive type definitions
- **⚡ Event-Driven Architecture** - Reactive programming with built-in EventBus for state management
- **🔄 Automatic Token Management** - Seamless nonce and cart token handling with request interceptors
- **📱 Framework Agnostic** - Works with React, Angular, Vue, and vanilla JavaScript applications
- **🚀 Modern Tooling** - Built with Nx monorepo, Vitest testing, and ESM-first architecture
- **🎯 Pagination Support** - Built-in pagination handling for all list endpoints
- **🛡️ Error Handling** - Comprehensive error handling with typed error responses
- **📊 State Management** - Built-in state management with reactive updates
- **🔌 Interceptor System** - Configurable request/response interceptors for nonces, tokens, and cart management
- **🏃 High Performance** - Tree-shakeable imports, optimized bundle size, and efficient caching

## 🏗️ Architecture

This monorepo contains:

- **`@store-sdk/core`** - Main SDK package with Store API services, interceptors, and plugin infrastructure
- **`Store SDK` (WordPress Plugin - currently under review by wordpress)** - Essential plugin that extends WooCommerce API capabilities and provides JWT authentication endpoints for headless integrations

### Core Services Structure

```
StoreSdk.store
├── products        # Product catalog management
├── categories      # Product categories
├── tags           # Product tags
├── brands         # Product brands
├── attributes     # Product attributes & terms
├── reviews        # Product reviews
├── collectionData # Catalog metadata
├── cart           # Shopping cart
├── cartItems      # Cart item management
├── cartCoupons    # Cart coupon management
├── checkout       # Checkout processing
└── orders         # Order management
```

## 📦 Installation

### Core Package

```bash
npm install @store-sdk/core
```

### Peer Dependencies

The SDK requires these peer dependencies:

```bash
npm install axios qs
```

## 🔌 WordPress Plugin

The Store SDK WordPress plugin is **essential** for `@store-sdk/core` to function properly. It's not just for JWT authentication - it extends WooCommerce API capabilities and ensures seamless integration.

### Overview

The Store SDK WordPress plugin provides:

- **🔐 JWT Authentication Endpoints** - Complete token lifecycle management (token, refresh, validation, revocation)
- **🛒 Enhanced WooCommerce Integration** - Extended API capabilities for headless commerce
- **📊 Order Tracking & Attribution** - Advanced tracking for marketing attribution
- **🌐 CORS Management** - Configurable cross-origin resource sharing
- **🔄 Token Refresh Flow** - Automatic token rotation with secure refresh mechanisms
- **🎫 One-Time Tokens** - Secure temporary tokens for autologin and special operations

### Installation

1. **Upload Plugin**: Copy `plugins/store-sdk/` to your WordPress `wp-content/plugins/` directory
2. **Configure Secret**: Add to your `wp-config.php`:
   ```php
   define('STORESDK_JWT_SECRET', 'your-very-long-random-secret-key-here');
   ```
3. **Activate**: Enable the plugin in WordPress admin or via WP-CLI

### Configuration Constants

The plugin provides extensive configuration through WordPress constants. All constants have sensible defaults and can be customized in your `wp-config.php`:

#### JWT Token Configuration

| Constant                                      | Default    | Description                                                 |
| --------------------------------------------- | ---------- | ----------------------------------------------------------- |
| `STORESDK_JWT_ENABLED`                        | `true`     | Master switch to enable/disable JWT functionality           |
| `STORESDK_JWT_SECRET`                         | _Required_ | JWT signing secret - must be defined for plugin to activate |
| `STORESDK_JWT_ACCESS_TTL`                     | `3600`     | Access token lifetime in seconds (1 hour)                   |
| `STORESDK_JWT_REFRESH_TTL`                    | `1209600`  | Refresh token lifetime in seconds (14 days)                 |
| `STORESDK_JWT_REFRESH_MIN_TTL`                | `86400`    | Minimum refresh token lifetime in seconds (1 day)           |
| `STORESDK_JWT_REFRESH_MAX_TTL`                | `2592000`  | Maximum refresh token lifetime in seconds (30 days)         |
| `STORESDK_JWT_ONE_TIME_TTL`                   | `300`      | One-time token lifetime in seconds (5 minutes)              |
| `STORESDK_JWT_ONE_TIME_MIN_TTL`               | `30`       | Minimum one-time token lifetime in seconds                  |
| `STORESDK_JWT_ONE_TIME_MAX_TTL`               | `900`      | Maximum one-time token lifetime in seconds (15 minutes)     |
| `STORESDK_JWT_REFRESH_MAX_TOKENS`             | `10`       | Maximum number of active refresh tokens per user            |
| `STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN` | `true`     | Require one-time token for autologin security               |
| `STORESDK_JWT_ENABLE_FRONT_CHANNEL`           | `true`     | Enable front-channel logout capabilities                    |
| `STORESDK_JWT_LEEWAY`                         | `1`        | JWT validation time leeway in seconds                       |

#### CORS Configuration

| Constant                              | Default                                     | Description                           |
| ------------------------------------- | ------------------------------------------- | ------------------------------------- |
| `STORESDK_JWT_CORS_ENABLE`            | `true`                                      | Enable CORS headers for API endpoints |
| `STORESDK_JWT_CORS_ALLOWED_ORIGINS`   | `'*'`                                       | Allowed origins for CORS requests     |
| `STORESDK_JWT_CORS_ALLOW_CREDENTIALS` | `true`                                      | Allow credentials in CORS requests    |
| `STORESDK_JWT_CORS_ALLOW_METHODS`     | `'GET, POST, PUT, PATCH, DELETE, OPTIONS'`  | Allowed HTTP methods                  |
| `STORESDK_JWT_CORS_ALLOW_HEADERS`     | `'Authorization, Content-Type, cart-token'` | Allowed request headers               |

#### Order Tracking & Attribution

| Constant                                | Default                                                        | Description                                      |
| --------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| `STORESDK_TRACKING_ENABLE`              | `true`                                                         | Enable order tracking and parameter attribution  |
| `STORESDK_TRACKING_WHITELISTED_PARAMS`  | `[]`                                                           | Array of URL parameters to track for attribution |
| `STORESDK_TRACKING_WHITELISTED_PATHS`   | `[]`                                                           | Array of URL paths where tracking is active      |
| `STORESDK_TRACKING_UNSET_ON_ORDER`      | `true`                                                         | Clear tracking session data after order creation |
| `STORESDK_TRACKING_SESSION_KEY`         | `'_storesdk_tracking'`                                         | Session key for storing tracking data            |
| `STORESDK_TRACKING_EXPIRY_TIME`         | `86400`                                                        | Tracking data expiry time in seconds (24 hours)  |
| `STORESDK_TRACKING_ADMIN_COLUMNS`       | `[['_store_sdk_source', 'SDK Source', 'order_status', 'Web']]` | Admin order table columns for tracking data      |
| `STORESDK_TRACKING_ADMIN_COLUMNS_AFTER` | `'order_status'`                                               | Column position for admin tracking columns       |

### Usage Example

```php
// wp-config.php
define('STORESDK_JWT_SECRET', 'your-256-bit-secret-key-here');
define('STORESDK_JWT_ACCESS_TTL', 7200);  // 2 hours
define('STORESDK_JWT_REFRESH_TTL', 604800);  // 7 days
define('STORESDK_JWT_CORS_ALLOWED_ORIGINS', 'https://yourdomain.com,https://app.yourdomain.com');
define('STORESDK_TRACKING_WHITELISTED_PARAMS', ['utm_source', 'utm_campaign', 'gclid']);
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { StoreSdk } from '@store-sdk/core';

// Initialize the SDK
await StoreSdk.init({
  baseUrl: 'https://your-woocommerce-site.com',
});

// Fetch products with pagination
const { data: products } = await StoreSdk.store.products.list({
  page: 1,
  per_page: 20,
  status: 'publish',
});

// Get current cart (creates guest cart if needed)
const { data: cart } = await StoreSdk.store.cart.get();

// Add product to cart
const { data: cartItem } = await StoreSdk.store.cartItems.create({
  product_id: 123,
  quantity: 2,
});
```

## API Reference

### Products

```typescript
// List products with filters and pagination
const { data: products } = await StoreSdk.store.products.list({
  page: 1,
  per_page: 20,
  search: 'laptop',
  category: '15',
  orderby: 'popularity',
  order: 'desc',
  on_sale: true,
  featured: true,
  min_price: '100',
  max_price: '500',
});

// Get single product
const { data: product } = await StoreSdk.store.products.retrieve(123);
```

### Categories

```typescript
// List categories
const { data: categories } = await StoreSdk.store.categories.list({
  page: 1,
  per_page: 50,
  hide_empty: true,
  parent: 0, // Top-level categories only
});

// Get category by ID
const { data: category } = await StoreSdk.store.categories.retrieve(15);
```

### Product Attributes & Terms

```typescript
// List product attributes
const { data: attributes } = await StoreSdk.store.attributes.list();

// Get attribute terms
const { data: terms } = await StoreSdk.store.attributesTerms.list(attributeId);
```

### Tags & Brands

```typescript
// List product tags
const { data: tags } = await StoreSdk.store.tags.list();

// List product brands (if supported by theme/plugins)
const { data: brands } = await StoreSdk.store.brands.list();
```

### Reviews

```typescript
// List product reviews
const { data: reviews } = await StoreSdk.store.reviews.list({
  product: 123,
  status: 'approved',
});

// Create review (requires authentication)
const { data: review } = await StoreSdk.store.reviews.create({
  product_id: 123,
  review: 'Great product!',
  rating: 5,
});
```

### Cart Management

```typescript
// Get current cart
const { data: cart } = await StoreSdk.store.cart.get();

// Add item to cart
const { data: cartItem } = await StoreSdk.store.cartItems.create({
  product_id: 123,
  quantity: 2,
  variation: [
    { attribute: 'pa_color', value: 'red' },
    { attribute: 'pa_size', value: 'large' },
  ],
});

// Update cart item quantity
const { data: updatedItem } = await StoreSdk.store.cartItems.update(
  'item-key',
  {
    quantity: 5,
  }
);

// Remove item from cart
await StoreSdk.store.cartItems.delete('item-key');

// Apply coupon
const { data: cartWithCoupon } = await StoreSdk.store.cartCoupons.create({
  code: 'DISCOUNT10',
});

// Remove coupon
await StoreSdk.store.cartCoupons.delete('DISCOUNT10');
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
    state: 'NY',
    postcode: '10001',
    country: 'US',
  },
  shipping: {
    first_name: 'John',
    last_name: 'Doe',
    address_1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postcode: '10001',
    country: 'US',
  },
  payment_method: 'stripe',
  payment_data: {
    // Payment method specific data
  },
  customer_note: 'Please deliver after 5 PM',
});
```

### Orders

```typescript
// List customer orders (requires authentication)
const { data: orders } = await StoreSdk.store.orders.list({
  page: 1,
  per_page: 10,
  status: 'completed',
});

// Get specific order
const { data: order } = await StoreSdk.store.orders.retrieve(456);
```

### Collection Data (Catalog Metadata)

```typescript
// Get collection data (price ranges, attribute terms, etc.)
const { data: collectionData } = await StoreSdk.store.collectionData.list({
  calculate_price_range: true,
  calculate_attribute_counts: true,
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

// Listen to authentication state changes
StoreSdk.events.on('auth:changed', (authenticated) => {
  if (authenticated) {
    console.log('User logged in');
    // Redirect to dashboard or fetch user-specific data
  } else {
    console.log('User logged out');
    // Clear sensitive data, redirect to login
  }
});

// Listen to nonce changes (CSRF protection)
StoreSdk.events.on('nonce:changed', (newNonce) => {
  console.log('Nonce updated for CSRF protection');
});

// Listen to cart token changes
StoreSdk.events.on('cart-token:changed', (token) => {
  console.log('Cart token updated');
});

// Listen to all events
StoreSdk.events.onAny((eventName, payload) => {
  console.log(`Event: ${eventName}`, payload);
});

// One-time event listeners
StoreSdk.events.once('cart:updated', (cart) => {
  console.log('Cart updated for the first time');
});
```

## ⚙️ Configuration

```typescript
await StoreSdk.init({
  baseUrl: 'https://your-woocommerce-site.com',

  // Nonce handling for CSRF protection
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

  // Authentication configuration (optional)
  auth: {
    useTokenInterceptor: true, // Automatically add auth headers
    useRefreshTokenInterceptor: true, // Automatically refresh expired tokens
    getToken: async () => localStorage.getItem('auth_token'),
    setToken: async (token) => localStorage.setItem('auth_token', token),
    getRefreshToken: async () => localStorage.getItem('refresh_token'),
    setRefreshToken: async (token) =>
      localStorage.setItem('refresh_token', token),
    clearToken: async () => localStorage.removeItem('auth_token'),
    fetchCartOnLogin: true, // Fetch cart after successful login
    revokeTokenBeforeLogin: false, // Clear token before new login
  },
});
```

## 🧪 Framework Integration

### React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { StoreSdk } from '@store-sdk/core';

export function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen to cart updates
    const unsubscribe = StoreSdk.events.on('cart:updated', (updatedCart) => {
      setCart(updatedCart);
      setError(null);
    });

    // Initial cart fetch
    StoreSdk.store.cart
      .get()
      .then(({ data }) => {
        setCart(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });

    return unsubscribe;
  }, []);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      await StoreSdk.store.cartItems.create({
        product_id: productId,
        quantity,
      });
    } catch (err) {
      setError(err);
    }
  };

  const removeFromCart = async (itemKey: string) => {
    try {
      await StoreSdk.store.cartItems.delete(itemKey);
    } catch (err) {
      setError(err);
    }
  };

  return { cart, loading, error, addToCart, removeFromCart };
}
```

### Angular Service Example

```typescript
import { Injectable, signal } from '@angular/core';
import { StoreSdk } from '@store-sdk/core';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartCount = signal(0);
  cart = signal(null);
  authenticated = signal(false);

  constructor() {
    // Listen to cart updates
    StoreSdk.events.on('cart:updated', (cart) => {
      this.cart.set(cart);
      const count =
        cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      this.cartCount.set(count);
    });

    // Listen to authentication changes
    StoreSdk.events.on('auth:changed', (authenticated) => {
      this.authenticated.set(authenticated);
    });
  }

  async addToCart(productId: number, quantity: number) {
    return await StoreSdk.store.cartItems.create({
      product_id: productId,
      quantity,
    });
  }

  async removeFromCart(itemKey: string) {
    return await StoreSdk.store.cartItems.delete(itemKey);
  }
}
```

### Vue Composition API Example

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import { StoreSdk } from '@store-sdk/core';

export function useCart() {
  const cart = ref(null);
  const loading = ref(true);
  const error = ref(null);

  let unsubscribeCart;

  onMounted(async () => {
    onUnmounted(() => {
    if (unsubscribeCart) unsubscribeCart();
  });

  const addToCart = async (productId, quantity) => {
    try {
      await StoreSdk.store.cartItems.create({
        product_id: productId,
        quantity,
      });
    } catch (err) {
      error.value = err;
    }
  };

  return { cart, loading, error, addToCart };
}
```

## ️ Development

### Prerequisites

- Node.js 20+
- npm (workspaces support)

### Setup

```bash
# Install dependencies
npm install

# Build all packages
npm run dev:rebuild

# Build specific package
npx nx build core

# Run tests
npx nx test core

# Run tests with coverage
npx nx test core --coverage

# Lint code
npx nx lint core

# Format code
npx prettier --write .
```

### Project Structure

```
packages/
├── core/                           # Main SDK package
│   ├── src/lib/
│   │   ├── sdk.ts                 # Main SDK class
│   │   ├── services/              # API services
│   │   │   └── store/             # Store API services
│   │   ├── interceptors/          # Request/response interceptors
│   │   ├── bus/                   # Event system
│   │   ├── types/                 # TypeScript definitions
│   │   └── utilities/             # Helper functions
│   └── tests/                     # Test suites
infra/
├── wordpress/                     # Docker WordPress environment
```

### Available Scripts

- **`npm run dev:rebuild`** - Clean rebuild of all packages
- **`npm run docs:tests`** - Generate test documentation
- **`npx nx run-many -t build`** - Build all packages
- **`npx nx run-many -t test`** - Run all tests
- **`npx nx run-many -t lint`** - Lint all packages

## 📄 Testing

The project maintains comprehensive test coverage with 165+ tests across multiple categories:

### Test Categories

- **Unit Tests** - Individual service and utility testing
- **Integration Tests** - Service interaction and interceptor testing
- **Flow Tests** - End-to-end user scenarios

### Running Tests

```bash
# Run all tests
npx nx test core

# Run with coverage
npx nx test core --coverage

# Run specific test pattern
npx nx test core --testNamePattern="Cart"

# Run tests in watch mode
npx nx test core --watch
```

### Test Documentation

Auto-generated test documentation is available in [`docs/TESTS.md`](docs/TESTS.md) and can be regenerated with:

```bash
npm run docs:tests
```

## 📞 Support

- **📧 Email**: kostasmakris23@gmail.com
- **🐛 Issues**: [GitHub Issues](https://github.com/kmakris23/store-sdk/issues)
- **📖 Documentation**: [GitHub Repository](https://github.com/kmakris23/store-sdk)
- **💬 Discussions**: [GitHub Discussions](https://github.com/kmakris23/store-sdk/discussions)

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the WordPress and WooCommerce community.
