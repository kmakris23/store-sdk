<?php
/**
 * Store SDK REST API
 *
 * Handles all REST API endpoint registration and management.
 *
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Store SDK API Class.
 *
 * @class Store_SDK_API
 */
class Store_SDK_API {

	/**
	 * JWT instance.
	 *
	 * @var Store_SDK_JWT
	 */
	private $jwt;

	/**
	 * Auth instance.
	 *
	 * @var Store_SDK_Auth
	 */
	private $auth;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->jwt = new Store_SDK_JWT();
		$this->auth = new Store_SDK_Auth();
		$this->init();
	}

	/**
	 * Initialize API endpoints.
	 */
	public function init() {
		add_action('rest_api_init', array($this, 'register_routes'));
	}

	/**
	 * Register all REST API routes.
	 */
	public function register_routes() {
		$this->register_auth_routes();
		$this->register_status_routes();
		$this->register_debug_routes();
	}

	/**
	 * Register authentication routes.
	 */
	private function register_auth_routes() {
		// Token endpoint
		register_rest_route('store-sdk/v1/auth', '/token', array(
			'methods'  => 'POST',
			'permission_callback' => '__return_true',
			'callback' => array($this, 'issue_token'),
			'args' => array(
				'login' => array('required' => true),
				'password' => array('required' => true),
				'refresh_ttl' => array('required' => false),
				'access_ttl' => array('required' => false),
			),
		));

		// Refresh endpoint
		register_rest_route('store-sdk/v1/auth', '/refresh', array(
			'methods' => 'POST',
			'permission_callback' => '__return_true',
			'callback' => array($this, 'refresh_token'),
			'args' => array(
				'refresh_token' => array('required' => true)
			),
		));

		// One-time token endpoint
		register_rest_route('store-sdk/v1/auth', '/one-time-token', array(
			'methods' => 'POST',
			'permission_callback' => array($this, 'check_user_logged_in'),
			'callback' => array($this, 'issue_one_time_token'),
			'args' => array(
				'ttl' => array('required' => false)
			),
		));

		// Autologin endpoint
		register_rest_route('store-sdk/v1/auth', '/autologin', array(
			'methods' => 'POST,GET',
			'permission_callback' => '__return_true',
			'callback' => array($this, 'autologin'),
			'args' => array(
				'token' => array('required' => true),
				'redirect' => array('required' => false),
			),
		));

		// Validate endpoint
		register_rest_route('store-sdk/v1/auth', '/validate', array(
			'methods' => 'GET',
			'permission_callback' => '__return_true',
			'callback' => array($this, 'validate_token'),
		));

		// Revoke endpoint
		register_rest_route('store-sdk/v1/auth', '/revoke', array(
			'methods' => 'POST',
			'permission_callback' => array($this, 'check_authenticated'),
			'callback' => array($this, 'revoke_tokens'),
			'args' => array(
				'scope' => array('required' => false)
			),
		));
	}

	/**
	 * Register status routes.
	 */
	private function register_status_routes() {
		register_rest_route('store-sdk/v1/auth', '/status', array(
			'methods' => 'GET',
			'permission_callback' => '__return_true',
			'callback' => array($this, 'get_status'),
		));
	}

	/**
	 * Register debug routes.
	 */
	private function register_debug_routes() {
		register_rest_route('store-sdk/v1/auth', '/debug-route', array(
			'methods' => 'GET',
			'permission_callback' => '__return_true',
			'callback' => array($this, 'debug_route'),
		));

		register_rest_route('store-sdk/v1/debug', '/status', array(
			'methods' => 'GET',
			'permission_callback' => '__return_true',
			'callback' => array($this, 'debug_status'),
		));

		register_rest_route('store-sdk/v1/test', '/cart-protected', array(
			'methods' => 'GET',
			'permission_callback' => '__return_true',
			'callback' => array($this, 'test_cart_protected'),
		));
	}

	/**
	 * Check if plugin is active before processing requests.
	 *
	 * @return bool|WP_Error
	 */
	private function check_plugin_active() {
		if (!defined('STORESDK_JWT_PLUGIN_ACTIVE') || !STORESDK_JWT_PLUGIN_ACTIVE) {
			return new WP_Error('storesdk_jwt.inactive', __('Store SDK JWT authentication inactive', 'store-sdk'), array('status' => 400));
		}
		return true;
	}

	/**
	 * Permission callback for logged in users.
	 *
	 * @return bool
	 */
	public function check_user_logged_in() {
		return is_user_logged_in();
	}

	/**
	 * Permission callback for authenticated users (session or bearer).
	 *
	 * @return bool
	 */
	public function check_authenticated() {
		return is_user_logged_in() || $this->auth->get_current_user_from_bearer();
	}

	/**
	 * Issue access token.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function issue_token(WP_REST_Request $request) {
		$check = $this->check_plugin_active();
		if (is_wp_error($check)) {
			return $check;
		}

		$login = trim($request->get_param('login'));
		$password = (string) $request->get_param('password');

		if (empty($login) || empty($password)) {
			return new WP_Error('storesdk_jwt.missing_credentials', __('Missing login or password', 'store-sdk'), array('status' => 400));
		}

		// Find user by email or login
		$user = null;
		if (is_email($login)) {
			$user = get_user_by('email', $login);
			if ($user) {
				$login = $user->user_login;
			}
		}
		if (!$user) {
			$user = get_user_by('login', $login);
		}

		if (!$user) {
			return new WP_Error('storesdk_jwt.invalid_credentials', __('Invalid credentials', 'store-sdk'), array('status' => 403));
		}

		if (!wp_check_password($password, $user->user_pass, $user->ID)) {
			return new WP_Error('storesdk_jwt.invalid_credentials', __('Invalid credentials', 'store-sdk'), array('status' => 403));
		}

		// Create access token
		$issued_at = time();
		$expires_at = $issued_at + $this->jwt->get_default_expiration();
		
		$access_ttl = (int) $request->get_param('access_ttl');
		if ($access_ttl > 0) {
			$access_ttl = max(1, $access_ttl);
			$expires_at = $issued_at + $access_ttl;
		}

		$payload = array(
			'iss'   => get_site_url(),
			'aud'   => get_site_url(),
			'iat'   => $issued_at,
			'nbf'   => $issued_at - 5,
			'exp'   => $expires_at,
			'sub'   => $user->ID,
			'login' => $user->user_login,
			'email' => $user->user_email,
			'jti'   => $this->jwt->generate_jti(),
			'ver'   => $this->jwt->get_user_token_version($user->ID),
		);

		$token = $this->jwt->encode($payload);

		// Create refresh token
		$refresh_ttl = (int) $request->get_param('refresh_ttl');
		if ($refresh_ttl <= 0) {
			$refresh_ttl = defined('STORESDK_JWT_REFRESH_TTL') ? (int) STORESDK_JWT_REFRESH_TTL : 60 * 60 * 24 * 14;
		}
		
		$min_ttl = defined('STORESDK_JWT_REFRESH_MIN_TTL') ? (int) STORESDK_JWT_REFRESH_MIN_TTL : 60 * 60 * 24;
		$max_ttl = defined('STORESDK_JWT_REFRESH_MAX_TTL') ? (int) STORESDK_JWT_REFRESH_MAX_TTL : 60 * 60 * 24 * 30;
		$refresh_ttl = max($min_ttl, min($max_ttl, $refresh_ttl));

		$refresh = $this->jwt->issue_refresh_token($user->ID, $refresh_ttl);

		return new WP_REST_Response(array(
			'token'              => $token,
			'token_type'         => 'Bearer',
			'expires_in'         => $expires_at - time(),
			'refresh_token'      => $refresh['token'],
			'refresh_expires_in' => $refresh['expires_in'],
			'user'               => array(
				'id'           => $user->ID,
				'login'        => $user->user_login,
				'email'        => $user->user_email,
				'display_name' => $user->display_name
			)
		));
	}

	/**
	 * Refresh access token.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function refresh_token(WP_REST_Request $request) {
		$check = $this->check_plugin_active();
		if (is_wp_error($check)) {
			return $check;
		}

		$refresh_token = trim((string) $request->get_param('refresh_token'));
		if (empty($refresh_token)) {
			return new WP_Error('storesdk_jwt.refresh_missing', __('Missing refresh token', 'store-sdk'), array('status' => 400));
		}

		// Resolve user context
		$user = null;
		$auth_header = $this->auth->get_authorization_header();
		
		if ($auth_header && preg_match('/^Bearer\s+(.*)$/i', $auth_header, $matches)) {
			// Accept expired access tokens during refresh
			$maybe_payload = $this->jwt->decode(trim($matches[1]), array('ignore_exp' => true));
			if (!is_wp_error($maybe_payload) && !empty($maybe_payload['sub'])) {
				$user = get_user_by('id', (int) $maybe_payload['sub']);
			}
		}
		
		if (!$user && is_user_logged_in()) {
			$user = wp_get_current_user();
		}
		
		if (!$user) {
			return new WP_Error('storesdk_jwt.refresh_context', __('Cannot resolve user for refresh. Provide Authorization header with previous access token.', 'store-sdk'), array('status' => 401));
		}

		// Consume refresh token
		$consume_result = $this->jwt->consume_refresh_token($user->ID, $refresh_token);
		if (is_wp_error($consume_result)) {
			return $consume_result;
		}

		// Create new access token
		$issued_at = time();
		$expires_at = $issued_at + $this->jwt->get_default_expiration();

		$payload = array(
			'iss'   => get_site_url(),
			'aud'   => get_site_url(),
			'iat'   => $issued_at,
			'nbf'   => $issued_at - 5,
			'exp'   => $expires_at,
			'sub'   => $user->ID,
			'login' => $user->user_login,
			'email' => $user->user_email,
			'jti'   => $this->jwt->generate_jti(),
			'ver'   => $this->jwt->get_user_token_version($user->ID),
		);

		$access_token = $this->jwt->encode($payload);
		$refresh_ttl = defined('STORESDK_JWT_REFRESH_TTL') ? (int) STORESDK_JWT_REFRESH_TTL : 60 * 60 * 24 * 14;
		$new_refresh = $this->jwt->issue_refresh_token($user->ID, $refresh_ttl);

		return new WP_REST_Response(array(
			'token'              => $access_token,
			'token_type'         => 'Bearer',
			'expires_in'         => $expires_at - time(),
			'refresh_token'      => $new_refresh['token'],
			'refresh_expires_in' => $new_refresh['expires_in'],
			'user'               => array(
				'id'           => $user->ID,
				'login'        => $user->user_login,
				'email'        => $user->user_email,
				'display_name' => $user->display_name
			)
		));
	}

	/**
	 * Issue one-time token.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function issue_one_time_token(WP_REST_Request $request) {
		$check = $this->check_plugin_active();
		if (is_wp_error($check)) {
			return $check;
		}

		if (!is_user_logged_in()) {
			return new WP_Error('storesdk_jwt.not_authenticated', __('Authentication required', 'store-sdk'), array('status' => 401));
		}

		$user = wp_get_current_user();
		if (!$user || !$user->ID) {
			return new WP_Error('storesdk_jwt.user_not_found', __('User context unavailable', 'store-sdk'), array('status' => 500));
		}

		$ttl = (int) $request->get_param('ttl');
		if ($ttl <= 0) {
			$ttl = defined('STORESDK_JWT_ONE_TIME_TTL') ? (int) STORESDK_JWT_ONE_TIME_TTL : 300;
		}

		$min_ttl = defined('STORESDK_JWT_ONE_TIME_MIN_TTL') ? (int) STORESDK_JWT_ONE_TIME_MIN_TTL : 30;
		$max_ttl = defined('STORESDK_JWT_ONE_TIME_MAX_TTL') ? (int) STORESDK_JWT_ONE_TIME_MAX_TTL : 900;
		$ttl = max($min_ttl, min($max_ttl, $ttl));

		$issued_at = time();
		$expires_at = $issued_at + $ttl;
		$jti = $this->jwt->generate_jti();

		$payload = array(
			'iss'      => get_site_url(),
			'aud'      => get_site_url(),
			'iat'      => $issued_at,
			'nbf'      => $issued_at - 5,
			'exp'      => $expires_at,
			'sub'      => $user->ID,
			'login'    => $user->user_login,
			'one_time' => true,
			'jti'      => $jti,
			'ver'      => $this->jwt->get_user_token_version($user->ID),
		);

		$token = $this->jwt->encode($payload);
		set_transient('storesdk_jti_' . $jti, 'valid', $ttl);

		return new WP_REST_Response(array(
			'one_time_token' => $token,
			'expires_in' => $expires_at - time()
		));
	}

	/**
	 * Autologin with one-time token.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function autologin(WP_REST_Request $request) {
		$check = $this->check_plugin_active();
		if (is_wp_error($check)) {
			return $check;
		}

		$token = trim((string) $request->get_param('token'));
		$redirect = $request->get_param('redirect');

		if (empty($token)) {
			return new WP_Error('storesdk_jwt.missing_token', __('Missing token', 'store-sdk'), array('status' => 400));
		}

		$payload = $this->jwt->decode($token);
		if (is_wp_error($payload)) {
			return $payload;
		}

		if (empty($payload['sub'])) {
			return new WP_Error('storesdk_jwt.missing_sub', __('Token missing subject', 'store-sdk'), array('status' => 401));
		}

		$requires_one_time = defined('STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN') && STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN;
		if ($requires_one_time && empty($payload['one_time'])) {
			return new WP_Error('storesdk_jwt.not_one_time', __('Autologin requires a one-time token', 'store-sdk'), array('status' => 401));
		}

		if (empty($payload['jti'])) {
			return new WP_Error('storesdk_jwt.jti_missing', __('One-time token missing jti', 'store-sdk'), array('status' => 400));
		}

		// Validate and consume JTI
		$jti_key = 'storesdk_jti_' . sanitize_key($payload['jti']);
		$marker = get_transient($jti_key);
		if ($marker !== 'valid') {
			return new WP_Error('storesdk_jwt.one_time_invalid', __('One-time token already used or expired', 'store-sdk'), array('status' => 401));
		}
		delete_transient($jti_key);

		$user = get_user_by('id', (int) $payload['sub']);
		if (!$user) {
			return new WP_Error('storesdk_jwt.user_not_found', __('User not found', 'store-sdk'), array('status' => 404));
		}

		// Log in user
		wp_set_current_user($user->ID);
		wp_set_auth_cookie($user->ID, false);
		do_action('wp_login', $user->user_login, $user);

		$safe_redirect = $redirect ? $this->sanitize_redirect($redirect) : null;

		// Handle GET request with redirect
		if ('GET' === $request->get_method() && $safe_redirect && !wp_is_json_request()) {
			wp_safe_redirect($safe_redirect);
			exit;
		}

		return new WP_REST_Response(array(
			'login'    => 'success',
			'user'     => array(
				'id'           => $user->ID,
				'login'        => $user->user_login,
				'email'        => $user->user_email,
				'display_name' => $user->display_name
			),
			'redirect' => $safe_redirect
		));
	}

	/**
	 * Validate JWT token.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function validate_token(WP_REST_Request $request) {
		$header = $this->auth->get_authorization_header();
		if (!$header || !preg_match('/^Bearer\s+(.*)$/i', $header, $matches)) {
			return new WP_Error('storesdk_jwt.missing_token', __('Missing bearer token', 'store-sdk'), array('status' => 400));
		}

		$payload = $this->jwt->decode($matches[1]);
		if (is_wp_error($payload)) {
			return $payload;
		}

		// Check token version
		if (!empty($payload['sub'])) {
			$user = get_user_by('id', (int) $payload['sub']);
			if ($user) {
				$current_version = $this->jwt->get_user_token_version($user->ID);
				if ($current_version > 1 && (empty($payload['ver']) || (int) $payload['ver'] !== $current_version)) {
					return new WP_Error('storesdk_jwt.version_mismatch', __('Token revoked', 'store-sdk'), array('status' => 400));
				}
			}
		}

		return new WP_REST_Response(array(
			'valid' => true,
			'payload' => $payload
		));
	}

	/**
	 * Revoke tokens.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function revoke_tokens(WP_REST_Request $request) {
		$check = $this->check_plugin_active();
		if (is_wp_error($check)) {
			return $check;
		}

		$scope = $request->get_param('scope');
		if (!$scope) {
			$scope = 'all';
		}

		$user = null;
		if (is_user_logged_in()) {
			$user = wp_get_current_user();
		}
		if (!$user) {
			$user = $this->auth->get_current_user_from_bearer();
		}

		if (!$user || !$user->ID) {
			return new WP_Error('storesdk_jwt.revoke_auth', __('Authentication required', 'store-sdk'), array('status' => 401));
		}

		// Clear refresh tokens
		update_user_meta($user->ID, 'storesdk_refresh_tokens', array());

		$new_version = $this->jwt->get_user_token_version($user->ID);
		if ($scope !== 'refresh') {
			$new_version = $this->jwt->bump_user_token_version($user->ID);
		}

		return new WP_REST_Response(array(
			'revoked' => true,
			'scope' => $scope,
			'new_version' => $new_version
		));
	}

	/**
	 * Get plugin status.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_status(WP_REST_Request $request) {
		$flag_defined = defined('STORESDK_JWT_ENABLED');
		$flag_enabled = $flag_defined && (bool) (STORESDK_JWT_ENABLED);
		$secret_defined = defined('STORESDK_JWT_SECRET') && !empty(constant('STORESDK_JWT_SECRET')) && strtolower(constant('STORESDK_JWT_SECRET')) !== 'change_me';

		$inactive_reason = '';
		if (!$flag_defined) {
			$inactive_reason = 'missing_flag';
		} elseif ($flag_defined && !$flag_enabled) {
			$inactive_reason = 'disabled_flag';
		} elseif ($flag_enabled && !$secret_defined) {
			$inactive_reason = 'missing_secret';
		}

		$active = $flag_enabled && $secret_defined;
		$expected_endpoints = array('token', 'refresh', 'one-time-token', 'autologin', 'validate', 'revoke');
		$endpoints = array();
		foreach ($expected_endpoints as $endpoint) {
			$endpoints[$endpoint] = $active;
		}

		$secret_length = $secret_defined ? strlen(constant('STORESDK_JWT_SECRET')) : 0;
		$force_auth_defined = defined('STORESDK_JWT_FORCE_AUTH_ENDPOINTS');
		$force_auth_value = $force_auth_defined ? (string) constant('STORESDK_JWT_FORCE_AUTH_ENDPOINTS') : '';

		return new WP_REST_Response(array(
			'active'             => $active,
			'flag_defined'       => $flag_defined,
			'flag_enabled'       => $flag_enabled,
			'secret_defined'     => $secret_defined,
			'secret_length'      => $secret_length,
			'inactive_reason'    => $active ? null : $inactive_reason,
			'endpoints'          => $endpoints,
			'version'            => defined('STORESDK_JWT_AUTH_VERSION') ? STORESDK_JWT_AUTH_VERSION : '1.0.0',
			'timestamp'          => time(),
			'force_auth_defined' => $force_auth_defined,
			'force_auth_value'   => $force_auth_value,
		));
	}

	/**
	 * Debug route information.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function debug_route(WP_REST_Request $request) {
		$route_path = $this->auth->get_current_route_path();
		$requires_auth = $this->auth->endpoint_requires_auth($route_path);
		$force_auth_constant = defined('STORESDK_JWT_FORCE_AUTH_ENDPOINTS') ? (string) constant('STORESDK_JWT_FORCE_AUTH_ENDPOINTS') : 'NOT_DEFINED';

		return new WP_REST_Response(array(
			'current_route' => $route_path,
			'requires_auth' => $requires_auth,
			'force_auth_constant' => $force_auth_constant,
			'server_uri' => isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : 'not_set',
			'get_params' => $_GET,
		));
	}

	/**
	 * Debug status.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function debug_status(WP_REST_Request $request) {
		$force_auth_defined = defined('STORESDK_JWT_FORCE_AUTH_ENDPOINTS');
		$force_auth_value = $force_auth_defined ? (string) constant('STORESDK_JWT_FORCE_AUTH_ENDPOINTS') : '';

		return new WP_REST_Response(array(
			'force_auth_defined' => $force_auth_defined,
			'force_auth_value' => $force_auth_value,
			'plugin_version' => defined('STORESDK_JWT_AUTH_VERSION') ? STORESDK_JWT_AUTH_VERSION : '1.0.0',
			'timestamp' => time(),
		));
	}

	/**
	 * Test cart protected endpoint.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function test_cart_protected(WP_REST_Request $request) {
		// Mock WooCommerce cart response for testing
		return new WP_REST_Response(array(
			'coupons' => array(),
			'shipping_rates' => array(),
			'shipping_address' => array(),
			'billing_address' => array(),
			'items' => array(),
			'items_count' => 0,
			'items_weight' => 0,
			'cross_sells' => array(),
			'needs_payment' => false,
			'needs_shipping' => false,
			'has_calculated_shipping' => false,
			'fees' => array(),
			'taxes' => array(),
			'tax_lines' => array(),
			'totals' => array(
				'total_items' => '0',
				'total_items_tax' => '0',
				'total_fees' => '0',
				'total_fees_tax' => '0',
				'total_discount' => '0',
				'total_discount_tax' => '0',
				'total_shipping' => '0',
				'total_shipping_tax' => '0',
				'total_tax' => '0',
				'total_price' => '0',
				'currency_code' => 'USD',
				'currency_symbol' => '$',
				'currency_minor_unit' => 2,
				'currency_decimal_separator' => '.',
				'currency_thousand_separator' => ',',
				'currency_prefix' => '$',
				'currency_suffix' => ''
			),
			'errors' => array(),
			'payment_methods' => array(),
			'payment_requirements' => array(),
			'extensions' => array()
		));
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