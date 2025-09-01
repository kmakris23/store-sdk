#!/usr/bin/env bash
set -euo pipefail

log() { echo "[wp-setup] $*"; }
fail() { echo "[wp-setup][FATAL] $*" >&2; exit 1; }

# Prepare writable cache dir for WP-CLI to reduce repeated downloads
export WP_CLI_CACHE_DIR="${WP_CLI_CACHE_DIR:-/tmp/wp-cli-cache}"
mkdir -p "$WP_CLI_CACHE_DIR" || true

# Wait for DB
attempts=0
until wp db check >/dev/null 2>&1; do
  attempts=$((attempts+1))
  if [ "$attempts" -gt 30 ]; then
    log "Database not ready after $attempts attempts" >&2
    exit 1
  fi
  log "Waiting for database... ($attempts)"
  sleep 2
done

# Fast path: allow skipping full setup when running ad-hoc WP-CLI commands in CI to avoid repeated plugin install noise
if [ "${SKIP_WP_SETUP:-0}" = "1" ]; then
  log "SKIP_WP_SETUP=1 set; skipping provisioning logic."
  if [ "$#" -gt 0 ]; then
    log "Executing passthrough (skip mode): $*"
    exec "$@"
  else
    log "No command provided in skip mode; starting shell."
    exec bash
  fi
fi

SITE_URL="${WP_URL:-http://localhost:8080}"

if wp core is-installed >/dev/null 2>&1; then
  log "WordPress already installed. Skipping core install."
else
  log "Installing WordPress core..."
  wp core install \
    --url="$SITE_URL" \
    --title="${WP_TITLE:-Test Site}" \
    --admin_user="${WP_ADMIN_USER:-admin}" \
    --admin_password="${WP_ADMIN_PASSWORD:-admin}" \
    --admin_email="${WP_ADMIN_EMAIL:-admin@example.com}" \
    --skip-email
fi

# Ensure correct site URL (useful if re-created containers)
wp option update siteurl "$SITE_URL" >/dev/null
wp option update home "$SITE_URL" >/dev/null

log "Ensuring required plugins present (WooCommerce, Simple JWT Login)..."

install_with_retry() {
  local plugin=$1
  local version_flag=$2
  local attempts=0
  local max_attempts=3
  while [ $attempts -lt $max_attempts ]; do
    attempts=$((attempts+1))
    if [ -n "$version_flag" ]; then
      if wp plugin install "$plugin" $version_flag --activate >/dev/null 2>&1; then
        return 0
      fi
    else
      if wp plugin install "$plugin" --activate >/dev/null 2>&1; then
        return 0
      fi
    fi
    log "Install attempt $attempts for $plugin failed; retrying..."
    sleep 2
  done
  return 1
}

# WooCommerce
if wp plugin is-installed woocommerce >/dev/null 2>&1; then
  # Activate if not active
  if ! wp plugin is-active woocommerce >/dev/null 2>&1; then
    wp plugin activate woocommerce || true
  fi
else
  VERSION_FLAG=""
  if [ -n "${WOO_COMMERCE_VERSION:-}" ]; then
    VERSION_FLAG="--version=${WOO_COMMERCE_VERSION}"
  fi
  if ! install_with_retry woocommerce "$VERSION_FLAG"; then
    fail "WooCommerce failed to install after retries. Set WOO_COMMERCE_VERSION to a compatible version (e.g. 9.x) and re-run."
  fi
fi

# Validate WooCommerce active
if ! wp plugin is-active woocommerce >/dev/null 2>&1; then
  fail "WooCommerce plugin not active after installation attempts."
fi

# Simple JWT Login
if wp plugin is-installed simple-jwt-login >/dev/null 2>&1; then
  if ! wp plugin is-active simple-jwt-login >/dev/null 2>&1; then
    wp plugin activate simple-jwt-login || true
  fi
else
  SJL_VERSION_FLAG=""
  if [ -n "${SIMPLE_JWT_LOGIN_VERSION:-}" ]; then
    SJL_VERSION_FLAG="--version=${SIMPLE_JWT_LOGIN_VERSION}"
  fi
  if ! install_with_retry simple-jwt-login "$SJL_VERSION_FLAG"; then
    fail "simple-jwt-login failed to install after retries."
  fi
fi

if ! wp plugin is-active simple-jwt-login >/dev/null 2>&1; then
  fail "simple-jwt-login plugin not active after installation attempts."
fi

