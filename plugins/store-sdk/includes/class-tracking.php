<?php
/**
 * Store SDK Tracking Functionality
 *
 * Handles parameter tracking and order attribution.
 *
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Store SDK Tracking Class.
 *
 * @class Store_SDK_Tracking
 */
class Store_SDK_Tracking {

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Hook to capture query parameters to session
		add_action('init', [$this, 'capture_to_session'], 20);
		// Add more hooks to catch order creation
		add_action('woocommerce_new_order', [$this, 'woocommerce_new_order'], 10, 1);
		
		// Add admin hooks for displaying tracking data in orders table
		if (is_admin()) {
			// Support both HPOS and legacy post-based orders
			add_filter('manage_edit-shop_order_columns', [$this, 'add_admin_order_columns']);
			add_action('manage_shop_order_posts_custom_column', [$this, 'populate_admin_order_columns'], 10, 2);
			
			// HPOS (High-Performance Order Storage) support
			add_filter('manage_woocommerce_page_wc-orders_columns', [$this, 'add_admin_order_columns']);
			add_action('manage_woocommerce_page_wc-orders_custom_column', [$this, 'populate_admin_order_columns_hpos'], 10, 2);
		}
	}

	public function woocommerce_new_order( $order_id ) {
		if (!STORESDK_TRACKING_ENABLE) return;
		if (!function_exists('WC') || !WC()->session) return;
		$params = WC()->session->get(STORESDK_TRACKING_SESSION_KEY);
		if (empty($params) || !is_array($params)) return;

		// Clean up expired data before saving to order
		$params = $this->cleanup_expired_tracking_data($params);
		if (empty($params)) return;

		// Extract just the values for order storage (remove timestamps)
		$order_data = [];
		foreach ($params as $key => $item) {
			if (is_array($item) && isset($item['value'])) {
				$order_data[$key] = $item['value'];
			}
			// Skip any malformed data - no backward compatibility
		}

		$order = wc_get_order($order_id);
		if ($order) {
			$order->update_meta_data(STORESDK_TRACKING_SESSION_KEY, $order_data);
			$order->save();
			
			// Clear tracking session if configured to do so
			if (STORESDK_TRACKING_UNSET_ON_ORDER) {
				WC()->session->set(STORESDK_TRACKING_SESSION_KEY, null);
			}
		}
	}

	/** Capture whitelisted query params → WC session */
	public function capture_to_session() {
		if (!STORESDK_TRACKING_ENABLE) return;
		// Skip admin pages and AJAX requests
		if (is_admin() || wp_doing_ajax()) return;
		if (!function_exists('WC') || !WC()->session) return;
		if (empty($_GET)) return; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		// Check if current path is whitelisted (if whitelist is not empty)
		$whitelisted_paths = STORESDK_TRACKING_WHITELISTED_PATHS;
		if (!empty($whitelisted_paths)) {
			$current_path = trim(parse_url(esc_url_raw($_SERVER['REQUEST_URI']), PHP_URL_PATH), '/');
			$path_allowed = false;
			
			foreach ($whitelisted_paths as $allowed_path) {
				$allowed_path = trim($allowed_path, '/');
				// Check for exact match or if current path starts with allowed path
				if ($current_path === $allowed_path || strpos($current_path, $allowed_path . '/') === 0) {
					$path_allowed = true;
					break;
				}
			}
			
			if (!$path_allowed) return;
		}

		$captured = [];
		$whitelisted = STORESDK_TRACKING_WHITELISTED_PARAMS;
		
		foreach ($_GET as $key => $value) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$k = sanitize_key((string) $key);
			if ($k === '' || !in_array($k, $whitelisted, true)) continue;

			// keep only simple scalar values; skip arrays/objects
			if (is_scalar($value)) {
				$captured[$k] = sanitize_text_field(wp_unslash((string) $value));
			}
		}

		if (!$captured) return;

		$existing = WC()->session->get(STORESDK_TRACKING_SESSION_KEY, []);
		
		// Clean up expired data
		$existing = $this->cleanup_expired_tracking_data($existing);
		
		// Add timestamps to new captured data
		$timestamped_captured = [];
		$current_time = time();
		foreach ($captured as $key => $value) {
			$timestamped_captured[$key] = [
				'value' => $value,
				'timestamp' => $current_time
			];
		}
		
		// Merge with existing data (new data overwrites old for same keys)
		$merged = array_merge((array) $existing, $timestamped_captured);

		WC()->session->set(STORESDK_TRACKING_SESSION_KEY, $merged);
	}

	/**
	 * Clean up expired tracking data
	 */
	private function cleanup_expired_tracking_data($data) {
		if (!is_array($data) || empty($data)) return [];
		
		$current_time = time();
		$expiry_time = STORESDK_TRACKING_EXPIRY_TIME;
		$cleaned_data = [];
		
		foreach ($data as $key => $item) {
			// Only handle new format with timestamps
			if (is_array($item) && isset($item['timestamp'], $item['value'])) {
				// New format with timestamp
				if (($current_time - $item['timestamp']) < $expiry_time) {
					$cleaned_data[$key] = $item; // Keep unexpired data
				}
				// If expired, it's simply not added to $cleaned_data (gets removed)
			}
			// Skip any other format - no backward compatibility
		}
		
		return $cleaned_data;
	}

	/**
	 * Add tracking parameter columns to the admin orders table
	 */
	public function add_admin_order_columns($columns) {
		$visible_columns = STORESDK_TRACKING_ADMIN_COLUMNS;
		if (empty($visible_columns) || !is_array($visible_columns)) return $columns;

		$new_columns = [];
		$tracking_columns_by_position = [];
		
		// Parse visible columns and group by position
		foreach ($visible_columns as $column_config) {
			// Support format: [key, title, position] or [key, title, position, default_value]
			if (is_array($column_config) && count($column_config) >= 3) {
				$param_key = $column_config[0];
				$column_title = $column_config[1];
				$position_after = $column_config[2];
			} else {
				continue; // Skip invalid configurations
			}
			
			if (!isset($tracking_columns_by_position[$position_after])) {
				$tracking_columns_by_position[$position_after] = [];
			}
			
			$tracking_columns_by_position[$position_after][] = [
				'key' => $param_key,
				'title' => $column_title
			];
		}
		
		$added_positions = [];
		
		// Process existing columns and insert tracking columns at appropriate positions
		foreach ($columns as $key => $column) {
			$new_columns[$key] = $column;
			
			// Check if we need to add tracking columns after this position
			if (isset($tracking_columns_by_position[$key])) {
				foreach ($tracking_columns_by_position[$key] as $tracking_column) {
					$column_key = 'tracking_' . sanitize_key($tracking_column['key']);
					$new_columns[$column_key] = $tracking_column['title'];
				}
				$added_positions[] = $key;
			}
		}

		// Add any remaining tracking columns that didn't find their position (fallback to end)
		foreach ($tracking_columns_by_position as $position => $tracking_columns) {
			if (!in_array($position, $added_positions, true)) {
				foreach ($tracking_columns as $tracking_column) {
					$column_key = 'tracking_' . sanitize_key($tracking_column['key']);
					$new_columns[$column_key] = $tracking_column['title'];
				}
			}
		}

		return $new_columns;
	}

	/**
	 * Populate tracking parameter columns in the admin orders table
	 */
	public function populate_admin_order_columns($column, $post_id) {
		$visible_columns = STORESDK_TRACKING_ADMIN_COLUMNS;
		if (empty($visible_columns) || !is_array($visible_columns)) return;

		// Check if this is a tracking column
		if (strpos($column, 'tracking_') !== 0) return;

		$param_key = str_replace('tracking_', '', $column);
		
		// Check if this parameter key is configured
		$is_valid_column = false;
		$default_value = null;
		foreach ($visible_columns as $column_config) {
			if (is_array($column_config) && count($column_config) >= 3) {
				$config_key = $column_config[0];
				if ($config_key === $param_key) {
					$is_valid_column = true;
					// Check if default value is provided (4th parameter)
					if (count($column_config) >= 4) {
						$default_value = $column_config[3];
					}
					break;
				}
			}
		}
		
		if (!$is_valid_column) return;

		$order = wc_get_order($post_id);
		if (!$order) return;

		// Get tracking data from order meta
		$tracking_data = $order->get_meta(STORESDK_TRACKING_SESSION_KEY);
		
		if (!empty($tracking_data) && is_array($tracking_data) && isset($tracking_data[$param_key])) {
			echo esc_html($tracking_data[$param_key]);
		} else {
			// Use default value if provided, otherwise show dash
			if ($default_value !== null) {
				echo esc_html($default_value);
			} else {
				echo '<span style="color: #999;">—</span>';
			}
		}
	}

	/**
	 * Populate tracking parameter columns in the HPOS admin orders table
	 */
	public function populate_admin_order_columns_hpos($column, $order) {
		$visible_columns = STORESDK_TRACKING_ADMIN_COLUMNS;
		if (empty($visible_columns) || !is_array($visible_columns)) return;

		// Check if this is a tracking column
		if (strpos($column, 'tracking_') !== 0) return;

		$param_key = str_replace('tracking_', '', $column);
		
		// Check if this parameter key is configured
		$is_valid_column = false;
		$default_value = null;
		foreach ($visible_columns as $column_config) {
			if (is_array($column_config) && count($column_config) >= 3) {
				$config_key = $column_config[0];
				if ($config_key === $param_key) {
					$is_valid_column = true;
					// Check if default value is provided (4th parameter)
					if (count($column_config) >= 4) {
						$default_value = $column_config[3];
					}
					break;
				}
			}
		}
		
		if (!$is_valid_column) return;

		// For HPOS, $order is already the order object
		if (!$order instanceof WC_Order) return;

		// Get tracking data from order meta
		$tracking_data = $order->get_meta(STORESDK_TRACKING_SESSION_KEY);
		
		if (!empty($tracking_data) && is_array($tracking_data) && isset($tracking_data[$param_key])) {
			echo esc_html($tracking_data[$param_key]);
		} else {
			// Use default value if provided, otherwise show dash
			if ($default_value !== null) {
				echo esc_html($default_value);
			} else {
				echo '<span style="color: #999;">—</span>';
			}
		}
	}
}