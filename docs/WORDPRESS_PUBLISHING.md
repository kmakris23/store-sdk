# WordPress.org Plugin Publishing Guide

This guide explains how to publish the Store SDK plugin to the WordPress.org plugin directory.

## Prerequisites

### 1. WordPress.org Account Setup

- Create an account at [WordPress.org](https://wordpress.org)
- Request hosting for your plugin by submitting it through the [Plugin Directory](https://wordpress.org/plugins/developers/add/)
- Wait for approval (usually 2-14 days for first-time submissions)
- Once approved, you'll receive SVN access credentials

### 2. Required Software

- **SVN**: Required for WordPress.org submissions

  ```bash
  # Ubuntu/Debian
  sudo apt-get install subversion

  # macOS
  brew install svn

  # Windows
  # Download from https://tortoisesvn.net/ or use WSL
  ```

### 3. Plugin Assets (Optional but Recommended)

Create assets in `assets/wordpress-org/`:

- `icon-128x128.png` - Plugin icon
- `banner-772x250.png` - Plugin banner
- `screenshot-1.png` - Admin interface screenshot

## Publishing Methods

### Method 1: Automated Publishing (Recommended)

#### Local Publishing

```bash
# Validate plugin structure and readme
npm run wp:plugin:validate

# Check current plugin version
npm run wp:plugin:version

# Publish to WordPress.org (interactive)
npm run wp:plugin:publish
```

#### GitHub Actions (CI/CD)

1. **Set up GitHub Secrets:**

   - Go to your repository settings
   - Add these secrets:
     - `WP_ORG_USERNAME`: Your WordPress.org username
     - `WP_ORG_PASSWORD`: Your WordPress.org password

2. **Trigger Deployment:**

   ```bash
   # Create a new release
   git tag v1.0.0
   git push origin v1.0.0

   # Or use GitHub's release interface
   ```

3. **Manual Workflow Trigger:**
   - Go to Actions tab in GitHub
   - Select "WordPress.org Plugin Deploy"
   - Click "Run workflow"
   - Enter the version number

### Method 2: Manual SVN Publishing

```bash
# 1. Build the plugin package
npm run wp:plugin:package

# 2. Checkout SVN repository
svn checkout https://plugins.svn.wordpress.org/store-sdk svn-repo

# 3. Copy plugin files to trunk
cp -r plugins/store-sdk/* svn-repo/trunk/

# 4. Copy assets (if available)
cp -r assets/wordpress-org/* svn-repo/assets/

# 5. Create new tag for version
cp -r svn-repo/trunk svn-repo/tags/1.0.0

# 6. Add new files to SVN
svn add svn-repo/trunk/* svn-repo/tags/1.0.0/*

# 7. Commit changes
svn commit -m "Release version 1.0.0" svn-repo/
```

## Pre-Publishing Checklist

### ✅ Plugin Validation

- [ ] `npm run wp:plugin:validate` passes
- [ ] Plugin header contains correct version
- [ ] readme.txt follows WordPress.org format
- [ ] All required files are present
- [ ] No development files included in build

### ✅ Testing

- [ ] Plugin activates without errors
- [ ] All API endpoints work correctly
- [ ] JWT authentication functions properly
- [ ] CORS configuration is correct
- [ ] No PHP errors or warnings

### ✅ Documentation

- [ ] README.md is comprehensive
- [ ] readme.txt includes changelog
- [ ] Installation instructions are clear
- [ ] Configuration examples are provided

### ✅ Security Review

- [ ] JWT secret requirements documented
- [ ] Security best practices included
- [ ] No hardcoded secrets in code
- [ ] Input validation is implemented

## Version Management

### Updating Plugin Version

1. **Update version in plugin header** (`store-sdk.php`):

   ```php
   * Version: 1.0.1
   ```

2. **Update stable tag in readme.txt**:

   ```
   Stable tag: 1.0.1
   ```

3. **Add changelog entry**:

   ```
   == Changelog ==
   = 1.0.1 =
   * Bug fixes and improvements
   ```

4. **Commit changes and publish**:
   ```bash
   git add .
   git commit -m "Release version 1.0.1"
   git tag v1.0.1
   git push origin main v1.0.1
   ```

## Troubleshooting

### Common Issues

1. **SVN Authentication Failed**

   - Verify WordPress.org credentials
   - Check if plugin is approved for hosting
   - Ensure SVN URL is correct

2. **Plugin Validation Errors**

   - Run `npm run wp:plugin:validate` for detailed errors
   - Check readme.txt format
   - Verify required plugin files exist

3. **Build Errors**

   - Ensure Node.js dependencies are installed
   - Check that plugin files are in correct location
   - Verify file permissions

4. **WordPress.org Review Issues**
   - Remove any external service calls
   - Ensure code follows WordPress coding standards
   - Check for security vulnerabilities
   - Verify GPL-compatible licensing

### Getting Help

- **WordPress.org Support**: [Plugin Review Team](https://wordpress.org/support/forum/plugins-and-hacks/)
- **SVN Documentation**: [WordPress SVN Guide](https://developer.wordpress.org/plugins/wordpress-org/how-to-use-subversion/)
- **Plugin Guidelines**: [WordPress Plugin Guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/)

## Post-Publishing

### After Successful Publishing

1. **Monitor the plugin page**: https://wordpress.org/plugins/store-sdk/
2. **Test installation** from WordPress admin
3. **Update documentation** if needed
4. **Respond to user reviews** and support requests
5. **Plan future updates** based on user feedback

### Ongoing Maintenance

- **Regular updates** for WordPress compatibility
- **Security patches** as needed
- **Feature improvements** based on user requests
- **Documentation updates** for new features

## Plugin Statistics and Analytics

Once published, you can monitor:

- **Download statistics** on WordPress.org
- **User ratings and reviews**
- **Support forum activity**
- **Compatibility reports** from users

Access these through your WordPress.org developer account dashboard.
