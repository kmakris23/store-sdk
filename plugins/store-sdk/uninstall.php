<?php
/**
 * Uninstall cleanup for Store SDK Authentication plugin.
 *
 * Removes user meta and transient data created by the JWT auth module.
 *
 * Safety:
 * - Executed only when WP_UNINSTALL_PLUGIN is defined.
 * - Supports multisite (loops through all sites if network uninstall).
 * - Skip heavy operations by defining STORESDK_JWT_SKIP_UNINSTALL_CLEANUP = true.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

if ( defined( 'STORESDK_JWT_SKIP_UNINSTALL_CLEANUP' ) && STORESDK_JWT_SKIP_UNINSTALL_CLEANUP ) {
    return;
}

// Allow external code to short‑circuit cleanup (must load prior via MU plugin or similar).
if ( function_exists( 'apply_filters' ) ) {
    $do_cleanup = apply_filters( 'storesdk_jwt_uninstall_cleanup', true );
    if ( ! $do_cleanup ) {
        return;
    }
}

if ( ! function_exists( 'storesdk_jwt_uninstall_cleanup_site' ) ) {
    function storesdk_jwt_uninstall_cleanup_site() {
        global $wpdb;

        // Delete user meta (refresh tokens + token version counters)
        $meta_keys = [ 'storesdk_refresh_tokens', 'storesdk_token_version' ];
        $in        = implode( "','", array_map( 'esc_sql', $meta_keys ) );
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query( "DELETE FROM {$wpdb->usermeta} WHERE meta_key IN ('{$in}')" );

        // Delete transients storing one-time token JTIs (they auto-expire but we purge eagerly)
        // Stored as _transient_storesdk_jti_xxx and _transient_timeout_storesdk_jti_xxx
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_storesdk_jti_%' OR option_name LIKE '_transient_timeout_storesdk_jti_%'" );
    }
}

if ( is_multisite() ) {
    $sites = get_sites( [ 'fields' => 'ids' ] );
    foreach ( $sites as $site_id ) {
        switch_to_blog( $site_id );
        storesdk_jwt_uninstall_cleanup_site();
        restore_current_blog();
    }
} else {
    storesdk_jwt_uninstall_cleanup_site();
}
