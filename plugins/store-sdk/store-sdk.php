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

$__storesdk_core_impl = __DIR__ . '/includes/core-impl.php';
if ( ! file_exists( $__storesdk_core_impl ) ) {
	// Provide a clearer diagnostic instead of a raw fatal
	if ( function_exists( 'wp_die' ) ) {
		wp_die( 'Store SDK plugin incomplete: missing includes/core-impl.php. Rebuild the plugin zip using the packaging script.' );
	} else {
		throw new RuntimeException( 'Store SDK plugin incomplete: missing includes/core-impl.php.' );
	}
}
require_once $__storesdk_core_impl;
