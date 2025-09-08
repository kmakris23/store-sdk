# Test Suites Overview

> Auto-generated test documentation. Total tests: **165** across **38** spec files.

Regenerate with: `npm run docs:tests`

<details><summary><strong>flow</strong> — 1 tests in 1 files</summary>

| File                            | Suites | Tests |
| ------------------------------- | ------ | ----- |
| flow/user.checkout.flow.spec.ts | 1      | 1     |

<details><summary>flow/user.checkout.flow.spec.ts (1 tests)</summary>

- **Flow: Guest user checkout creates order**
  - executes guest checkout flow and creates an order

</details>

</details>

<details><summary><strong>integration</strong> — 50 tests in 11 files</summary>

| File                                                    | Suites | Tests |
| ------------------------------------------------------- | ------ | ----- |
| integration/cart.core.integration.spec.ts               | 1      | 6     |
| integration/cart.coupons.integration.spec.ts            | 1      | 6     |
| integration/cart.items.integration.spec.ts              | 1      | 4     |
| integration/categories.integration.spec.ts              | 1      | 9     |
| integration/checkout.order.integration.spec.ts          | 1      | 4     |
| integration/order.integration.spec.ts                   | 1      | 2     |
| integration/product.attributes.integration.spec.ts      | 1      | 2     |
| integration/product.collection-data.integration.spec.ts | 1      | 2     |
| integration/product.reviews.integration.spec.ts         | 1      | 3     |
| integration/product.taxonomies.integration.spec.ts      | 1      | 4     |
| integration/products.integration.spec.ts                | 1      | 8     |

<details><summary>integration/cart.core.integration.spec.ts (6 tests)</summary>

- **Integration: Cart Core Operations**
  - retrieves initial cart (may be empty)
  - adds an item then updates quantity best-effort
  - removes an item when key available (graceful if none)
  - applies and removes coupon via cart service (best-effort)
  - updates customer information (best-effort)
  - selects shipping rate (likely error if no rates)

</details>

<details><summary>integration/cart.coupons.integration.spec.ts (6 tests)</summary>

- **Integration: Cart Coupons (graceful handling)**
  - handles list coupons (likely empty) without error
  - gracefully rejects invalid coupon code
  - applies a valid coupon (idempotent)
  - removes an applied coupon
  - removing a non-existent coupon provides error or silent success
  - cart coupons array remains an array after multiple operations

</details>

<details><summary>integration/cart.items.integration.spec.ts (4 tests)</summary>

- **Integration: Cart Items (read-only robustness)**
  - lists cart items (may be empty) and tolerates add attempt
  - adds the same product twice (if possible) and quantity is stable or increases
  - gracefully handles attempt to add an invalid product id
  - lists remains consistent array after multiple best-effort operations

</details>

<details><summary>integration/categories.integration.spec.ts (9 tests)</summary>

- **Integration: Product Categories**
  - lists categories and fetches a single category
  - paginates categories (page=1 then page=2 may be empty)
  - enforces per_page limit when possible
  - category objects expose basic expected shape
  - search filters categories (best effort)
  - filters by parent when parent parameter is used (best effort)
  - handles non-existent category id gracefully
  - supports concurrent list requests without state interference
  - fetches each first-page category individually (best effort subset)

</details>

<details><summary>integration/checkout.order.integration.spec.ts (4 tests)</summary>

- **Integration: Checkout & Order**
  - retrieves checkout data or empty-cart error
  - fails to process order with missing billing fields (expect error)
  - updates checkout (order notes) best-effort
  - attempts to process order (best-effort, may not finalize)

</details>

<details><summary>integration/order.integration.spec.ts (2 tests)</summary>

- **Integration: Order (pay-for-order endpoint)**
  - retrieves order without billing email (expects data if created else explicit error)
  - retrieves order with billing email (expects data if created else explicit error)

</details>

<details><summary>integration/product.attributes.integration.spec.ts (2 tests)</summary>

- **Integration: Product Attributes & Terms**
  - lists attributes and retrieves terms for the size attribute
  - handles terms request for non-existent attribute id

</details>

<details><summary>integration/product.collection-data.integration.spec.ts (2 tests)</summary>

- **Integration: Product Collection Data**
  - calculates aggregate collection data (min/max price)
  - re-calculates collection data after a product list request (consistency)

</details>

<details><summary>integration/product.reviews.integration.spec.ts (3 tests)</summary>

- **Integration: Product Reviews**
  - lists product reviews (expects deterministic seeding of 3 reviews per product)
  - lists reviews with small per_page (pagination sanity)
  - filters reviews by product_id (best-effort, tolerant)

</details>

<details><summary>integration/product.taxonomies.integration.spec.ts (4 tests)</summary>

