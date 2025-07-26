import { StoreSdkConfig } from './types/sdk.config';
import { CartCouponService } from './services/store/cart.coupon.service';
import { CartItemService } from './services/store/cart.item.service';
import { CartService } from './services/store/cart.service';
import { CheckoutService } from './services/store/checkout.service';
import { OrderService } from './services/store/order.service';
import { ProductAttributeService } from './services/store/product.attribute.service';
import { ProductAttributeTermService } from './services/store/product.attribute.term.service';
import { ProductBrandService } from './services/store/product.brand.service';
import { ProductCategoryService } from './services/store/product.category.service';
import { ProductCollectionDataService } from './services/store/product.collection.data.service';
import { ProductReviewService } from './services/store/product.review.service';
import { ProductService } from './services/store/product.service';
import { ProductTagService } from './services/store/product.tag.service';

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

  private _initialized = false;

  public init = (config: StoreSdkConfig) => {
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

    this._cart = new CartService(config.baseUrl);
    this._cartItems = new CartItemService(config.baseUrl);
    this._cartCoupons = new CartCouponService(config.baseUrl);

    this._initialized = true;
  };

  tags = () => {
    this.throwIfNotInitized();
    return this._tags;
  };
  orders = () => {
    this.throwIfNotInitized();
    return this._orders;
  };
  brands = () => {
    this.throwIfNotInitized();
    return this._brands;
  };
  checkout = () => {
    this.throwIfNotInitized();
    return this._checkout;
  };
  reviews = () => {
    this.throwIfNotInitized();
    return this._reviews;
  };
  products = () => {
    this.throwIfNotInitized();
    return this._products;
  };
  categories = () => {
    this.throwIfNotInitized();
    return this._categories;
  };
  attributes = () => {
    this.throwIfNotInitized();
    return this._attributes;
  };
  attributesTerms = () => {
    this.throwIfNotInitized();
    return this._attributesTerms;
  };
  collectionData = () => {
    this.throwIfNotInitized();
    return this._collectionData;
  };

  cart = () => {
    this.throwIfNotInitized();
    return this._cart;
  };
  cartItems = () => {
    this.throwIfNotInitized();
    return this._cartItems;
  };
  cartCoupons = () => {
    this.throwIfNotInitized();
    return this._cartCoupons;
  };

  private throwIfNotInitized = () => {
    if (this._initialized) return;
    throw new Error('SDK not initialized. Call StoreSdk.init(config) first.');
  };
}

export const StoreSdk = new Sdk();
