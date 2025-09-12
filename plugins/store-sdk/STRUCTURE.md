# Store SDK WordPress Plugin - Architecture Documentation

This WordPress plugin has been reorganized following WordPress best practices for better maintainability, readability, and extensibility.

## Directory Structure

```
store-sdk/
├── store-sdk.php              # Main plugin bootstrap file
├── uninstall.php             # Clean uninstallation procedures
├── readme.txt                # WordPress.org plugin directory format
├── README.md                 # Comprehensive documentation
├── STRUCTURE.md              # This architecture guide
└── includes/                 # All plugin classes and logic
    ├── class-store-sdk.php   # Main orchestrator class
    ├── class-auth.php        # WordPress authentication integration
    ├── class-cors.php        # CORS handling and headers
    ├── class-jwt.php         # JWT utilities and token management
    ├── admin/                # Admin interface components
    │   └── class-admin.php   # Configuration notices and validation
    └── api/                  # REST API endpoints
        └── class-api.php     # All JWT-related endpoints
```

## Class Architecture

### Bootstrap File (`store-sdk.php`)

- **Purpose**: Plugin initialization and constant definitions
- **Responsibilities**:
  - Define plugin constants and default configurations
  - Determine plugin activation status
  - Load main orchestrator class
  - Provide global access function
- **Lines of Code**: ~90 (down from 1000+ in monolithic version)

### Main Orchestrator (`class-store-sdk.php`)

- **Class**: `Store_SDK`
- **Pattern**: Singleton
- **Responsibilities**:
  - Initialize all plugin components
  - Manage component dependencies
  - Handle plugin activation checks
  - Coordinate hook registration
- **Dependencies**: All other plugin classes

### Authentication Handler (`class-auth.php`)

- **Class**: `Store_SDK_Auth`
- **Responsibilities**:
  - Process Bearer token authentication
  - Integration with WordPress auth system
  - Force authentication for protected routes
  - Handle authentication failures
- **WordPress Hooks**: `determine_current_user`, `rest_authentication_errors`

### CORS Manager (`class-cors.php`)

- **Class**: `Store_SDK_CORS`
- **Responsibilities**:
  - Handle preflight OPTIONS requests
  - Set appropriate CORS headers
  - Validate origins against whitelist
  - Configure allowed methods and headers
- **WordPress Hooks**: `init`, `rest_pre_serve_request`

### JWT Utilities (`class-jwt.php`)

- **Class**: `Store_SDK_JWT`
- **Responsibilities**:
  - JWT token encoding and decoding
  - Base64URL encoding/decoding
  - HMAC signature generation and validation
  - Token expiration and leeway handling
- **Dependencies**: WordPress user system, plugin constants

### API Endpoints (`class-api.php`)

- **Class**: `Store_SDK_API`
- **Responsibilities**:
  - Register all REST API endpoints
  - Handle token issuance and validation
  - Manage refresh token rotation
  - Process one-time tokens and autologin
  - Token revocation functionality
- **WordPress Hooks**: `rest_api_init`

### Admin Interface (`class-admin.php`)

- **Class**: `Store_SDK_Admin`
- **Responsibilities**:
  - Display configuration notices
  - Validate plugin setup
  - Show setup instructions
  - Configuration status checks
- **WordPress Hooks**: `admin_notices`

## Design Principles

### Single Responsibility Principle

Each class has a clear, focused purpose:

- Auth handles authentication logic only
- CORS manages cross-origin requests only
- JWT provides token utilities only
- API defines endpoints only
- Admin manages admin interface only

### Dependency Injection

Classes receive dependencies through constructors:

```php
public function __construct($main_instance = null) {
    $this->main = $main_instance ?: Store_SDK::instance();
}
```

### Hook Organization

Each class manages its own WordPress hooks:

- Prevents hook conflicts
- Makes debugging easier
- Allows selective component loading

### Configuration Centralization

All configuration handled via WordPress constants:

- Consistent configuration approach
- Easy environment-specific settings
- No database configuration needed

## Component Interactions