- **Integration: Product Taxonomies (categories, tags, brands)**
  - lists product categories and fetches single (total may be undefined)
  - lists product tags (total may be undefined)
  - lists product brands and fetches single (total may be undefined)
  - handles non-existent brand gracefully

</details>

<details><summary>integration/products.integration.spec.ts (8 tests)</summary>

- **Integration: Products**
  - lists products with pagination and filtering (search by Category 1)
  - fetches single product by id and slug equivalence
  - filters products by on_sale=false (most seeded simple products not explicitly on sale)
  - sorts products by price ascending (best-effort, tolerant)
  - handles non-existent product id with error
  - filters by category (best-effort) if any category products seeded
  - search with unlikely token returns empty or array
  - sorts products by price descending (best-effort)

</details>

</details>

<details><summary><strong>unit</strong> — 114 tests in 26 files</summary>

| File                                                  | Suites | Tests |
| ----------------------------------------------------- | ------ | ----- |
| unit/api.http-client.spec.ts                          | 1      | 1     |
| unit/axios.utility.error.spec.ts                      | 1      | 1     |
| unit/axios.utility.methods.spec.ts                    | 1      | 5     |
| unit/event.bus.extra.spec.ts                          | 1      | 2     |
| unit/event.bus.spec.ts                                | 1      | 10    |
| unit/interceptors.spec.ts                             | 1      | 4     |
| unit/jwt.utility.spec.ts                              | 1      | 5     |
| unit/plugins/multiple-plugins.integration.spec.ts     | 1      | 5     |
| unit/plugins/plugin.architecture.spec.ts              | 1      | 6     |
| unit/plugins/simple-jwt-login.integration.spec.ts     | 1      | 6     |
| unit/sdk.guard.spec.ts                                | 1      | 2     |
| unit/services/cart.coupon.service.spec.ts             | 1      | 9     |
| unit/services/cart.item.service.spec.ts               | 1      | 7     |
| unit/services/cart.service.spec.ts                    | 1      | 9     |
| unit/services/checkout.order.service.spec.ts          | 1      | 2     |
| unit/services/checkout.service.spec.ts                | 1      | 5     |
| unit/services/order.service.spec.ts                   | 1      | 3     |
| unit/services/product.attribute.service.spec.ts       | 1      | 3     |
| unit/services/product.attribute.term.service.spec.ts  | 1      | 3     |
| unit/services/product.brand.service.spec.ts           | 1      | 4     |
| unit/services/product.category.service.spec.ts        | 1      | 4     |
| unit/services/product.collection.data.service.spec.ts | 1      | 3     |
| unit/services/product.review.service.spec.ts          | 1      | 3     |
| unit/services/product.service.spec.ts                 | 1      | 6     |
| unit/services/product.tag.service.spec.ts             | 1      | 3     |
| unit/services/store.service.spec.ts                   | 1      | 3     |

<details><summary>unit/api.http-client.spec.ts (1 tests)</summary>

- **api http client**
  - createHttpClient is idempotent and proxy forwards methods

</details>

<details><summary>unit/axios.utility.error.spec.ts (1 tests)</summary>

- **axios.utility error path**
  - returns error structure on axios error

</details>

<details><summary>unit/axios.utility.methods.spec.ts (5 tests)</summary>

- **axios.utility helper methods**
  - doGet invokes request with method get
  - doPost sends data with method post
  - doPut sends data with method put
  - doDelete uses delete method
  - doHead sets method head and custom validateStatus

</details>

<details><summary>unit/event.bus.extra.spec.ts (2 tests)</summary>

- **EventBus extra coverage**
  - middleware disposer removes middleware
  - onAny disposer removes handler

</details>

<details><summary>unit/event.bus.spec.ts (10 tests)</summary>

- **EventBus**
  - on / emit / off basic flow
  - once only fires a single time
  - emit without payload for void events
  - emitIf respects condition and returns boolean
  - middleware chains in order then listeners fire
  - onAny receives all events after specific handlers
  - waitFor resolves when predicate matches, supports timeout
  - waitFor rejects on timeout
  - scope shares underlying listeners via prefix
  - clear removes all listeners, any listeners, and middleware

</details>

<details><summary>unit/interceptors.spec.ts (4 tests)</summary>

- **Interceptors**
  - cart token interceptor adds header, sets state, emits event
  - cart token interceptor disabled path
  - nonce interceptor adds header and emits event
  - nonce interceptor disabled path

</details>

<details><summary>unit/jwt.utility.spec.ts (5 tests)</summary>

- **jwt.utility**
  - getJwtExpiration returns null when no token
  - getJwtExpiration returns a future date
  - isJwtExpired true for missing token
  - isJwtExpired false for future token
  - isJwtExpired true for past token

</details>

<details><summary>unit/plugins/multiple-plugins.integration.spec.ts (5 tests)</summary>

