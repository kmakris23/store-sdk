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

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

// Define plugin constants.
if (!defined('STORESDK_JWT_AUTH_VERSION')) {
	define('STORESDK_JWT_AUTH_VERSION', '1.0.0');
}

if (!defined('STORESDK_PLUGIN_FILE')) {
	define('STORESDK_PLUGIN_FILE', __FILE__);
}

// Define default configuration constants.
$storesdk_defaults = array(
	'STORESDK_JWT_ACCESS_TTL' => 3600,
	'STORESDK_JWT_REFRESH_TTL' => 60 * 60 * 24 * 14,
	'STORESDK_JWT_REFRESH_MIN_TTL' => 60 * 60 * 24,
	'STORESDK_JWT_REFRESH_MAX_TTL' => 60 * 60 * 24 * 30,
	'STORESDK_JWT_ONE_TIME_TTL' => 300,
	'STORESDK_JWT_ONE_TIME_MIN_TTL' => 30,
	'STORESDK_JWT_ONE_TIME_MAX_TTL' => 900,
	'STORESDK_JWT_REFRESH_MAX_TOKENS' => 10,
	'STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN' => true,
	'STORESDK_JWT_ENABLE_FRONT_CHANNEL' => true,
	'STORESDK_JWT_LEEWAY' => 1,
	'STORESDK_JWT_CORS_ENABLE' => true,
	'STORESDK_JWT_CORS_ALLOWED_ORIGINS' => '*',
	'STORESDK_JWT_CORS_ALLOW_CREDENTIALS' => true,
	'STORESDK_JWT_CORS_ALLOW_METHODS' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
	'STORESDK_JWT_CORS_ALLOW_HEADERS' => 'Authorization, Content-Type, cart-token',

	'STORESDK_TRACKING_ENABLE' => true,
	'STORESDK_TRACKING_WHITELISTED_PARAMS' => [],
	'STORESDK_TRACKING_WHITELISTED_PATHS' => [],
	'STORESDK_TRACKING_UNSET_ON_ORDER' => true,
	'STORESDK_TRACKING_SESSION_KEY' => '_storesdk_tracking',
	'STORESDK_TRACKING_EXPIRY_TIME' => 86400, // 24 hours in seconds
	/** Example:
	 * 
	 * 'STORESDK_TRACKING_ADMIN_COLUMNS' => [
	 * 		['_store_sdk_source', 'SDK Source', 'order_status']
	 * ],
	 * 
	 */
	'STORESDK_TRACKING_ADMIN_COLUMNS' => [
		['_store_sdk_source', 'SDK Source', 'order_status']
	],
	'STORESDK_TRACKING_ADMIN_COLUMNS_AFTER' => 'order_status',
);

foreach ($storesdk_defaults as $constant => $default_value) {
	if (!defined($constant)) {
		define($constant, $default_value);
	}
}
unset($storesdk_defaults);

// Determine plugin activation status.
$storesdk_flag_defined = defined('STORESDK_JWT_ENABLED');
$storesdk_flag_enabled = $storesdk_flag_defined ? (bool) STORESDK_JWT_ENABLED : true;
$storesdk_secret_defined = defined('STORESDK_JWT_SECRET') && 
	!empty(constant('STORESDK_JWT_SECRET')) && 
	constant('STORESDK_JWT_SECRET') !== 'change_me' && 
	constant('STORESDK_JWT_SECRET') !== 'CHANGE_ME';

if (!defined('STORESDK_JWT_PLUGIN_ACTIVE')) {
	define('STORESDK_JWT_PLUGIN_ACTIVE', $storesdk_flag_enabled && $storesdk_secret_defined);
}

// Clean up temporary variables.
unset($storesdk_flag_defined, $storesdk_flag_enabled, $storesdk_secret_defined);

/**
 * Returns the main instance of Store SDK.
 *
 * @since 1.0.0
 * @return Store_SDK
 */
function Store_SDK() {
	return Store_SDK::instance();
}

// Include the main Store SDK class.
if (!class_exists('Store_SDK', false)) {
	include_once dirname(STORESDK_PLUGIN_FILE) . '/includes/class-store-sdk.php';
}

// Global for backwards compatibility.
$GLOBALS['store_sdk'] = Store_SDK();

// Hook for final action after plugin is fully loaded.
do_action('storesdk_jwt_auth_loaded');