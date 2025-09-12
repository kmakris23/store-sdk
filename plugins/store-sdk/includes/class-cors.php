<?php
/**
 * Store SDK CORS Handling
 *
 * Handles Cross-Origin Resource Sharing (CORS) for the Store SDK plugin.
 *
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Store SDK CORS Class.
 *
 * @class Store_SDK_CORS
 */
class Store_SDK_CORS {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->init();
	}

	/**
	 * Initialize CORS handling.
	 */
	public function init() {
		if ($this->is_cors_enabled()) {
			add_action('rest_api_init', array($this, 'setup_cors_headers'));
		}
	}

	/**
	 * Check if CORS is enabled.
	 *
	 * @return bool
	 */
	private function is_cors_enabled() {
		return defined('STORESDK_JWT_CORS_ENABLE') && STORESDK_JWT_CORS_ENABLE;
	}

	/**
	 * Setup CORS headers for REST API requests.
	 */
	public function setup_cors_headers() {
		// Remove WP core CORS headers to avoid duplicates / conflicts
		remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

		add_filter('rest_pre_serve_request', array($this, 'send_cors_headers'), 0);
	}

	/**
	 * Send CORS headers.
	 *
	 * @param mixed $value The pre-serve request value.
	 * @return mixed
	 */
	public function send_cors_headers($value) {
		$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
		$allowed_origins = $this->get_allowed_origins();

		if ($this->is_origin_allowed($origin, $allowed_origins)) {
			$this->set_cors_headers($origin, $allowed_origins);
		}

		// Short-circuit preflight (OPTIONS) for REST routes
		if ($this->is_preflight_request()) {
			status_header(204);
			exit;
		}

		return $value;
	}

	/**
	 * Get allowed CORS origins.
	 *
	 * @return array
	 */
	private function get_allowed_origins() {
		$allowed = array_filter(array_map('trim', explode(',', (string) STORESDK_JWT_CORS_ALLOWED_ORIGINS)));
		
		// Allow customization via filter
		return apply_filters('storesdk_jwt_cors_allowed_origins', $allowed, isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '');
	}

	/**
	 * Check if origin is allowed.
	 *
	 * @param string $origin The request origin.
	 * @param array $allowed_origins Array of allowed origins.
	 * @return bool
	 */
	private function is_origin_allowed($origin, $allowed_origins) {
		if (empty($origin)) {
			return false;
		}

		// Check for wildcard or exact match
		return in_array('*', $allowed_origins, true) || in_array($origin, $allowed_origins, true);
	}

	/**
	 * Set CORS headers.
	 *
	 * @param string $origin The request origin.
	 * @param array $allowed_origins Array of allowed origins.
	 */
	private function set_cors_headers($origin, $allowed_origins) {
		// Handle Access-Control-Allow-Origin header
		if (in_array('*', $allowed_origins, true) && $this->credentials_allowed()) {
			// When using wildcard with credentials, we must echo the actual origin
			// not '*' because browsers reject '*' with credentials
			header('Access-Control-Allow-Origin: ' . $origin);
		} elseif (in_array('*', $allowed_origins, true)) {
			header('Access-Control-Allow-Origin: *');
		} else {
			header('Access-Control-Allow-Origin: ' . $origin);
		}

		// Set other CORS headers
		if ($this->credentials_allowed()) {
			header('Access-Control-Allow-Credentials: true');
		}

		header('Access-Control-Allow-Methods: ' . $this->get_allowed_methods());
		header('Access-Control-Allow-Headers: ' . $this->get_allowed_headers());
		header('Vary: Origin');
	}

	/**
	 * Check if credentials are allowed.
	 *
	 * @return bool
	 */
	private function credentials_allowed() {
		return defined('STORESDK_JWT_CORS_ALLOW_CREDENTIALS') && STORESDK_JWT_CORS_ALLOW_CREDENTIALS;
	}

	/**
	 * Get allowed HTTP methods.
	 *
	 * @return string
	 */
	private function get_allowed_methods() {
		return defined('STORESDK_JWT_CORS_ALLOW_METHODS') ? STORESDK_JWT_CORS_ALLOW_METHODS : 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
	}

	/**
	 * Get allowed headers.
	 *
	 * @return string
	 */
	private function get_allowed_headers() {
		return defined('STORESDK_JWT_CORS_ALLOW_HEADERS') ? STORESDK_JWT_CORS_ALLOW_HEADERS : 'Authorization, Content-Type, cart-token';
	}

	/**
	 * Check if this is a preflight request.
	 *
	 * @return bool
	 */
	private function is_preflight_request() {
		return isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS';
	}
}