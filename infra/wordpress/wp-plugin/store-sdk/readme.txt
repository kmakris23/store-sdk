=== Store SDK ===
Contributors: storesdk
Tags: jwt, authentication, woocommerce, headless, api
Requires at least: 6.3
Tested up to: 6.6
Requires PHP: 8.0
Stable tag: 1.0.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Unified authentication (JWT) endpoints backing the `@store-sdk/core` package.

== Description ==
Provides token issuance, refresh rotation, validation, one-time & autologin flows, and revoke endpoints for headless WooCommerce builds.

== Installation ==
1. Upload to `wp-content/plugins/store-sdk`.
2. Activate.
3. Define:
```
define('STORESDK_JWT_SECRET','your-long-random-secret');
```

== Changelog ==
= 1.0.0 =
Initial release.