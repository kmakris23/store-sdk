import { StoreSdkConfig } from './types/sdk.config.js';
import { CartCouponService } from './services/store/cart.coupon.service.js';
import { CartItemService } from './services/store/cart.item.service.js';
import { CartService } from './services/store/cart.service.js';
import { CheckoutService } from './services/store/checkout.service.js';
import { OrderService } from './services/store/order.service.js';
import { ProductAttributeService } from './services/store/product.attribute.service.js';
import { ProductAttributeTermService } from './services/store/product.attribute.term.service.js';
import { ProductBrandService } from './services/store/product.brand.service.js';
import { ProductCategoryService } from './services/store/product.category.service.js';
import { ProductCollectionDataService } from './services/store/product.collection.data.service.js';
import { ProductReviewService } from './services/store/product.review.service.js';
import { ProductService } from './services/store/product.service.js';
import { ProductTagService } from './services/store/product.tag.service.js';
import { StoreSdkState } from './types/sdk.state.js';
import { StoreSdkEventEmitter } from './sdk.event.emitter.js';
import { createHttpClient } from './services/api.js';
import { addCartTokenInterceptors } from './interceptors/cart.token.interceptor.js';
import { addNonceInterceptors } from './interceptors/nonce.interceptor.js';
import { addCartLoadingInterceptors } from './interceptors/cart.loading.interceptor.js';

export class Sdk {
  private _tags!: ProductTagService;
  private _orders!: OrderService;
  private _brands!: ProductBrandService;
  private _checkout!: CheckoutService;
  private _products!: ProductService;
  private _reviews!: ProductReviewService;
  private _categories!: ProductCategoryService;
  private _attributes!: ProductAttributeService;
  private _attributesTerms!: ProductAttributeTermService;
  private _collectionData!: ProductCollectionDataService;

  private _cart!: CartService;
  private _cartItems!: CartItemService;
  private _cartCoupons!: CartCouponService;

  state: StoreSdkState = {};

  private _initialized = false;

  events = new StoreSdkEventEmitter();

  public async init(config: StoreSdkConfig): Promise<void> {
    if (this._initialized) return;

    this._tags = new ProductTagService(this.state, config, this.events);
    this._orders = new OrderService(this.state, config, this.events);
    this._brands = new ProductBrandService(this.state, config, this.events);
    this._checkout = new CheckoutService(this.state, config, this.events);
    this._reviews = new ProductReviewService(this.state, config, this.events);
    this._products = new ProductService(this.state, config, this.events);
    this._categories = new ProductCategoryService(
      this.state,
      config,
      this.events
    );
    this._attributes = new ProductAttributeService(
      this.state,
      config,
      this.events
    );
    this._attributesTerms = new ProductAttributeTermService(
      this.state,
      config,
      this.events
    );
    this._collectionData = new ProductCollectionDataService(
      this.state,
      config,
      this.events
    );

    this._cart = new CartService(this.state, config, this.events);
    this._cartItems = new CartItemService(this.state, config, this.events);
    this._cartCoupons = new CartCouponService(this.state, config, this.events);

    createHttpClient({
      baseURL: config.baseUrl,
    });

    addNonceInterceptors(config, this.state, this.events);
    addCartTokenInterceptors(config, this.state, this.events);
    addCartLoadingInterceptors(this.events);

    const allPlugins = [...(config.plugins ?? [])];
    for (const plugin of allPlugins) {
      plugin.init();
      if (plugin.extend) {
        plugin.extend(this);
      }
    }

    this._initialized = true;

    await this._cart.get();
  }

  /**
   * Product Tags API
   */
  get tags() {
    this.throwIfNotInitized();
    return this._tags;
  }

  /**
   * Order API
   */
  get orders() {
    this.throwIfNotInitized();
    return this._orders;
  }

  /**
   * Product Brands API
   */
  get brands() {
    this.throwIfNotInitized();
    return this._brands;
  }

  /**
   * Checkout API
   */
  get checkout() {
    this.throwIfNotInitized();
    return this._checkout;
  }

  /**
   * Product Reviews API
   */
  get reviews() {
    this.throwIfNotInitized();
    return this._reviews;
  }

  /**
   * Products API
   */
  get products() {
    this.throwIfNotInitized();
    return this._products;
  }

  /**
   * Product Categories API
   */
  get categories() {
    this.throwIfNotInitized();
    return this._categories;
  }

  /**
   * Product Attributes API
   */
  get attributes() {
    this.throwIfNotInitized();
    return this._attributes;
  }

  /**
   * Product Attribute Terms API
   */
  get attributesTerms() {
    this.throwIfNotInitized();
    return this._attributesTerms;
  }

  /**
   * Product Collection Data API
   */
  get collectionData() {
    this.throwIfNotInitized();
    return this._collectionData;
  }

  /**
   * Cart API
   */
  get cart() {
    this.throwIfNotInitized();
    return this._cart;
  }

  /**
   * Cart Items API
   */
  get cartItems() {
    this.throwIfNotInitized();
    return this._cartItems;
  }

  /**
   * Cart Coupons API
   */
  get cartCoupons() {
    this.throwIfNotInitized();
    return this._cartCoupons;
  }

  private throwIfNotInitized() {
    if (this._initialized) return;
    throw new Error('SDK not initialized. Call `await StoreSdk.init()` first.');
  }
}

export const StoreSdk = new Sdk();