# Basic WooCommerce setup (non-interactive) - safe to ignore errors if already configured
if ! wp option get woocommerce_store_address_1 >/dev/null 2>&1; then
  log "Applying basic WooCommerce store settings..."
  # Greece / Athens defaults if env not provided
  wp option update woocommerce_store_address_1 "${WC_STORE_ADDRESS:-Syntagma Square}" || true
  wp option update woocommerce_store_city "${WC_STORE_CITY:-Athens}" || true
  # WooCommerce expects country:COUNTRY_CODE:STATE (state optional). Greece code GR
  wp option update woocommerce_default_country "${WC_STORE_COUNTRY_CODE:-GR}" || true
  wp option update woocommerce_store_postcode "${WC_STORE_POSTCODE:-10563}" || true
  wp option update woocommerce_currency "${WC_STORE_CURRENCY:-EUR}" || true
  if [ "${WC_STORE_SALES_TAX:-true}" = "true" ]; then
    wp option update woocommerce_calc_taxes "yes" || true
    wp option update woocommerce_prices_include_tax "no" || true
  fi
fi

# Permalinks for REST & pretty URLs
CURRENT_PERMALINK=$(wp option get permalink_structure)
if [ "$CURRENT_PERMALINK" != "/%postname%/" ]; then
  log "Setting permalink structure..."
  wp option update permalink_structure '/%postname%/'
  wp rewrite flush --hard
fi

# Ensure JWT secret constant present in wp-config.php (WordPress image supports appending)
if ! grep -q 'SIMPLE_JWT_LOGIN_SECRET_KEY' wp-config.php; then
  log "Adding SIMPLE_JWT_LOGIN_SECRET_KEY to wp-config.php"
  echo "define('SIMPLE_JWT_LOGIN_SECRET_KEY', '$(printf %q "${JWT_SECRET:-change_me}")');" >> wp-config.php
fi

# Create a test customer user if configured
if [ -n "${TEST_CUSTOMER_USER:-}" ] && ! wp user get "$TEST_CUSTOMER_USER" >/dev/null 2>&1; then
  log "Creating test customer user '${TEST_CUSTOMER_USER}'"
  wp user create "$TEST_CUSTOMER_USER" "${TEST_CUSTOMER_EMAIL:-customer@example.com}" --user_pass="${TEST_CUSTOMER_PASSWORD:-customer123}" --role=customer
fi

log "Setup complete. Site available at: $SITE_URL"
log "Admin: ${WP_ADMIN_USER:-admin} / ${WP_ADMIN_PASSWORD:-admin}"
log "Customer: ${TEST_CUSTOMER_USER:-customer} / ${TEST_CUSTOMER_PASSWORD:-customer123}" || true

# Always attempt seeding once (guarded internally by option) if WooCommerce active
if wp plugin is-active woocommerce >/dev/null 2>&1; then
  if ! wp option get store_sdk_seeded >/dev/null 2>&1; then
    log "Seeding sample catalog (automatic)..."
    if ! wp eval-file /scripts/seed-catalog.php; then
      fail "Catalog seeding script errored."
    fi
    if wp option get store_sdk_seeded >/dev/null 2>&1; then
      log "Sample catalog seeding complete (guard set)."
    else
      fail "Catalog seeding guard option 'store_sdk_seeded' not set."
    fi
  else
    log "Sample catalog already seeded."
  fi
  # Configure WooCommerce (payment gateways etc.) once
  if ! wp option get store_sdk_wc_configured >/dev/null 2>&1; then
    log "Configuring WooCommerce (payments/shipping)..."
    if ! wp eval-file /scripts/configure-woocommerce.php; then
      fail "WooCommerce configuration script failed."
    fi
    if ! wp option get store_sdk_wc_configured >/dev/null 2>&1; then
      fail "WooCommerce configuration guard option 'store_sdk_wc_configured' missing after configuration script."
    fi
  # Output current COD settings for debugging
  wp option get woocommerce_cod_settings || true
  # Force gateway list regeneration
  wp eval 'delete_transient("woocommerce_payment_gateways"); WC()->payment_gateways()->init(); echo "Refreshed gateways";' || true
  else
    log "WooCommerce already configured."
  fi
    # Ensure test coupons always present (idempotent)
    log "Ensuring test coupons (SUMMER10, PERCENT15)..."
    wp eval 'function ensure_coupon($c,$amt,$type){ $existing=get_page_by_title($c,OBJECT,"shop_coupon"); if($existing){ echo "Coupon $c exists\n"; return;} $cid=wp_insert_post(["post_title"=>$c,"post_name"=>sanitize_title($c),"post_type"=>"shop_coupon","post_status"=>"publish"]); if(is_wp_error($cid)){ echo "Failed create $c\n"; return;} update_post_meta($cid,"discount_type",$type); update_post_meta($cid,"coupon_amount",$amt); update_post_meta($cid,"individual_use","no"); update_post_meta($cid,"usage_limit",""); update_post_meta($cid,"free_shipping","no"); echo "Created coupon $c\n";} ensure_coupon("SUMMER10","10","fixed_cart"); ensure_coupon("PERCENT15","15","percent");'
else
  fail "WooCommerce inactive; cannot proceed with catalog seeding."
fi

# If additional CLI args were provided (when reusing container), execute them after setup
if [ "$#" -gt 0 ]; then
  log "Executing passthrough command: $*"
  exec "$@"
fi

# Keep container alive briefly so logs are visible then exit (one-shot)
sleep 3
