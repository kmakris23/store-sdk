# Store SDK WordPress Plugin

A comprehensive JWT authentication plugin designed to support headless WooCommerce integrations through the `@store-sdk/core` package.

## Overview

The Store SDK plugin provides secure JWT-based authentication endpoints for headless e-commerce applications built with WooCommerce. It offers token issuance, refresh rotation, validation, one-time tokens, autologin flows, and token revocation capabilities.

## Features

- 🔐 **JWT Authentication**: Secure token-based authentication for headless applications
- 🔄 **Token Refresh**: Automatic token rotation with configurable TTL
- 🎫 **One-Time Tokens**: Secure temporary tokens for specific operations
- 🚀 **Autologin Flow**: Seamless user authentication for frontend applications
- 🌐 **CORS Support**: Configurable cross-origin resource sharing
- 🛡️ **Security**: Built-in protection against common attacks
- ⚙️ **Configurable**: Extensive configuration options via WordPress constants
- 🧹 **Clean Uninstall**: Complete removal of plugin data when uninstalled

## Requirements

- **WordPress**: 6.3 or higher
- **PHP**: 8.0 or higher
- **WooCommerce**: Latest stable version (recommended)

## Installation

### 1. Upload Plugin Files

```bash
# Upload to your WordPress plugins directory
wp-content/plugins/store-sdk/
```

### 2. Define JWT Secret

Add the following to your `wp-config.php`:

```php
define('STORESDK_JWT_SECRET', 'your-very-long-random-secret-key-here');
```

**⚠️ Important**: Use a strong, random secret key. This is critical for security.

### 3. Activate Plugin

Activate the plugin through the WordPress admin interface or via WP-CLI:

```bash
wp plugin activate store-sdk
```

## Configuration

The plugin can be configured using WordPress constants in your `wp-config.php` file:

### JWT Token Settings

```php
// Access token TTL (default: 3600 seconds / 1 hour)
define('STORESDK_JWT_ACCESS_TTL', 3600);

// Refresh token TTL (default: 1209600 seconds / 14 days)
define('STORESDK_JWT_REFRESH_TTL', 60 * 60 * 24 * 14);

// Refresh token minimum TTL (default: 86400 seconds / 1 day)
define('STORESDK_JWT_REFRESH_MIN_TTL', 60 * 60 * 24);

// Refresh token maximum TTL (default: 2592000 seconds / 30 days)
define('STORESDK_JWT_REFRESH_MAX_TTL', 60 * 60 * 24 * 30);

// Maximum refresh tokens per user (default: 10)
define('STORESDK_JWT_REFRESH_MAX_TOKENS', 10);

// JWT leeway for time validation (default: 1 second)
define('STORESDK_JWT_LEEWAY', 1);
```

### One-Time Token Settings

```php
// One-time token TTL (default: 300 seconds / 5 minutes)
define('STORESDK_JWT_ONE_TIME_TTL', 300);

// One-time token minimum TTL (default: 30 seconds)
define('STORESDK_JWT_ONE_TIME_MIN_TTL', 30);

// One-time token maximum TTL (default: 900 seconds / 15 minutes)
define('STORESDK_JWT_ONE_TIME_MAX_TTL', 900);

// Require one-time token for autologin (default: true)
define('STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN', true);
```

### CORS Configuration

```php
// Enable CORS (default: true)
define('STORESDK_JWT_CORS_ENABLE', true);

// Allowed origins (default: '*')
define('STORESDK_JWT_CORS_ALLOWED_ORIGINS', 'https://yourfrontend.com,https://admin.yoursite.com');

// Allow credentials (default: true)
define('STORESDK_JWT_CORS_ALLOW_CREDENTIALS', true);

// Allowed methods (default: 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
define('STORESDK_JWT_CORS_ALLOW_METHODS', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

// Allowed headers (default: 'Authorization, Content-Type, cart-token')
define('STORESDK_JWT_CORS_ALLOW_HEADERS', 'Authorization, Content-Type, cart-token');
```

### Plugin Control

```php
// Enable/disable plugin functionality (default: true)
define('STORESDK_JWT_ENABLED', true);

// Enable front-channel logout (default: true)
define('STORESDK_JWT_ENABLE_FRONT_CHANNEL', true);
```

## API Endpoints

All endpoints are available under the `/wp-json/storesdk/v1/` namespace:

### 1. Token Issuance

**POST** `/wp-json/storesdk/v1/token`

Issues access and refresh tokens for valid user credentials.

```json
{
  "username": "user@example.com",
  "password": "userpassword"
}
```

