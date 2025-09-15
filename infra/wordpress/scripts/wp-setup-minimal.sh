#!/usr/bin/env bash
# Minimal WordPress setup for plugin checking
# No seeding, no WooCommerce, just WordPress + plugin

set -e
set -u
if (set -o pipefail) 2>/dev/null; then
  set -o pipefail
fi

log() { echo "[wp-setup-minimal] $*"; }
fail() { echo "[wp-setup-minimal][FATAL] $*" >&2; exit 1; }

# Prepare writable cache dir for WP-CLI
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

log "Database ready, starting minimal WordPress setup..."

# Check if WordPress is already installed
if wp core is-installed 2>/dev/null; then
  log "WordPress already installed, checking plugin..."
else
  log "Installing WordPress..."
  
  # Install WordPress
  wp core install \
    --url="http://localhost:8080" \
    --title="Store SDK Test" \
    --admin_user="admin" \
    --admin_password="password" \
    --admin_email="test@example.com" \
    --skip-email
  
  log "WordPress installed successfully"
fi

# Install/activate the Store SDK plugin
log "Installing Store SDK plugin..."

# Check if plugin exists and activate it
if wp plugin is-installed store-sdk 2>/dev/null; then
  log "Store SDK plugin already installed"
  if ! wp plugin is-active store-sdk 2>/dev/null; then
    wp plugin activate store-sdk
    log "Store SDK plugin activated"
  else
    log "Store SDK plugin already active"
  fi
else
  log "Store SDK plugin not found - this should be mounted in the container"
  wp plugin list
  exit 1
fi

log "Minimal WordPress setup complete!"
log "- WordPress version: $(wp core version)"
log "- Store SDK plugin: $(wp plugin is-active store-sdk && echo 'Active' || echo 'Inactive')"