=== Store SDK ===
Contributors: storesdk, kmakris23
Donate link: https://github.com/sponsors/kmakris23
Tags: woocommerce, jwt, authentication, headless, api
Requires at least: 6.3
Tested up to: 6.8
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Network: true

Comprehensive JWT authentication plugin for headless WooCommerce integrations with token management, CORS support, and security features.

== Description ==

Store SDK is a robust WordPress plugin that provides secure JWT-based authentication endpoints specifically designed for headless WooCommerce applications. It seamlessly integrates with the `@store-sdk/core` package to deliver a complete authentication solution for modern e-commerce development.

**Transform your WooCommerce store into a headless powerhouse** with enterprise-grade JWT authentication, automatic token management, and bulletproof security features.

**Key Features:**

* 🔐 **Secure JWT Authentication** - Industry-standard token-based authentication
* 🔄 **Automatic Token Refresh** - Seamless token rotation with configurable TTL
* 🎫 **One-Time Tokens** - Secure temporary tokens for sensitive operations
* 🚀 **Autologin Flow** - Smooth user authentication for frontend applications
* 🌐 **CORS Support** - Configurable cross-origin resource sharing
* 🛡️ **Enhanced Security** - Protection against common security threats
* ⚙️ **Highly Configurable** - Extensive customization via WordPress constants
* 🧹 **Clean Uninstall** - Complete data removal when deactivated

**Perfect for:**
* Headless WooCommerce stores
* React/Vue/Angular storefronts
* Mobile app backends
* API-first e-commerce solutions
* Multi-platform integrations

**API Endpoints Included:**
* Token issuance (`/wp-json/storesdk/v1/token`)
* Token refresh (`/wp-json/storesdk/v1/token/refresh`)
* Token validation (`/wp-json/storesdk/v1/token/validate`)
* One-time tokens (`/wp-json/storesdk/v1/token/one-time`)
* Autologin (`/wp-json/storesdk/v1/autologin`)
* Token revocation (`/wp-json/storesdk/v1/token/revoke`)

== Installation ==

= Automatic Installation =
1. Log in to your WordPress dashboard
2. Navigate to Plugins → Add New
3. Search for "Store SDK"
4. Click "Install Now" and then "Activate"

= Manual Installation =
1. Download the plugin files
2. Upload to `/wp-content/plugins/store-sdk/`
3. Activate the plugin through the 'Plugins' menu in WordPress

= Required Configuration =
After activation, add this to your `wp-config.php`:

```php
define('STORESDK_JWT_SECRET', 'your-very-long-random-secret-key-here');
```

**Important:** Use a strong, random secret key (minimum 32 characters) for security.

== Frequently Asked Questions ==

= What is JWT authentication? =
JWT (JSON Web Token) is a secure method for transmitting information between parties. It's perfect for stateless authentication in modern web applications and APIs.

= Do I need WooCommerce installed? =
While the plugin is designed for WooCommerce integrations, it can work with any WordPress site. However, WooCommerce is recommended for e-commerce functionality.

= Is this plugin secure? =
Yes! The plugin implements industry-standard security practices including:
- HMAC-SHA256 token signing
- Configurable token expiration
- Automatic token rotation
- Protection against common attacks
- Secure token revocation

= Can I customize the token TTL? =
Absolutely! You can configure token lifetimes using WordPress constants:
- `STORESDK_JWT_ACCESS_TTL` - Access token TTL (default: 1 hour)
- `STORESDK_JWT_REFRESH_TTL` - Refresh token TTL (default: 14 days)
- `STORESDK_JWT_ONE_TIME_TTL` - One-time token TTL (default: 5 minutes)

= How do I configure CORS? =
Use these constants in your `wp-config.php`:
```php
define('STORESDK_JWT_CORS_ALLOWED_ORIGINS', 'https://yourfrontend.com');
define('STORESDK_JWT_CORS_ALLOW_CREDENTIALS', true);
```

= Does this work with multisite? =
Yes, the plugin is fully compatible with WordPress multisite installations.

