# WordPress Plugin Check Integration

This document explains how to use the WordPress Plugin Check functionality integrated into the Store SDK development workflow.

## Overview

The WordPress Plugin Check plugin has been integrated into the WordPress development environment to help ensure your Store SDK plugin meets WordPress.org standards and quality guidelines.

## Setup

The Plugin Check plugin is automatically installed and activated when you run the WordPress environment setup:

```bash
npm run wp:env:up
```

## Available Commands

### Basic Plugin Check

```bash
npm run wp:plugin:check
```

Runs a comprehensive check of the Store SDK plugin and displays results in a formatted table.

### JSON Output

```bash
npm run wp:plugin:check:json
```

Returns plugin check results in JSON format - useful for parsing or integration into CI/CD pipelines.

### Summary Report

```bash
npm run wp:plugin:check:summary
```

Provides a condensed summary of the plugin check results.

### Verbose Output

```bash
npm run wp:plugin:check:verbose
```

Shows detailed information including informational messages and recommendations (not just errors and warnings).

## What Plugin Check Validates

The Plugin Check plugin examines your plugin for:

### ✅ Code Quality

- **PHP Syntax**: Validates PHP code syntax and structure
- **WordPress Coding Standards**: Checks adherence to WordPress PHP coding standards
- **Function Naming**: Ensures proper function and variable naming conventions
- **File Organization**: Validates proper file structure and organization

### 🔒 Security

- **Input Sanitization**: Verifies all inputs are properly sanitized
- **Output Escaping**: Ensures all outputs are properly escaped
- **SQL Injection**: Checks for potential SQL injection vulnerabilities
- **XSS Prevention**: Validates cross-site scripting protection
- **Capability Checks**: Ensures proper user capability verification
- **Nonce Validation**: Checks for proper nonce usage in forms and AJAX

### 📋 WordPress Standards

- **Plugin Headers**: Validates required plugin header information
- **Hook Usage**: Ensures proper use of WordPress actions and filters
- **Database Operations**: Checks for proper $wpdb usage
- **Internationalization**: Validates text domain usage and translation readiness
- **Enqueue Scripts**: Proper script and style enqueuing

### 🎯 Best Practices

- **Performance**: Identifies potential performance issues
- **Accessibility**: Basic accessibility compliance checks
- **Documentation**: Code documentation and inline comments
- **Error Handling**: Proper error handling and user feedback

## Understanding Results

### Severity Levels

- **🚨 ERROR**: Critical issues that must be fixed for WordPress.org approval
- **⚠️ WARNING**: Important issues that should be addressed
- **ℹ️ INFO**: Recommendations and best practices

### Common Issues and Solutions

#### Security Issues

```
ERROR: Unescaped output detected
```

**Solution**: Use WordPress escaping functions like `esc_html()`, `esc_attr()`, `esc_url()`

```
ERROR: Unsanitized input detected
```

**Solution**: Use WordPress sanitization functions like `sanitize_text_field()`, `sanitize_email()`

#### Code Standards

```
WARNING: Function name should be prefixed
```

**Solution**: Prefix all functions with your plugin slug (e.g., `storesdk_jwt_`)

```
ERROR: Direct database access detected
```

**Solution**: Use `$wpdb->prepare()` for all database queries

#### WordPress Integration

```
ERROR: Missing text domain in translation function
```

**Solution**: Add text domain parameter: `__('Text', 'store-sdk')`

## Integration with CI/CD

You can integrate plugin checks into your CI/CD pipeline:

```yaml
# Example GitHub Action step
- name: WordPress Plugin Check
  run: |
    npm run wp:env:up
    npm run wp:plugin:check:json > plugin-check-results.json
    # Parse results and fail if errors found
```

## Pre-Submission Checklist

Before submitting to WordPress.org, ensure:

1. **No Errors**: `npm run wp:plugin:check` shows zero errors
2. **Minimal Warnings**: Address all security and critical warnings
3. **Documentation**: All public functions have proper docblocks
4. **Testing**: Plugin functions correctly after addressing issues

## Debugging Failed Checks

If plugin check fails to run:

1. **Ensure WordPress is running**:

   ```bash
   npm run wp:env:up
   ```

2. **Check plugin is installed**:

   ```bash
   npm run wp:cli plugin list
   ```

3. **Verify Store SDK plugin is present**:

   ```bash
   npm run wp:cli plugin is-installed store-sdk
   ```

4. **Manual plugin check installation** (if needed):
   ```bash
   npm run wp:cli plugin install plugin-check --activate
   ```

## Advanced Usage

### Check Specific Files

```bash
npm run wp:cli "plugin-check run store-sdk --include=store-sdk.php"
```

### Custom Severity Levels

```bash
npm run wp:cli "plugin-check run store-sdk --severity=error"
```

### Export Results

```bash
npm run wp:plugin:check:json > reports/plugin-check-$(date +%Y%m%d).json
```

## WordPress.org Submission

The Plugin Check tool validates many of the same criteria used by the WordPress.org plugin review team. Passing all checks significantly increases your chances of plugin approval.

## Additional Resources

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [Plugin Security Guidelines](https://developer.wordpress.org/plugins/security/)
- [WordPress.org Plugin Guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/)

## Troubleshooting

### Plugin Check Not Found

If you get "command not found" errors:

```bash
npm run wp:env:rebuild  # Rebuild entire environment
```

### Permission Issues

If you encounter permission errors:

```bash
npm run wp:cli "plugin install plugin-check --activate --force"
```

### Docker Issues

If Docker containers are not responding:

```bash
npm run wp:env:clean  # Clean and restart
npm run wp:env:up
```
