<?php
/**
 * Plugin Name: Store SDK
 * Plugin URI:  https://github.com/kmakris23/store-sdk
 * Description: Authentication support for @store-sdk/core (JWT endpoints: token, refresh, one-time, autologin, validate, revoke) enabling headless WooCommerce integrations.
 * Version: 1.0.0
 * Author: Store SDK
 * Author URI: https://github.com/kmakris23
 * License: MIT
 * License URI: https://opensource.org/licenses/MIT
 * Text Domain: store-sdk
 * Requires at least: 6.3
 * Requires PHP: 8.0
 * Tested up to: 6.6
 * Tags: jwt, authentication, woocommerce, headless, api
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

require_once __DIR__ . '/includes/core-impl.php';
