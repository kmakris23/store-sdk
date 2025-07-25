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
import { Config } from './types/config';

export class StoreSdk {
  readonly tags: ProductTagService;
  readonly orders: OrderService;
  readonly brands: ProductBrandService;
  readonly checkout: CheckoutService;
  readonly products: ProductService;
  readonly reviews: ProductReviewService;
  readonly categories: ProductCategoryService;
  readonly attributes: ProductAttributeService;
  readonly attributesTerms: ProductAttributeTermService;
  readonly collectionData: ProductCollectionDataService;

  readonly cart: CartService;
  readonly cartItems: CartItemService;
  readonly cartCoupons: CartCouponService;

  constructor(config: Config) {
    this.orders = new OrderService(config.baseUrl);
    this.checkout = new CheckoutService(config.baseUrl);

    this.tags = new ProductTagService(config.baseUrl);
    this.brands = new ProductBrandService(config.baseUrl);
    this.reviews = new ProductReviewService(config.baseUrl);
    this.products = new ProductService(config.baseUrl);
    this.categories = new ProductCategoryService(config.baseUrl);
    this.attributes = new ProductAttributeService(config.baseUrl);
    this.attributesTerms = new ProductAttributeTermService(config.baseUrl);
    this.collectionData = new ProductCollectionDataService(config.baseUrl);

    this.cart = new CartService(config.baseUrl);
    this.cartItems = new CartItemService(config.baseUrl);
    this.cartCoupons = new CartCouponService(config.baseUrl);
  }
}
