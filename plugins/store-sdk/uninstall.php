<?php
/**
 * Store SDK Uninstall
 *
 * Cleanup for Store SDK Authentication plugin.
 * Removes user meta and transient data created by the JWT auth module.
 *
 * @since 1.0.0
 */

// Exit if not called by WordPress
if (!defined('WP_UNINSTALL_PLUGIN')) {
	exit;
}

// Allow skipping cleanup
if (defined('STORESDK_JWT_SKIP_UNINSTALL_CLEANUP') && STORESDK_JWT_SKIP_UNINSTALL_CLEANUP) {
	return;
}

// Allow external code to short-circuit cleanup
if (function_exists('apply_filters')) {
	$do_cleanup = apply_filters('storesdk_jwt_uninstall_cleanup', true);
	if (!$do_cleanup) {
		return;
	}
}

/**
 * Store SDK Uninstaller Class
 */
class Store_SDK_Uninstaller {

	/**
	 * Run the uninstall process.
	 */
	public static function uninstall() {
		if (is_multisite()) {
			self::uninstall_multisite();
		} else {
			self::cleanup_site();
		}
	}

	/**
	 * Handle multisite uninstall.
	 */
	private static function uninstall_multisite() {
		$sites = get_sites(array('fields' => 'ids'));
		foreach ($sites as $site_id) {
			switch_to_blog($site_id);
			self::cleanup_site();
			restore_current_blog();
		}
	}

	/**
	 * Clean up a single site.
	 */
	private static function cleanup_site() {
		global $wpdb;

		// Delete user meta (refresh tokens + token version counters)
		$meta_keys = array('storesdk_refresh_tokens', 'storesdk_token_version');
		$placeholders = implode(',', array_fill(0, count($meta_keys), '%s'));
		
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->usermeta} WHERE meta_key IN ({$placeholders})",
				...$meta_keys
			)
		);

		// Delete one-time token transients
		// Stored as _transient_storesdk_jti_xxx and _transient_timeout_storesdk_jti_xxx
		$wpdb->query(
			"DELETE FROM {$wpdb->options} 
			 WHERE option_name LIKE '_transient_storesdk_jti_%' 
			    OR option_name LIKE '_transient_timeout_storesdk_jti_%'"
		);

		// Allow additional cleanup via action
		do_action('storesdk_jwt_after_uninstall_cleanup');
	}
}

// Run the uninstaller
Store_SDK_Uninstaller::uninstall();