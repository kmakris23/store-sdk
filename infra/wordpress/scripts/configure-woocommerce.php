<?php
/**
 * Idempotent WooCommerce store configuration:
 * - Enable only Cash on Delivery gateway (disable others)
 * - Configure basic shipping (flat rate) & ensure at least one zone
 * - Populate onboarding profile & mark task list tasks as completed
 * - Hide task list / onboarding nags
 * Guarded by `store_sdk_wc_configured` option.
 */

if ( get_option( 'store_sdk_wc_configured' ) ) {
    echo "WooCommerce already configured."; return; }

if ( ! class_exists( 'WooCommerce' ) ) { echo "WooCommerce not loaded."; return; }

// Ensure payment gateways loaded
WC()->payment_gateways();
if ( function_exists( 'WC' ) ) { WC()->shipping(); }
$gateways = WC()->payment_gateways()->payment_gateways();
foreach ( $gateways as $id => $gateway ) {
    $option_key = 'woocommerce_' . $id . '_settings';
    $current    = get_option( $option_key, [] );
    if ( ! is_array( $current ) ) { $current = []; }
    if ( 'cod' === $id ) {
        $new = array_merge( $current, [
            'enabled'            => 'yes',
            'title'              => 'Cash on delivery',
            'description'        => 'Pay with cash upon delivery.',
            'instructions'       => 'Please have the exact amount ready.',
            'enable_for_methods' => '',
            'enable_for_virtual' => 'yes',
        ] );
        update_option( $option_key, $new );
    } else {
        if ( ( $current['enabled'] ?? '' ) !== 'no' ) {
            $current['enabled'] = 'no';
            update_option( $option_key, $current );
        }
    }
}

// Shipping zone & method (flat rate) if none exist
if ( class_exists( 'WC_Shipping_Zones' ) ) {
    $zones = WC_Shipping_Zones::get_zones();
    if ( empty( $zones ) ) {
        $zone = new WC_Shipping_Zone();
        $zone->set_zone_name( 'Rest of the World' );
        $zone->save();
        // Add flat rate method
        $zone->add_shipping_method( 'flat_rate' );
        // Configure cost (first instance)
        $methods = $zone->get_shipping_methods();
        foreach ( $methods as $m ) {
            if ( 'flat_rate' === $m->id ) {
                $m->settings['enabled'] = 'yes';
                $m->settings['title']   = 'Flat rate';
                $m->settings['cost']    = '10';
                $m->process_admin_options();
            }
        }
    }
}

// Onboarding profile data (minimal viable)
update_option( 'woocommerce_onboarding_profile', [
    'industry'         => 'other',
    'product_types'    => [ 'physical' ],
    'business_extensions' => [],
    'theme'            => 'default',
    'selling_venues'   => [],
    'setup_client'     => 'no',
    'is_agency'        => 'no',
    'skipped'          => false,
] );

// Mark tasks complete (best-effort keys used by recent WooCommerce versions)
$completed = [ 'store_details','product_types','products','payments','tax','shipping','marketing','appearance' ];
update_option( 'woocommerce_task_list_tracked_completed_tasks', $completed );
update_option( 'woocommerce_task_list_tracked_started_tasks', $completed );
update_option( 'woocommerce_admin_install_timestamp', time() );
update_option( 'woocommerce_task_list_hidden', 'yes' );
update_option( 'woocommerce_task_list_enabled', 'no' );
update_option( 'woocommerce_allow_tracking', 'no' );
update_option( 'woocommerce_show_marketplace_suggestions', 'no' );
update_option( 'woocommerce_show_setup_wizard', 'no' );
update_option( 'woocommerce_task_list_welcome_modal_dismissed', 'yes' );
update_option( 'woocommerce_shipping_enabled', 'yes' );

// Clear cached gateways so Store API / checkout sees COD immediately
delete_transient( 'woocommerce_payment_gateways' );

// Guard option
update_option( 'store_sdk_wc_configured', 1, true );
echo "WooCommerce configured (COD + onboarding suppressed).";
