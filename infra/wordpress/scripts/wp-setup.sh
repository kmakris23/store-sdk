#!/usr/bin/env bash
set -euo pipefail

log() { echo "[wp-setup] $*"; }

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

log "Installing & activating required plugins (WooCommerce, Simple JWT Login)..."
if [ -n "${WOO_COMMERCE_VERSION:-}" ]; then
  wp plugin install woocommerce --version="$WOO_COMMERCE_VERSION" --activate --force || true
else
  wp plugin install woocommerce --activate --force || true
fi
if ! wp plugin is-installed woocommerce >/dev/null 2>&1; then
  log "WooCommerce failed to install (version requirement mismatch?). Set WOO_COMMERCE_VERSION to a compatible version (e.g. 9.x) and re-run. Skipping seeding."
fi
wp plugin install simple-jwt-login --activate --force || wp plugin activate simple-jwt-login

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
    wp eval-file /scripts/seed-catalog.php || log "Seeding encountered errors (continuing)."
    if wp option get store_sdk_seeded >/dev/null 2>&1; then
      log "Sample catalog seeding complete."
    else
      log "Seeding did not set guard option; mark manually."
      wp option add store_sdk_seeded 1 >/dev/null 2>&1 || true
    fi
  else
    log "Sample catalog already seeded."
  fi
  # Configure WooCommerce (payment gateways etc.) once
  if ! wp option get store_sdk_wc_configured >/dev/null 2>&1; then
    log "Configuring WooCommerce (payments/shipping)..."
    wp eval-file /scripts/configure-woocommerce.php || log "WooCommerce configuration encountered errors (continuing)."
  # Output current COD settings for debugging
  wp option get woocommerce_cod_settings || true
  # Force gateway list regeneration
  wp eval 'delete_transient("woocommerce_payment_gateways"); WC()->payment_gateways()->init(); echo "Refreshed gateways";' || true
  else
    log "WooCommerce already configured."
  fi
else
  log "WooCommerce inactive; skipping catalog seeding."
fi

# If additional CLI args were provided (when reusing container), execute them after setup
if [ "$#" -gt 0 ]; then
  log "Executing passthrough command: $*"
  exec "$@"
fi

# Keep container alive briefly so logs are visible then exit (one-shot)
sleep 3
