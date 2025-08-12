import { EventBus } from '../bus/event.bus.js';
import { StoreSdkConfig } from '../configs/sdk.config.js';
import { StoreSdkEvent } from '../sdk.events.js';
import { StoreSdkState } from '../types/sdk.state.js';
import { CartCouponService } from './store/cart.coupon.service.js';
import { CartItemService } from './store/cart.item.service.js';
import { CartService } from './store/cart.service.js';
import { CheckoutService } from './store/checkout.service.js';
import { OrderService } from './store/order.service.js';
import { ProductAttributeService } from './store/product.attribute.service.js';
import { ProductAttributeTermService } from './store/product.attribute.term.service.js';
import { ProductBrandService } from './store/product.brand.service.js';
import { ProductCategoryService } from './store/product.category.service.js';
import { ProductCollectionDataService } from './store/product.collection.data.service.js';
import { ProductReviewService } from './store/product.review.service.js';
import { ProductService } from './store/product.service.js';
import { ProductTagService } from './store/product.tag.service.js';

export class StoreService {
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

  constructor(
    state: StoreSdkState,
    config: StoreSdkConfig,
    events: EventBus<StoreSdkEvent>
  ) {
    this._tags = new ProductTagService(state, config, events);
    this._orders = new OrderService(state, config, events);
    this._brands = new ProductBrandService(state, config, events);
    this._checkout = new CheckoutService(state, config, events);
    this._reviews = new ProductReviewService(state, config, events);
    this._products = new ProductService(state, config, events);
    this._categories = new ProductCategoryService(state, config, events);
    this._attributes = new ProductAttributeService(state, config, events);
    this._attributesTerms = new ProductAttributeTermService(
      state,
      config,
      events
    );
    this._collectionData = new ProductCollectionDataService(
      state,
      config,
      events
    );

    this._cart = new CartService(state, config, events);
    this._cartItems = new CartItemService(state, config, events);
    this._cartCoupons = new CartCouponService(state, config, events);
  }

  /**
   * Product Tags API
   */
  get tags() {
    return this._tags;
  }

  /**
   * Order API
   */
  get orders() {
    return this._orders;
  }

  /**
   * Product Brands API
   */
  get brands() {
    return this._brands;
  }

  /**
   * Checkout API
   */
  get checkout() {
    return this._checkout;
  }

  /**
   * Product Reviews API
   */
  get reviews() {
    return this._reviews;
  }

  /**
   * Products API
   */
  get products() {
    return this._products;
  }

  /**
   * Product Categories API
   */
  get categories() {
    return this._categories;
  }

  /**
   * Product Attributes API
   */
  get attributes() {
    return this._attributes;
  }

  /**
   * Product Attribute Terms API
   */
  get attributesTerms() {
    return this._attributesTerms;
  }

  /**
   * Product Collection Data API
   */
  get collectionData() {
    return this._collectionData;
  }

  /**
   * Cart API
   */
  get cart() {
    return this._cart;
  }

  /**
   * Cart Items API
   */
  get cartItems() {
    return this._cartItems;
  }

  /**
   * Cart Coupons API
   */
  get cartCoupons() {
    return this._cartCoupons;
  }
}
