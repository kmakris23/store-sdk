#!/usr/bin/env bash
# Wrapper to normalize potential CRLF endings in mounted scripts on Windows hosts.
set -e

# Allow custom setup script via environment variable
SETUP_SCRIPT="${WP_SETUP_SCRIPT:-wp-setup.sh}"
SRC="/scripts/$SETUP_SCRIPT"
TMP="/tmp/$(basename "$SETUP_SCRIPT").lf"

if [ -f "$SRC" ]; then
  # Strip CR characters reliably without depending on dos2unix.
  tr -d '\r' < "$SRC" > "$TMP"
  chmod +x "$TMP"
  exec bash "$TMP" "$@"
else
  echo "[wp-entry] Missing $SRC" >&2
  exit 1
fi
