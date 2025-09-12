<?php
/**
 * Store SDK Authentication
 *
 * Handles WordPress authentication integration and user management.
 *
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Store SDK Authentication Class.
 *
 * @class Store_SDK_Auth
 */
class Store_SDK_Auth {

	/**
	 * JWT instance.
	 *
	 * @var Store_SDK_JWT
	 */
	private $jwt;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->jwt = new Store_SDK_JWT();
		$this->init();
	}

	/**
	 * Initialize authentication hooks.
	 */
	public function init() {
		if ($this->is_plugin_active()) {
			add_filter('determine_current_user', array($this, 'determine_current_user'), 50);
			add_filter('rest_authentication_errors', array($this, 'handle_force_authentication'), 5);
			add_filter('rest_authentication_errors', array($this, 'handle_jwt_errors'));
			add_action('init', array($this, 'handle_front_channel_autologin'));
		}
	}

	/**
	 * Check if the plugin is active.
	 *
	 * @return bool
	 */
	private function is_plugin_active() {
		return defined('STORESDK_JWT_PLUGIN_ACTIVE') && STORESDK_JWT_PLUGIN_ACTIVE;
	}

	/**
	 * Determine current user from JWT bearer token.
	 *
	 * @param int $user_id Current user ID.
	 * @return int
	 */
	public function determine_current_user($user_id) {
		// Get current route information
		$route_info = $this->get_current_route_info();
		
		// Hard bypass for refresh endpoint - don't parse Authorization header
		if ($route_info['is_refresh']) {
			return $user_id; // Let endpoint handle it
		}

		// Check for bearer token
		$header = $this->get_authorization_header();
		if (!$header || !preg_match('/^Bearer\s+(.*)$/i', $header, $matches)) {
			return $user_id;
		}

		$token = trim($matches[1]);
		if (empty($token)) {
			return $user_id;
		}

		// Decode JWT token
		$payload = $this->jwt->decode($token);

		if (is_wp_error($payload)) {
			// Don't poison auth pipeline for our own auth endpoints
			if ($route_info['is_auth_namespace']) {
				return 0; // Anonymous for /store-sdk/v1/auth/*
			}
			// Store error for other routes
			global $storesdk_jwt_last_error;
			$data = $payload->get_error_data();
			if (!is_array($data)) {
				$data = array();
			}
			if (empty($data['status'])) {
				$data['status'] = 401;
			}
			$storesdk_jwt_last_error = new WP_Error(
				$payload->get_error_code() ?: 'storesdk_jwt.invalid_bearer',
				$payload->get_error_message() ?: __('Invalid bearer token', 'store-sdk'),
				$data
			);
			return 0;
		}

		if (empty($payload['sub'])) {
			return $user_id;
		}

		// Get user and validate token version
		$jwt_user = get_user_by('id', (int) $payload['sub']);
		if (!$jwt_user) {
			return $user_id;
		}

		$current_version = $this->jwt->get_user_token_version($jwt_user->ID);
		if ($current_version > 1 && (empty($payload['ver']) || (int) $payload['ver'] !== $current_version)) {
			return $user_id;
		}

		return (int) $jwt_user->ID;
	}

	/**
	 * Handle forced authentication for protected endpoints.
	 *
	 * @param WP_Error|null $errors Current authentication errors.
	 * @return WP_Error|null
	 */
	public function handle_force_authentication($errors) {
		// Only process if no existing errors
		if (!empty($errors)) {
			return $errors;
		}

		$current_route = $this->get_current_route_path();
		if ($this->endpoint_requires_auth($current_route)) {
			$user = wp_get_current_user();
			if (!$user || $user->ID === 0) {
				return new WP_Error(
					'storesdk_jwt.auth_required',
					__('Authentication required for this endpoint', 'store-sdk'),
					array('status' => 401)
				);
			}
		}

		return $errors;
	}

	/**
	 * Handle JWT-specific authentication errors.
	 *
	 * @param WP_Error|null $result Current authentication result.
	 * @return WP_Error|null
	 */
	public function handle_jwt_errors($result) {
		if (!empty($result)) {
			return $result;
		}

		global $storesdk_jwt_last_error;
		if ($storesdk_jwt_last_error instanceof WP_Error) {
			$error = $storesdk_jwt_last_error;
			$storesdk_jwt_last_error = null;
			return $error;
		}

		return $result;
	}

	/**
	 * Handle front-channel autologin.
	 */
	public function handle_front_channel_autologin() {
		if (!$this->is_front_channel_enabled()) {
			return;
		}

		if (!isset($_GET['storesdk_autologin']) || !isset($_GET['token'])) {
			return;
		}

		$token = trim((string) $_GET['token']);
		if (empty($token)) {
			return;
		}

		$payload = $this->jwt->decode($token);
		if (is_wp_error($payload) || empty($payload['sub'])) {
			return;
		}

		// Validate one-time token requirements
		if ($this->requires_one_time_for_autologin() && (empty($payload['one_time']) || empty($payload['jti']))) {
			return;
		}

		// Check JTI validity
		$jti_key = 'storesdk_jti_' . sanitize_key($payload['jti']);
		$marker = get_transient($jti_key);
		if ($marker !== 'valid') {
			return;
		}
		delete_transient($jti_key);

		// Get user and log them in
		$user = get_user_by('id', (int) $payload['sub']);
		if (!$user) {
			return;
		}

		wp_set_current_user($user->ID);
		wp_set_auth_cookie($user->ID, false);
		do_action('wp_login', $user->user_login, $user);

		// Handle redirect
		$redirect = isset($_GET['redirect']) ? $this->sanitize_redirect($_GET['redirect']) : null;
		if ($redirect) {
			wp_safe_redirect($redirect);
		} else {
			wp_safe_redirect(home_url('/'));
		}
		exit;
	}

	/**
	 * Get current user from bearer token (for utility use).
	 *
	 * @return WP_User|false
	 */
	public function get_current_user_from_bearer() {
		$header = $this->get_authorization_header();
		if (!$header || !preg_match('/^Bearer\s+(.*)$/i', $header, $matches)) {
			return false;
		}

		$payload = $this->jwt->decode(trim($matches[1]));
		if (is_wp_error($payload) || empty($payload['sub'])) {
			return false;
		}

		$user = get_user_by('id', (int) $payload['sub']);
		return $user ?: false;
	}

	/**
	 * Get authorization header from various sources.
	 *
	 * @return string|null
	 */
	public function get_authorization_header() {
		// Common path (FPM/CGI, Nginx fastcgi_param)
		if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
			return trim($_SERVER['HTTP_AUTHORIZATION']);
		}

		// Apache, some proxies
		if (function_exists('apache_request_headers')) {
			$headers = apache_request_headers();
			if (is_array($headers) && !empty($headers)) {
				$headers = array_change_key_case($headers, CASE_LOWER);
				if (!empty($headers['authorization'])) {
					return trim($headers['authorization']);
				}
			}
		}

		// Other environment fallbacks
		$fallback_keys = array('REDIRECT_HTTP_AUTHORIZATION', 'HTTP_X_AUTHORIZATION', 'X-HTTP_AUTHORIZATION');
		foreach ($fallback_keys as $key) {
			if (!empty($_SERVER[$key])) {
				return trim($_SERVER[$key]);
			}
		}

		return null;
	}

	/**
	 * Get current route information.
	 *
	 * @return array
	 */
	private function get_current_route_info() {
		$uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
		$path = ltrim((string) wp_parse_url($uri, PHP_URL_PATH), '/');
		$query = (string) wp_parse_url($uri, PHP_URL_QUERY);
		parse_str($query, $query_params);
		$route = isset($query_params['rest_route']) ? $query_params['rest_route'] : (isset($_GET['rest_route']) ? $_GET['rest_route'] : null);
		$prefix = function_exists('rest_get_url_prefix') ? rest_get_url_prefix() : 'wp-json';

		$is_refresh = false;
		$is_auth_namespace = false;

		// Pretty URLs
		if (!empty($path)) {
			if (preg_match('#^' . preg_quote($prefix, '#') . '/store-sdk/v1/auth/refresh/?$#', $path)) {
				$is_refresh = true;
			}
			if (preg_match('#^' . preg_quote($prefix, '#') . '/store-sdk/v1/auth(/|$)#', $path)) {
				$is_auth_namespace = true;
			}
		}

		// Non-pretty URLs
		if (!$is_refresh && $route && $route === '/store-sdk/v1/auth/refresh') {
			$is_refresh = true;
		}
		if (!$is_auth_namespace && $route && strpos($route, '/store-sdk/v1/auth') === 0) {
			$is_auth_namespace = true;
		}

		return array(
			'is_refresh' => $is_refresh,
			'is_auth_namespace' => $is_auth_namespace
		);
	}

	/**
	 * Get current REST route path.
	 *
	 * @return string
	 */
	public function get_current_route_path() {
		$uri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '';
		$path = ltrim((string) wp_parse_url($uri, PHP_URL_PATH), '/');
		$query = (string) wp_parse_url($uri, PHP_URL_QUERY);
		parse_str($query, $query_params);
		$route = isset($query_params['rest_route']) ? $query_params['rest_route'] : (isset($_GET['rest_route']) ? $_GET['rest_route'] : null);
		$prefix = function_exists('rest_get_url_prefix') ? rest_get_url_prefix() : 'wp-json';

		// Pretty URLs: "wp-json/wc/store/v1/cart"
		if (!empty($path) && strpos($path, $prefix . '/') === 0) {
			return substr($path, strlen($prefix) + 1);
		}

		// Non-pretty URLs: "?rest_route=/wc/store/v1/cart"
		if ($route && strpos($route, '/') === 0) {
			return ltrim($route, '/');
		}

		return '';
	}

	/**
	 * Check if endpoint requires authentication.
	 *
	 * @param string $route_path Route path to check.
	 * @return bool
	 */
	public function endpoint_requires_auth($route_path = null) {
		$protected_endpoints = defined('STORESDK_JWT_FORCE_AUTH_ENDPOINTS') ? STORESDK_JWT_FORCE_AUTH_ENDPOINTS : '';
		
		if ($route_path === null) {
			$route_path = $this->get_current_route_path();
		}

		if (empty($route_path)) {
			return false;
		}

		// Parse endpoints list
		$endpoints = array_filter(array_map('trim', explode(',', $protected_endpoints)));
		$endpoints = apply_filters('storesdk_jwt_force_auth_endpoints', $endpoints, $route_path);

		foreach ($endpoints as $endpoint) {
			$endpoint = trim($endpoint);
			if (empty($endpoint)) {
				continue;
			}

			// Normalize endpoint
			$normalized_endpoint = $endpoint;
			$prefix = function_exists('rest_get_url_prefix') ? rest_get_url_prefix() : 'wp-json';
			if (strpos($normalized_endpoint, $prefix . '/') === 0) {
				$normalized_endpoint = substr($normalized_endpoint, strlen($prefix) + 1);
			}

			// Support wildcard matching
			$pattern = str_replace('*', '.*', preg_quote($normalized_endpoint, '#'));
			if (preg_match('#^' . $pattern . '$#', $route_path)) {
				return apply_filters('storesdk_jwt_endpoint_requires_auth', true, $route_path, $endpoint);
			}

			// Exact match
			if ($route_path === $normalized_endpoint || $route_path === $endpoint) {
				return apply_filters('storesdk_jwt_endpoint_requires_auth', true, $route_path, $endpoint);
			}
		}

		return apply_filters('storesdk_jwt_endpoint_requires_auth', false, $route_path, null);
	}

	/**
	 * Check if front-channel autologin is enabled.
	 *
	 * @return bool
	 */
	private function is_front_channel_enabled() {
		return defined('STORESDK_JWT_ENABLE_FRONT_CHANNEL') && STORESDK_JWT_ENABLE_FRONT_CHANNEL;
	}

	/**
	 * Check if one-time tokens are required for autologin.
	 *
	 * @return bool
	 */
	private function requires_one_time_for_autologin() {
		return defined('STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN') && STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN;
	}

	/**
	 * Sanitize redirect URL.
	 *
	 * @param string $url URL to sanitize.
	 * @return string|null
	 */
	private function sanitize_redirect($url) {
		if (!$url) {
			return null;
		}

		$url = trim($url);
		if (strpos($url, 'http://') !== 0 && strpos($url, 'https://') !== 0) {
			if (substr($url, 0, 1) !== '/') {
				$url = '/' . $url;
			}
			return $url;
		}

		$host = parse_url(home_url(), PHP_URL_HOST);
		$url_host = parse_url($url, PHP_URL_HOST);
		if ($host && $url_host && strtolower($host) === strtolower($url_host)) {
			return $url;
		}

		return null;
	}
}