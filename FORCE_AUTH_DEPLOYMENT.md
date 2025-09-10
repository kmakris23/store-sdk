# Force Authentication Deployment Guide

## Plugin Installation

1. **Upload the latest plugin**: Use the packaged plugin at `dist/wp-plugin/store-sdk.zip`
2. **Activate the plugin** in WordPress admin panel

## Configuration

### Step 1: Add Constant to wp-config.php

Add this line to your `wp-config.php` file **before** the `/* That's all, stop editing! */` comment:

```php
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wp-json/wc/store/v1/cart');
```

**Note**: You can specify endpoints with or without the `wp-json/` prefix - both formats work:

- `'wp-json/wc/store/v1/cart'` (full path as seen in browser)
- `'wc/store/v1/cart'` (path without prefix)

### Step 2: Multiple Endpoints (Optional)

To protect multiple endpoints, separate them with commas:

```php
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wp-json/wc/store/v1/cart,wp-json/wp/v2/posts,wp-json/wc/store/v1/checkout');
```

Or mix formats:

```php
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wp-json/wc/store/v1/cart,wp/v2/posts');
```

### Step 3: Testing

Test the protected endpoint without authentication:

```bash
curl -X GET http://localhost:808/wp-json/wc/store/v1/cart
```

**Expected Result**: `401 Unauthorized` with error message `"Authentication required for this endpoint"`

Test with valid authentication:

```bash
# First get a token
curl -X POST http://localhost:808/wp-json/store-sdk/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"login":"your_username","password":"your_password"}'

# Then use the token
curl -X GET http://localhost:808/wp-json/wc/store/v1/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Result**: `200 OK` with cart data

## Important Notes

- **Flexible Path Format**: You can specify endpoints with or without the `wp-json/` prefix
  - `'wp-json/wc/store/v1/cart'` ✅ (full path as seen in browser)
  - `'wc/store/v1/cart'` ✅ (path without prefix)
- **Wildcard Support**: Use `*` for pattern matching (e.g., `'wp-json/wc/store/*'` protects all store endpoints)
- **Case Sensitive**: Endpoint paths are case-sensitive
- **Authentication Bypass**: Authentication endpoints (`/store-sdk/v1/auth/*`) are never affected by force authentication
- **Token Validation**: Invalid or expired tokens will still return 401 errors as normal

## Troubleshooting

### Plugin Not Working

1. Verify the plugin is activated in WordPress admin
2. Check that the Store SDK auth endpoints work: `/wp-json/store-sdk/v1/auth/token`

### Constant Not Working

1. Verify the constant is added to wp-config.php correctly
2. Check endpoint paths don't include `wp-json/` prefix
3. Ensure no spaces around commas in multi-endpoint configuration

### Debug Information

### Quick Status Check

Check if force authentication is properly configured:

```bash
curl http://localhost:808/wp-json/store-sdk/v1/debug/status
```

**Expected Response** (when properly configured):

```json
{
  "force_auth_defined": true,
  "force_auth_value": "wc/store/v1/cart",
  "plugin_version": "1.0.0",
  "timestamp": 1694347200
}
```

### Detailed Debug Information

If the constant `STORESDK_JWT_FORCE_AUTH_ENDPOINTS` is defined, these debug endpoints become available:

- `GET /wp-json/store-sdk/v1/debug/status` - Shows force auth configuration
- `GET /wp-json/store-sdk/v1/auth/status` - Full plugin status including force auth
- `GET /wp-json/store-sdk/v1/auth/debug-route` - Shows current route detection

## Configuration Examples

### E-commerce Store

```php
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wc/store/v1/cart,wc/store/v1/checkout,wc/store/v1/batch');
```

### Blog with Protected Content

```php
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wp/v2/posts,wp/v2/pages,wp/v2/media');
```

### Mixed Content

```php
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wc/store/v1/cart,wp/v2/posts,wp/v2/users');
```