= How do I get support? =
For technical support and feature requests, please visit our GitHub repository or contact our support team.

== Configuration ==

The plugin offers extensive configuration options via WordPress constants:

**JWT Settings:**
```php
define('STORESDK_JWT_ACCESS_TTL', 3600); // 1 hour
define('STORESDK_JWT_REFRESH_TTL', 1209600); // 14 days
define('STORESDK_JWT_REFRESH_MAX_TOKENS', 10);
```

**CORS Settings:**
```php
define('STORESDK_JWT_CORS_ENABLE', true);
define('STORESDK_JWT_CORS_ALLOWED_ORIGINS', '*');
define('STORESDK_JWT_CORS_ALLOW_CREDENTIALS', true);
```

**Security Settings:**
```php
define('STORESDK_JWT_LEEWAY', 1);
define('STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN', true);
```

See the full documentation in the plugin's README.md file.

== Hooks and Filters ==

**Actions:**
* `storesdk_jwt_auth_loaded` - Plugin fully loaded
* `storesdk_jwt_token_issued` - Token issued to user
* `storesdk_jwt_token_refreshed` - Token refreshed
* `storesdk_jwt_token_revoked` - Token revoked

**Filters:**
* `storesdk_jwt_token_payload` - Modify token payload
* `storesdk_jwt_access_ttl` - Customize token TTL
* `storesdk_jwt_cors_allowed_origins` - Modify CORS origins

== Changelog ==

= 1.0.0 =
* Initial release
* JWT authentication endpoints (token, refresh, validate, revoke)
* One-time token support for secure operations
* Autologin functionality for seamless user experience
* Comprehensive CORS handling with configurable origins
* Token refresh rotation mechanism
* Security features and protection mechanisms
* Admin interface with configuration validation
* Multisite compatibility
* Clean uninstall with complete data removal
* Extensive configuration options via WordPress constants
* REST API integration with proper namespacing
* Documentation and developer hooks

== Upgrade Notice ==

= 1.0.0 =
Initial release of Store SDK. Configure your JWT secret key after activation for security.

== Support ==

**Need Help?**
* 📖 [Documentation](https://github.com/kmakris23/store-sdk/wiki)
* 🐛 [Report Issues](https://github.com/kmakris23/store-sdk/issues)
* 💬 [Community Support](https://github.com/kmakris23/store-sdk/discussions)
* 🚀 [Feature Requests](https://github.com/kmakris23/store-sdk/issues/new?template=feature_request.md)

**Professional Support**
For enterprise support, custom integrations, or consulting services, please contact us through our GitHub repository.

== Privacy and Data ==

Store SDK respects your privacy and follows WordPress best practices:

* **No Data Collection**: The plugin does not collect or transmit any personal data
* **Local Storage Only**: All tokens and configurations are stored locally in your WordPress database
* **GDPR Compliant**: No external services or data sharing
* **Clean Uninstall**: Complete removal of all plugin data when uninstalled

== Third Party Services ==

This plugin does not connect to any third-party services. All authentication processing happens locally on your WordPress installation.

== Developer Information ==

**Hooks & Actions Available:**
* `storesdk_jwt_auth_loaded` - Fired when plugin is fully loaded
* `storesdk_jwt_token_issued` - Fired when a token is issued
* `storesdk_jwt_token_refreshed` - Fired when a token is refreshed
* `storesdk_jwt_token_revoked` - Fired when a token is revoked

**Filters Available:**
* `storesdk_jwt_token_payload` - Modify token payload before encoding
* `storesdk_jwt_access_ttl` - Customize access token TTL
* `storesdk_jwt_cors_allowed_origins` - Modify CORS allowed origins

**GitHub Repository:** [https://github.com/kmakris23/store-sdk](https://github.com/kmakris23/store-sdk)

== Credits ==

* **Lead Developer**: [Konstantinos Makris](https://github.com/kmakris23)
* **Framework**: WordPress REST API
* **License**: MIT License
* **Contributing**: Pull requests welcome on GitHub
