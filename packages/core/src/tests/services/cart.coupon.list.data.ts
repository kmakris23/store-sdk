export const cartCouponListMock = [
  {
    code: '20off',
    type: 'fixed_cart',
    totals: {
      currency_code: 'GBP',
      currency_symbol: '£',
      currency_minor_unit: 2,
      currency_decimal_separator: '.',
      currency_thousand_separator: ',',
      currency_prefix: '£',
      currency_suffix: '',
      total_discount: '1667',
      total_discount_tax: '333',
    },
    _links: {
      self: [
        {
          href: 'http://local.wordpress.test/wp-json/wc/store/v1/cart/coupons/20off',
        },
      ],
      collection: [
        {
          href: 'http://local.wordpress.test/wp-json/wc/store/v1/cart/coupons',
        },
      ],
    },
  },
];