**Response:**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user_email": "user@example.com",
    "user_nicename": "user",
    "user_display_name": "User Name",
    "refresh_token": "rt_abc123def456..."
  }
}
```

### 2. Token Refresh

**POST** `/wp-json/storesdk/v1/token/refresh`

Refreshes an access token using a valid refresh token.

```json
{
  "refresh_token": "rt_abc123def456..."
}
```

### 3. Token Validation

**POST** `/wp-json/storesdk/v1/token/validate`

Validates a JWT access token.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. One-Time Token

**POST** `/wp-json/storesdk/v1/token/one-time`

Generates a one-time use token for secure operations.

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Parameters:**

```json
{
  "ttl": 300
}
```

### 5. Autologin

**POST** `/wp-json/storesdk/v1/autologin`

Performs automatic login using a one-time token.

```json
{
  "token": "ot_xyz789abc123..."
}
```

### 6. Token Revocation

**POST** `/wp-json/storesdk/v1/token/revoke`

Revokes refresh tokens (single or all).

```json
{
  "refresh_token": "rt_abc123def456...",
  "revoke_all": false
}
```

## Plugin Architecture

The plugin follows WordPress best practices with a modular, object-oriented architecture:

```
store-sdk/
├── store-sdk.php              # Main plugin file (bootstrap)
├── uninstall.php             # Clean uninstallation
├── readme.txt                # WordPress.org readme
├── README.md                 # This documentation
└── includes/
    ├── class-store-sdk.php   # Main orchestrator class
    ├── class-auth.php        # Authentication integration
    ├── class-cors.php        # CORS handling
    ├── class-jwt.php         # JWT utilities
    ├── admin/
    │   └── class-admin.php   # Admin interface
    └── api/
        └── class-api.php     # REST API endpoints
```

### Class Overview

- **`Store_SDK`**: Main plugin orchestrator that coordinates all components
- **`Store_SDK_Auth`**: Handles WordPress authentication integration and bearer token processing
- **`Store_SDK_CORS`**: Manages cross-origin resource sharing headers and preflight requests
- **`Store_SDK_JWT`**: Provides JWT encoding, decoding, and token management utilities
- **`Store_SDK_API`**: Defines all REST API endpoints for token operations
- **`Store_SDK_Admin`**: Manages admin interface, notices, and configuration validation

## Security Considerations

### JWT Secret

- Use a strong, random secret key (minimum 32 characters)
- Store securely in `wp-config.php`
- Never commit secrets to version control
- Rotate periodically for enhanced security

### Token Security

- Access tokens have short TTL (default: 1 hour)
- Refresh tokens are rotated on each use
- One-time tokens expire quickly and can only be used once
- All tokens are validated with HMAC-SHA256

### CORS Configuration

- Configure specific origins instead of using wildcards in production
- Validate all allowed headers and methods
- Consider security implications of allowing credentials

## Hooks and Filters

The plugin provides various hooks for customization:

### Actions

```php
// Plugin fully loaded
do_action('storesdk_jwt_auth_loaded');

// Token issued
do_action('storesdk_jwt_token_issued', $user_id, $token_data);

// Token refreshed
do_action('storesdk_jwt_token_refreshed', $user_id, $new_token_data);

// Token revoked
do_action('storesdk_jwt_token_revoked', $user_id, $revoke_all);
```

### Filters

```php
// Modify token payload before encoding
apply_filters('storesdk_jwt_token_payload', $payload, $user);

// Customize token TTL
apply_filters('storesdk_jwt_access_ttl', $ttl, $user);

// Filter refresh token data
apply_filters('storesdk_jwt_refresh_token_data', $data, $user);

// Modify CORS origins
apply_filters('storesdk_jwt_cors_allowed_origins', $origins);
```

## Development

### Adding Custom Endpoints

Extend the API by hooking into the registration process:

```php
add_action('rest_api_init', function() {
    register_rest_route('storesdk/v1', '/custom-endpoint', [
        'methods' => 'POST',
        'callback' => 'your_custom_callback',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ]);
});
```

### Custom Authentication Logic

Override authentication behavior using filters:

```php
add_filter('storesdk_jwt_token_payload', function($payload, $user) {
    // Add custom claims
    $payload['custom_role'] = $user->roles[0];
    return $payload;
}, 10, 2);
```

## Troubleshooting

### Common Issues

1. **"Invalid JWT Secret"**: Ensure `STORESDK_JWT_SECRET` is defined and not empty
2. **CORS Errors**: Check your CORS configuration and allowed origins
3. **Token Expired**: Verify system time synchronization and TTL settings
4. **Permission Denied**: Ensure proper user capabilities and authentication

### Debug Mode

Enable WordPress debug mode for detailed error logging:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

### Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/kmakris23/store-sdk).

## License

This plugin is licensed under the MIT License. See the `LICENSE` file for details.

## Changelog

### 1.0.0

- Initial release
- JWT authentication endpoints
- Token refresh mechanism
- One-time token support
- Autologin functionality
- CORS handling
- Admin interface
- Security features