```
store-sdk.php
    ↓
Store_SDK (orchestrator)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│  Store_SDK_Auth │ Store_SDK_CORS  │ Store_SDK_JWT   │
│                 │                 │                 │
│ • Bearer tokens │ • CORS headers  │ • Encode/decode │
│ • WP auth hooks │ • Preflight     │ • Signatures    │
│ • Route checks  │ • Origin check  │ • Expiration    │
└─────────────────┴─────────────────┴─────────────────┘
    ↓                   ↓                   ↓
┌─────────────────┬─────────────────────────────────────┐
│ Store_SDK_API   │        Store_SDK_Admin              │
│                 │                                     │
│ • REST routes   │ • Configuration notices            │
│ • Endpoints     │ • Setup validation                 │
│ • Responses     │ • Admin interface                  │
└─────────────────┴─────────────────────────────────────┘
```

## Benefits of This Architecture

### Maintainability

- **Modular**: Each component can be modified independently
- **Testable**: Individual classes can be unit tested
- **Debuggable**: Issues isolated to specific components
- **Readable**: Clear separation of concerns

### Extensibility

- **Hook System**: Each class provides its own hooks
- **Filter Integration**: Easy to modify behavior via filters
- **Plugin Architecture**: Can be extended with additional plugins
- **API Friendly**: Clean REST API structure

### Performance

- **Selective Loading**: Only load needed components
- **Lazy Initialization**: Components initialized when needed
- **Efficient Hooks**: Minimal hook registration overhead
- **Optimized**: No redundant processing

### Security

- **Separation**: Security logic isolated in auth class
- **Validation**: Each component validates its own inputs
- **Constants**: Secure configuration via WordPress constants
- **Clean Uninstall**: Complete data removal on uninstall

## Development Guidelines

### Adding New Features

1. Determine appropriate class or create new one
2. Follow single responsibility principle
3. Use dependency injection for class dependencies
4. Register hooks in appropriate class methods
5. Add configuration constants if needed
6. Update documentation

### Extending Functionality

1. Use WordPress filters and actions
2. Create child classes if needed
3. Follow established patterns
4. Maintain backward compatibility
5. Document new hooks and filters

### Testing Strategy

- **Unit Tests**: Test individual class methods
- **Integration Tests**: Test component interactions
- **API Tests**: Test REST endpoint functionality
- **Security Tests**: Validate authentication and authorization

This architecture provides a solid foundation for maintaining and extending the Store SDK plugin while following WordPress best practices.

- Front-channel autologin handling

5. **Store_SDK_API** (`api/class-api.php`)

   - All REST API endpoint definitions
   - Token issuance, refresh, validation
   - One-time tokens and autologin
   - Status and debug endpoints

6. **Store_SDK_Admin** (`admin/class-admin.php`)
   - Admin interface and notices
   - Configuration status checking
   - Setup recommendations

### Key Features

- **Modular Design**: Each component has a single responsibility
- **Clean Bootstrap**: Main file only handles initialization
- **Proper Class Structure**: Following WordPress coding standards
- **Extensible**: Easy to add new features or modify existing ones
- **Maintainable**: Clear separation of concerns

### Configuration Constants

All plugin configuration is handled through WordPress constants defined in `wp-config.php`:

```php
// Required
define('STORESDK_JWT_ENABLED', true);
define('STORESDK_JWT_SECRET', 'your-secret-key-here');

// Optional (with defaults)
define('STORESDK_JWT_ACCESS_TTL', 3600);
define('STORESDK_JWT_REFRESH_TTL', 60 * 60 * 24 * 14);
define('STORESDK_JWT_CORS_ENABLE', true);
define('STORESDK_JWT_CORS_ALLOWED_ORIGINS', '*');
// ... and more
```

### Best Practices Followed

1. **WordPress Standards**: Following WordPress coding standards and file organization
2. **Object-Oriented**: Proper use of classes and encapsulation
3. **Hooks & Filters**: Leveraging WordPress hook system for extensibility
4. **Security**: Proper sanitization, validation, and capability checks
5. **i18n Ready**: Text domain and translation functions
6. **Documentation**: Comprehensive docblocks and comments

## Migration Notes

The reorganization maintains 100% backward compatibility. All existing functionality works exactly the same, but the code is now better organized for future development and maintenance.

## Development

When adding new features:

1. **CORS changes**: Modify `includes/class-cors.php`
2. **JWT utilities**: Extend `includes/class-jwt.php`
3. **Authentication logic**: Update `includes/class-auth.php`
4. **New API endpoints**: Add to `includes/api/class-api.php`
5. **Admin features**: Enhance `includes/admin/class-admin.php`

The main `store-sdk.php` file should rarely need changes unless adding entirely new component classes.