- **Multiple Plugins Integration**
  - should initialize multiple plugins in order
  - should allow multiple plugins to extend the SDK
  - should handle empty plugins array
  - should handle missing plugins property
  - should preserve existing SDK functionality with plugins

</details>

<details><summary>unit/plugins/plugin.architecture.spec.ts (6 tests)</summary>

- **Plugin Architecture**
  - should call plugin methods in correct order
  - should pass correct parameters to registerEventHandlers
  - should allow plugins to register event handlers
  - should allow plugins to extend the SDK
  - should handle plugins without registerEventHandlers method
  - should process multiple plugins correctly

</details>

<details><summary>unit/plugins/simple-jwt-login.integration.spec.ts (6 tests)</summary>

- **Simple JWT Login Plugin Integration**
  - should register simple-jwt-login event handlers via new architecture
  - should fetch cart on login when fetchCartOnLogin is true
  - should not fetch cart on login when fetchCartOnLogin is false
  - should clear tokens on logout
  - should extend SDK with simple-jwt capabilities
  - should work without nonce or cartToken configured

</details>

<details><summary>unit/sdk.guard.spec.ts (2 tests)</summary>

- **Sdk guards**
  - throws when accessing store before init
  - second init call is a no-op

</details>

<details><summary>unit/services/cart.coupon.service.spec.ts (9 tests)</summary>

- **CartCouponService**
  - list() parses pagination headers and link header
  - single() fetches coupon by code
  - single() returns error when not found
  - add() emits loading and success events sequence
  - add() emits error event on failure
  - delete() emits success events
  - delete() emits error events
  - clear() emits success events
  - clear() emits error events

</details>

<details><summary>unit/services/cart.item.service.spec.ts (7 tests)</summary>

- **CartItemService**
  - lists items
  - gets single item
  - adds item and emits events
  - updates item
  - removes item
  - clears items
  - handles error on list

</details>

<details><summary>unit/services/cart.service.spec.ts (9 tests)</summary>

- **CartService**
  - gets cart and emits events
  - adds item and emits sequence
  - updates item
  - removes item
  - applies coupon
  - removes coupon
  - updates customer
  - selects shipping rate
  - handles error and emits error event

</details>

<details><summary>unit/services/checkout.order.service.spec.ts (2 tests)</summary>

- **CheckoutOrderService**
  - processes order and payment
  - handles error

</details>

<details><summary>unit/services/checkout.service.spec.ts (5 tests)</summary>

- **CheckoutService**
  - gets checkout data
  - updates checkout data with calc totals
  - processes order and payment
  - handles error on update
  - handles error on process

</details>

<details><summary>unit/services/order.service.spec.ts (3 tests)</summary>

- **OrderService**
  - gets order with billing email
  - gets order without billing email
  - handles error path

</details>

<details><summary>unit/services/product.attribute.service.spec.ts (3 tests)</summary>

- **ProductAttributeService**
  - lists attributes with headers
  - gets single attribute
  - single attribute error

</details>

<details><summary>unit/services/product.attribute.term.service.spec.ts (3 tests)</summary>

- **ProductAttributeTermService**
  - lists attribute terms without params and parses headers
  - lists attribute terms with params
  - handles error path

</details>

<details><summary>unit/services/product.brand.service.spec.ts (4 tests)</summary>

- **ProductBrandService**
  - lists brands and parses headers
  - lists brands with pagination params
  - gets single brand
  - single brand error path

</details>

<details><summary>unit/services/product.category.service.spec.ts (4 tests)</summary>

- **ProductCategoryService**
  - lists categories and parses headers
  - lists categories with params
  - gets single category
  - single category error path

</details>

<details><summary>unit/services/product.collection.data.service.spec.ts (3 tests)</summary>

- **ProductCollectionDataService**
  - calculates collection data without params
  - calculates with params and serializes query
  - handles error path

</details>

<details><summary>unit/services/product.review.service.spec.ts (3 tests)</summary>

- **ProductReviewService**
  - lists reviews and parses headers
  - lists with params
  - list error path

</details>

<details><summary>unit/services/product.service.spec.ts (6 tests)</summary>

- **ProductService**
  - lists products without params and parses pagination headers
  - serializes complex query params including arrays and ordering
  - handles _unstable_tax_ and \_unstable_tax_operator param flattening and clears originals
  - gets single product by id
  - gets single product by slug
  - returns error on single product fetch failure

</details>

<details><summary>unit/services/product.tag.service.spec.ts (3 tests)</summary>

- **ProductTagService**
  - lists tags
  - lists tags with params
  - handles list error

</details>

<details><summary>unit/services/store.service.spec.ts (3 tests)</summary>

- **StoreService (composition)**
  - exposes all expected service getters
  - returns the same reference for repeated getter access (singleton per sub-service)
  - does not mutate provided state object reference

</details>

</details>
