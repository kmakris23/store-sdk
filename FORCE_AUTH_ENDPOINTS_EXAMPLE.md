# Force Authentication for Specific Endpoints

This feature allows you to force authentication for specific REST API endpoints using the `STORESDK_JWT_FORCE_AUTH_ENDPOINTS` constant.

## Configuration

Add this to your `wp-config.php` file:

```php
// Force authentication for specific endpoints (comma-separated)
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wc/store/v1/cart,wc/store/v1/checkout,wp/v2/users/me');
```

## Supported Patterns

### Exact Match

```php
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wc/store/v1/cart');
```

### Wildcard Patterns

```php
// Protect all cart-related endpoints
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wc/store/v1/cart*');

// Protect all user endpoints
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wp/v2/users/*');

// Multiple patterns
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wc/store/v1/cart*,wp/v2/users/*,wc/store/v1/checkout');
```

## Example Use Cases

### WooCommerce Store API Protection

```php
// Protect cart, checkout, and customer data
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wc/store/v1/cart,wc/store/v1/checkout,wc/store/v1/order*');
```

### WordPress User Data Protection

```php
// Protect all user-related endpoints
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wp/v2/users/*');
```

### Complete E-commerce Protection

```php
// Comprehensive protection for e-commerce operations
define('STORESDK_JWT_FORCE_AUTH_ENDPOINTS', 'wc/store/v1/cart*,wc/store/v1/checkout*,wc/store/v1/order*,wp/v2/users/*');
```

## Programmatic Control

You can also modify the protected endpoints list programmatically using filters:

```php
// Add additional endpoints
add_filter('storesdk_jwt_force_auth_endpoints', function($endpoints, $current_route) {
    // Add custom endpoints
    $endpoints[] = 'my-plugin/v1/private/*';
    return $endpoints;
}, 10, 2);

// Override specific endpoint protection
add_filter('storesdk_jwt_endpoint_requires_auth', function($requires_auth, $route_path, $matched_pattern) {
    // Allow guest access to specific cart operations
    if ($route_path === 'wc/store/v1/cart' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        return false;
    }
    return $requires_auth;
}, 10, 3);
```

## How It Works

1. When a request is made to a REST API endpoint, the plugin checks if the endpoint matches any patterns in `STORESDK_JWT_FORCE_AUTH_ENDPOINTS`
2. If a match is found, the plugin requires a valid JWT token in the `Authorization: Bearer <token>` header
3. If no valid token is provided, the request returns a 401 Unauthorized error
4. If a valid token is provided, the request proceeds normally with the authenticated user context

## Error Response

When authentication is required but not provided:

```json
{
  "code": "storesdk_jwt.auth_required",
  "message": "Authentication required for this endpoint",
  "data": {
    "status": 401
  }
}
```

## Testing

You can test the functionality by:

1. Setting the constant in your `wp-config.php`
2. Making a request to a protected endpoint without authentication (should return 401)
3. Making the same request with a valid Bearer token (should succeed)

Example:

```bash
# This should fail with 401
curl -X GET https://yoursite.com/wp-json/wc/store/v1/cart

# This should succeed
curl -X GET https://yoursite.com/wp-json/wc/store/v1/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
