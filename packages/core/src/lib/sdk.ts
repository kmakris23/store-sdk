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

class Sdk {
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

  private _state: StoreSdkState = {};

  private _initialized = false;

  events = new StoreSdkEventEmitter();
  private _internalEvents = new StoreSdkEventEmitter();

  public async init(config: StoreSdkConfig): Promise<void> {
    if (this._initialized) return;

    this._tags = new ProductTagService(config.baseUrl);
    this._orders = new OrderService(config.baseUrl);
    this._brands = new ProductBrandService(config.baseUrl);
    this._checkout = new CheckoutService(config.baseUrl);
    this._reviews = new ProductReviewService(config.baseUrl);
    this._products = new ProductService(config.baseUrl);
    this._categories = new ProductCategoryService(config.baseUrl);
    this._attributes = new ProductAttributeService(config.baseUrl);
    this._attributesTerms = new ProductAttributeTermService(config.baseUrl);
    this._collectionData = new ProductCollectionDataService(config.baseUrl);

    this._cart = new CartService(this._internalEvents, config, this._state, {});
    this._cartItems = new CartItemService(config.baseUrl);
    this._cartCoupons = new CartCouponService(config.baseUrl);

    this._initialized = true;

    this._internalEvents.on('cartTokenChanged', (cartToken: string) => {
      this.setCartToken(cartToken);
      this.events.emit('cartTokenChanged', cartToken);
    });

    await this._cart.get();
  }

  setNonce(nonce: string) {
    this._state.nonce = nonce;
  }
  setCartHash(cartHash: string) {
    this._state.cartHash = cartHash;
  }
  setCartToken(cartToken: string) {
    this._state.cartToken = cartToken;
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
