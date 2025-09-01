<?php
// ensure-test-coupons.php
// Idempotently create / ensure existence of test coupons for the Store SDK integration environment.
// Executed via: wp eval-file /scripts/ensure-test-coupons.php

if (!function_exists('ensure_coupon')) {
    /**
     * Ensure a WooCommerce coupon exists with given attributes.
     * Mirrors original inline logic from wp-setup.sh but extracted for readability & maintenance.
     */
    function ensure_coupon(string $code, string $amount, string $discount_type): void {
        $existing = get_page_by_title($code, OBJECT, 'shop_coupon');
        if ($existing) {
            echo "Coupon {$code} exists\n";
            return;
        }
        $coupon_post = [
            'post_title'  => $code,
            'post_name'   => sanitize_title($code),
            'post_type'   => 'shop_coupon',
            'post_status' => 'publish',
        ];
        $cid = wp_insert_post($coupon_post, true);
        if (is_wp_error($cid)) {
            echo "Failed create {$code}: " . $cid->get_error_message() . "\n";
            return;
        }
        // Core coupon meta fields
        update_post_meta($cid, 'discount_type', $discount_type);
        update_post_meta($cid, 'coupon_amount', $amount);
        update_post_meta($cid, 'individual_use', 'no');
        update_post_meta($cid, 'usage_limit', '');
        update_post_meta($cid, 'free_shipping', 'no');
        echo "Created coupon {$code}\n";
    }
}

ensure_coupon('SUMMER10', '10', 'fixed_cart');
ensure_coupon('PERCENT15', '15', 'percent');
echo "Coupon seeding complete\n";
