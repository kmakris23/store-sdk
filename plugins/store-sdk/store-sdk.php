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
if (!defined('ABSPATH')) {
	exit;
}
if (!defined('STORESDK_JWT_AUTH_VERSION')) {
	define('STORESDK_JWT_AUTH_VERSION', '1.0.0');
}

$storesdk_flag_defined = defined('STORESDK_JWT_ENABLED');
$storesdk_flag_enabled = $storesdk_flag_defined ? (bool)STORESDK_JWT_ENABLED : true;
$storesdk_secret_defined = defined('STORESDK_JWT_SECRET') && ($__sv = (string)constant('STORESDK_JWT_SECRET')) !== '' && strtolower($__sv) !== 'change_me';
$storesdk_jwt_inactive_reason = '';
if ($storesdk_flag_defined && !$storesdk_flag_enabled) {
	$storesdk_jwt_inactive_reason = 'disabled_flag';
} elseif ($storesdk_flag_enabled && !$storesdk_secret_defined) {
	$storesdk_jwt_inactive_reason = 'missing_secret';
}
if (!defined('STORESDK_JWT_PLUGIN_ACTIVE')) {
	define('STORESDK_JWT_PLUGIN_ACTIVE', $storesdk_flag_enabled && $storesdk_secret_defined);
}

// --- Admin Notice (refactored) -------------------------------------------------
if (!function_exists('storesdk_jwt_render_admin_notice')) {
	function storesdk_jwt_render_admin_notice() {
		if (!current_user_can('manage_options')) return;

		$flag_defined = defined('STORESDK_JWT_ENABLED');
		$flag_enabled = $flag_defined && (bool)STORESDK_JWT_ENABLED;
		$secret_defined = defined('STORESDK_JWT_SECRET') && ($__sv = (string)constant('STORESDK_JWT_SECRET')) !== '' && strtolower($__sv) !== 'change_me';
		$active = defined('STORESDK_JWT_PLUGIN_ACTIVE') ? STORESDK_JWT_PLUGIN_ACTIVE : false;
		$debug_force = defined('STORESDK_JWT_DEBUG_SHOW_NOTICE') && STORESDK_JWT_DEBUG_SHOW_NOTICE;

		// Show if inactive (missing flag, secret, or disabled) OR debug force.
		$should_show = $debug_force || (!$active || ($flag_defined && !$flag_enabled) || !$secret_defined || !$flag_defined);
		// Allow external override
		if (function_exists('apply_filters')) {
			$should_show = apply_filters('storesdk_jwt_show_admin_notice', $should_show, [
				'flag_defined' => $flag_defined,
				'flag_enabled' => $flag_enabled,
				'secret_defined' => $secret_defined,
				'active' => $active,
				'debug_force' => $debug_force,
			]);
		}
		if (!$should_show) return;

		$steps = [];
		if (!$flag_defined) {
			$steps[] = 'Required: Add <code>define(\'STORESDK_JWT_ENABLED\', true);</code>.';
		}
		if (!$secret_defined) {
			$steps[] = 'Required: Add <code>define(\'STORESDK_JWT_SECRET\', \'REPLACE_WITH_RANDOM_48_CHARS\');</code>.';
		}
		// If everything is actually active and not debug forced, bail (safety net)
		if (empty($steps) && !$debug_force) return;

		$title = __('Store SDK authentication configuration', 'store-sdk');
		echo '<div class="notice notice-error"><p><strong>' . esc_html($title) . '</strong></p><ul style="margin-left:20px;list-style:disc;">';
		foreach ($steps as $s) {
			echo '<li>' . (strpos($s, '<code>') !== false ? $s : esc_html($s)) . '</li>';
		}
		echo '</ul></div>';
	}
	add_action('admin_notices', 'storesdk_jwt_render_admin_notice');
	add_action('network_admin_notices', 'storesdk_jwt_render_admin_notice');
	add_action('user_admin_notices', 'storesdk_jwt_render_admin_notice');
}
// -------------------------------------------------------------------------------

// Defaults
if (!defined('STORESDK_JWT_ACCESS_TTL')) define('STORESDK_JWT_ACCESS_TTL', 3600);
if (!defined('STORESDK_JWT_REFRESH_DEFAULT_TTL')) define('STORESDK_JWT_REFRESH_DEFAULT_TTL', 60 * 60 * 24 * 14);
if (!defined('STORESDK_JWT_REFRESH_MIN_TTL')) define('STORESDK_JWT_REFRESH_MIN_TTL', 60 * 60 * 24);
if (!defined('STORESDK_JWT_REFRESH_MAX_TTL')) define('STORESDK_JWT_REFRESH_MAX_TTL', 60 * 60 * 24 * 30);
if (!defined('STORESDK_JWT_ONE_TIME_DEFAULT_TTL')) define('STORESDK_JWT_ONE_TIME_DEFAULT_TTL', 300);
if (!defined('STORESDK_JWT_ONE_TIME_MIN_TTL')) define('STORESDK_JWT_ONE_TIME_MIN_TTL', 30);
if (!defined('STORESDK_JWT_ONE_TIME_MAX_TTL')) define('STORESDK_JWT_ONE_TIME_MAX_TTL', 900);
if (!defined('STORESDK_JWT_REFRESH_MAX_TOKENS')) define('STORESDK_JWT_REFRESH_MAX_TOKENS', 10);
if (!defined('STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN')) define('STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN', true);
if (!defined('STORESDK_JWT_ENABLE_FRONT_CHANNEL')) define('STORESDK_JWT_ENABLE_FRONT_CHANNEL', true);
if (!defined('STORESDK_JWT_ERROR_ON_INVALID_BEARER')) define('STORESDK_JWT_ERROR_ON_INVALID_BEARER', false);

function storesdk_jwt_default_expiration()
{
	return (int)STORESDK_JWT_ACCESS_TTL;
}
function storesdk_base64url_encode($d)
{
	return rtrim(strtr(base64_encode($d), '+/', '-_'), '=');
}
function storesdk_base64url_decode($d)
{
	$r = strlen($d) % 4;
	if ($r) {
		$d .= str_repeat('=', 4 - $r);
	}
	return base64_decode(strtr($d, '-_', '+/'));
}
function storesdk_jwt_sign($hp)
{
	return storesdk_base64url_encode(hash_hmac('sha256', $hp, STORESDK_JWT_SECRET, true));
}
function storesdk_jwt_encode(array $p)
{
	$h = ['typ' => 'JWT', 'alg' => 'HS256'];
	$segs = [storesdk_base64url_encode(json_encode($h)), storesdk_base64url_encode(json_encode($p))];
	$sig = storesdk_jwt_sign(implode('.', $segs));
	$segs[] = $sig;
	return implode('.', $segs);
}
function storesdk_jwt_decode($t, $opts = [])
{
	$parts = explode('.', $t);
	if (count($parts) !== 3) {
		return new WP_Error('storesdk_jwt.malformed', 'Malformed JWT');
	}
	list($h64, $p64, $s) = $parts;
	$h = json_decode(storesdk_base64url_decode($h64), true);
	$p = json_decode(storesdk_base64url_decode($p64), true);
	if (empty($h) || empty($p) || !is_array($h) || !is_array($p)) {
		return new WP_Error('storesdk_jwt.invalid_json', 'Invalid JWT JSON');
	}
	$expSig = storesdk_jwt_sign($h64 . '.' . $p64);
	if (!hash_equals($expSig, $s)) {
		return new WP_Error('storesdk_jwt.bad_signature', 'Invalid JWT signature');
	}
	$now = time();
	$ignore_exp = !empty($opts['ignore_exp']);
	if (isset($p['nbf']) && $p['nbf'] > $now + 30) {
		return new WP_Error('storesdk_jwt.nbf', 'Token not yet valid');
	}
	if (isset($p['iat']) && $p['iat'] > $now + 30) {
		return new WP_Error('storesdk_jwt.iat', 'Token issued in the future');
	}
	if (isset($p['exp']) && !$ignore_exp && $p['exp'] < $now) {
		return new WP_Error('storesdk_jwt.expired', 'Token expired');
	}
	return $p;
}

function storesdk_jwt_plugin_active() {
	return defined('STORESDK_JWT_PLUGIN_ACTIVE') && STORESDK_JWT_PLUGIN_ACTIVE;
}

add_action('rest_api_init', function () {
	// Register routes unconditionally so tests don't miss them if activation check timing differs
	register_rest_route('store-sdk/v1/auth', '/token', [
		'methods'  => 'POST',
		'permission_callback' => '__return_true',
		'callback' => function (WP_REST_Request $r) {
			if (!storesdk_jwt_plugin_active()) {
				return new WP_Error('storesdk_jwt.inactive', __('Store SDK JWT authentication inactive', 'store-sdk'), ['status' => 400]);
			}
			return storesdk_rest_issue_token($r);
		},
		'args' => [
			'login' => ['required' => true],
			'password' => ['required' => true],
			'refresh_ttl' => ['required' => false],
		],
	]);
	register_rest_route('store-sdk/v1/auth', '/autologin', [
		'methods' => 'POST,GET',
		'permission_callback' => '__return_true',
		'callback' => function (WP_REST_Request $r) {
			if (!storesdk_jwt_plugin_active()) {
				return new WP_Error('storesdk_jwt.inactive', __('Store SDK JWT authentication inactive', 'store-sdk'), ['status' => 400]);
			}
			return storesdk_rest_autologin($r);
		},
		'args' => [
			'token' => ['required' => true],
			'redirect' => ['required' => false],
		],
	]);
	register_rest_route('store-sdk/v1/auth', '/one-time-token', [
		'methods' => 'POST',
		'permission_callback' => function () { return is_user_logged_in(); },
		'callback' => function (WP_REST_Request $r) {
			if (!storesdk_jwt_plugin_active()) {
				return new WP_Error('storesdk_jwt.inactive', __('Store SDK JWT authentication inactive', 'store-sdk'), ['status' => 400]);
			}
			return storesdk_rest_one_time_token($r);
		},
		'args' => [ 'ttl' => ['required' => false] ],
	]);
	register_rest_route('store-sdk/v1/auth', '/refresh', [
		'methods' => 'POST',
		'permission_callback' => '__return_true',
		'callback' => function (WP_REST_Request $r) {
			if (!storesdk_jwt_plugin_active()) {
				return new WP_Error('storesdk_jwt.inactive', __('Store SDK JWT authentication inactive', 'store-sdk'), ['status' => 400]);
			}
			return storesdk_rest_refresh_token($r);
		},
		'args' => [ 'refresh_token' => ['required' => true] ],
	]);
	register_rest_route('store-sdk/v1/auth', '/revoke', [
		'methods' => 'POST',
		'permission_callback' => function () { return is_user_logged_in() || storesdk_current_user_from_bearer(); },
		'callback' => function (WP_REST_Request $r) {
			if (!storesdk_jwt_plugin_active()) {
				return new WP_Error('storesdk_jwt.inactive', __('Store SDK JWT authentication inactive', 'store-sdk'), ['status' => 400]);
			}
			return storesdk_rest_revoke_tokens($r);
		},
		'args' => [ 'scope' => ['required' => false] ],
	]);
});

function storesdk_get_token_version($uid)
{
	$v = get_user_meta($uid, 'storesdk_token_version', true);
	if (!$v || !is_numeric($v)) {
		return 1;
	}
	return (int)$v;
}
function storesdk_bump_token_version($uid)
{
	$v = storesdk_get_token_version($uid) + 1;
	update_user_meta($uid, 'storesdk_token_version', $v);
	return $v;
}
function storesdk_current_user_from_bearer()
{
	$h = storesdk_get_authorization_header();
	if (!$h || !preg_match('/^Bearer\s+(.*)$/i', $h, $m)) return false;
	$p = storesdk_jwt_decode(trim($m[1]));
	if (is_wp_error($p) || empty($p['sub'])) return false;
	$u = get_user_by('id', (int)$p['sub']);
	if (!$u) return false;
	return $u;
}

function storesdk_rest_issue_token(WP_REST_Request $r)
{
	$login = trim($r->get_param('login'));
	$pw = (string)$r->get_param('password');
	if ($login === '' || $pw === '') {
		return new WP_Error('storesdk_jwt.missing_credentials', __('Missing login or password', 'store-sdk'), ['status' => 400]);
	}
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
		return new WP_Error('storesdk_jwt.invalid_credentials', __('Invalid credentials', 'store-sdk'), ['status' => 403]);
	}
	if (!wp_check_password($pw, $user->user_pass, $user->ID)) {
		return new WP_Error('storesdk_jwt.invalid_credentials', __('Invalid credentials', 'store-sdk'), ['status' => 403]);
	}
	$iat = time();
	$exp = $iat + storesdk_jwt_default_expiration();
	$payload = [
		'iss' => get_site_url(),
		'iat' => $iat,
		'nbf' => $iat - 5,
		'exp' => $exp,
		'sub' => $user->ID,
		'login' => $user->user_login,
		'email' => $user->user_email,
		// include unique identifier to ensure token rotation uniqueness
		'jti' => storesdk_jwt_generate_jti(),
		'ver' => storesdk_get_token_version($user->ID),
	];
	$token = storesdk_jwt_encode($payload);
	$refreshTtl = (int)$r->get_param('refresh_ttl');
	if ($refreshTtl <= 0) {
		$refreshTtl = (int)STORESDK_JWT_REFRESH_DEFAULT_TTL;
	}
	if ($refreshTtl < (int)STORESDK_JWT_REFRESH_MIN_TTL) {
		$refreshTtl = (int)STORESDK_JWT_REFRESH_MIN_TTL;
	}
	if ($refreshTtl > (int)STORESDK_JWT_REFRESH_MAX_TTL) {
		$refreshTtl = (int)STORESDK_JWT_REFRESH_MAX_TTL;
	}
	$refresh = storesdk_issue_refresh_token($user->ID, $refreshTtl);
	return new WP_REST_Response(['token' => $token, 'token_type' => 'Bearer', 'expires_in' => $exp - time(), 'refresh_token' => $refresh['token'], 'refresh_expires_in' => $refresh['expires_in'], 'user' => ['id' => $user->ID, 'login' => $user->user_login, 'email' => $user->user_email, 'display_name' => $user->display_name]]);
}

function storesdk_issue_refresh_token($uid, $ttl)
{
	$raw = storesdk_random_token();
	$now = time();
	$exp = $now + $ttl;
	$hash = storesdk_hash_refresh_token($raw);
	$list = get_user_meta($uid, 'storesdk_refresh_tokens', true);
	if (!is_array($list)) {
		$list = [];
	}
	$list[] = ['hash' => $hash, 'exp' => $exp];
	$list = array_values(array_filter($list, function ($t) use ($now) {
		return !empty($t['exp']) && $t['exp'] > $now;
	}));
	if (defined('STORESDK_JWT_REFRESH_MAX_TOKENS') && STORESDK_JWT_REFRESH_MAX_TOKENS > 0) {
		$excess = count($list) - (int)STORESDK_JWT_REFRESH_MAX_TOKENS;
		if ($excess > 0) {
			$list = array_slice($list, $excess);
		}
	}
	update_user_meta($uid, 'storesdk_refresh_tokens', $list);
	return ['token' => $raw, 'expires_in' => $exp - $now];
}
function storesdk_random_token()
{
	try {
		return bin2hex(random_bytes(32));
	} catch (Exception $e) {
		return wp_hash(uniqid('storesdk_refresh_', true));
	}
}
function storesdk_hash_refresh_token($raw)
{
	return hash_hmac('sha256', $raw, STORESDK_JWT_SECRET);
}
function storesdk_consume_refresh_token($uid, $raw)
{
	$hash = storesdk_hash_refresh_token($raw);
	$list = get_user_meta($uid, 'storesdk_refresh_tokens', true);
	if (!is_array($list) || empty($list)) return new WP_Error('storesdk_jwt.refresh_invalid', __('Invalid refresh token', 'store-sdk'), ['status' => 401]);
	$now = time();
	$found = false;
	$remain = [];
	foreach ($list as $e) {
		if (empty($e['hash']) || empty($e['exp'])) continue;
		if ($e['hash'] === $hash) {
			if ($e['exp'] < $now) {
				return new WP_Error('storesdk_jwt.refresh_expired', __('Refresh token expired', 'store-sdk'), ['status' => 401]);
			}
			$found = true;
			continue;
		}
		if ($e['exp'] > $now) {
			$remain[] = $e;
		}
	}
	update_user_meta($uid, 'storesdk_refresh_tokens', $remain);
	if (!$found) {
		return new WP_Error('storesdk_jwt.refresh_invalid', __('Invalid refresh token', 'store-sdk'), ['status' => 401]);
	}
	return true;
}
function storesdk_rest_refresh_token(WP_REST_Request $r)
{
	$refresh = trim((string)$r->get_param('refresh_token'));
	if ($refresh === '') {
		return new WP_Error('storesdk_jwt.refresh_missing', __('Missing refresh token', 'store-sdk'), ['status' => 400]);
	}
	$auth = storesdk_get_authorization_header();
	$user = null;
	if ($auth && preg_match('/^Bearer\s+(.*)$/i', $auth, $m)) {
		// Accept expired access tokens during refresh, but still verify signature
		$maybe = storesdk_jwt_decode(trim($m[1]), ['ignore_exp' => true]);
		if (!is_wp_error($maybe) && !empty($maybe['sub'])) {
			$user = get_user_by('id', (int)$maybe['sub']);
		}
	}
	if (!$user && is_user_logged_in()) {
		$user = wp_get_current_user();
	}
	if (!$user) {
		return new WP_Error('storesdk_jwt.refresh_context', __('Cannot resolve user for refresh. Provide Authorization header with previous access token.', 'store-sdk'), ['status' => 401]);
	}
	$consume = storesdk_consume_refresh_token($user->ID, $refresh);
	if (is_wp_error($consume)) {
		return $consume;
	}
	$iat = time();
	$exp = $iat + storesdk_jwt_default_expiration();
	$payload = [
		'iss' => get_site_url(),
		'iat' => $iat,
		'nbf' => $iat - 5,
		'exp' => $exp,
		'sub' => $user->ID,
		'login' => $user->user_login,
		'email' => $user->user_email,
		// rotate with a new unique identifier
		'jti' => storesdk_jwt_generate_jti(),
		'ver' => storesdk_get_token_version($user->ID),
	];
	$access = storesdk_jwt_encode($payload);
	$rot = storesdk_issue_refresh_token($user->ID, (int)STORESDK_JWT_REFRESH_DEFAULT_TTL);
	return new WP_REST_Response(['token' => $access, 'token_type' => 'Bearer', 'expires_in' => $exp - time(), 'refresh_token' => $rot['token'], 'refresh_expires_in' => $rot['expires_in'], 'user' => ['id' => $user->ID, 'login' => $user->user_login, 'email' => $user->user_email, 'display_name' => $user->display_name]]);
}

function storesdk_rest_one_time_token(WP_REST_Request $r)
{
	if (!is_user_logged_in()) {
		return new WP_Error('storesdk_jwt.not_authenticated', __('Authentication required', 'store-sdk'), ['status' => 401]);
	}
	$user = wp_get_current_user();
	if (!$user || !$user->ID) {
		return new WP_Error('storesdk_jwt.user_not_found', __('User context unavailable', 'store-sdk'), ['status' => 500]);
	}
	$ttl = (int)$r->get_param('ttl');
	if ($ttl <= 0) {
		$ttl = (int)STORESDK_JWT_ONE_TIME_DEFAULT_TTL;
	}
	if ($ttl < (int)STORESDK_JWT_ONE_TIME_MIN_TTL) {
		$ttl = (int)STORESDK_JWT_ONE_TIME_MIN_TTL;
	}
	if ($ttl > (int)STORESDK_JWT_ONE_TIME_MAX_TTL) {
		$ttl = (int)STORESDK_JWT_ONE_TIME_MAX_TTL;
	}
	$iat = time();
	$exp = $iat + $ttl;
	$jti = storesdk_jwt_generate_jti();
	$payload = ['iss' => get_site_url(), 'iat' => $iat, 'nbf' => $iat - 5, 'exp' => $exp, 'sub' => $user->ID, 'login' => $user->user_login, 'one_time' => true, 'jti' => $jti, 'ver' => storesdk_get_token_version($user->ID)];
	$token = storesdk_jwt_encode($payload);
	set_transient('storesdk_jti_' . $jti, 'valid', $ttl);
	return new WP_REST_Response(['one_time_token' => $token, 'expires_in' => $exp - time()]);
}
function storesdk_jwt_generate_jti()
{
	try {
		return bin2hex(random_bytes(16));
	} catch (Exception $e) {
		return wp_hash(uniqid('storesdk_jti_', true));
	}
}

function storesdk_rest_autologin(WP_REST_Request $r)
{
	$token = trim((string)$r->get_param('token'));
	$redirect = $r->get_param('redirect');
	if ($token === '') {
		return new WP_Error('storesdk_jwt.missing_token', __('Missing token', 'store-sdk'), ['status' => 400]);
	}
	$payload = storesdk_jwt_decode($token);
	if (is_wp_error($payload)) {
		return $payload;
	}
	if (empty($payload['sub'])) {
		return new WP_Error('storesdk_jwt.missing_sub', __('Token missing subject', 'store-sdk'), ['status' => 401]);
	}
	if (STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN && empty($payload['one_time'])) {
		return new WP_Error('storesdk_jwt.not_one_time', __('Autologin requires a one-time token', 'store-sdk'), ['status' => 401]);
	}
	if (empty($payload['jti'])) {
		return new WP_Error('storesdk_jwt.jti_missing', __('One-time token missing jti', 'store-sdk'), ['status' => 400]);
	}
	$tk = 'storesdk_jti_' . sanitize_key($payload['jti']);
	$marker = get_transient($tk);
	if ($marker !== 'valid') {
		return new WP_Error('storesdk_jwt.one_time_invalid', __('One-time token already used or expired', 'store-sdk'), ['status' => 401]);
	}
	delete_transient($tk);
	$user = get_user_by('id', (int)$payload['sub']);
	if (!$user) {
		return new WP_Error('storesdk_jwt.user_not_found', __('User not found', 'store-sdk'), ['status' => 404]);
	}
	wp_set_current_user($user->ID);
	wp_set_auth_cookie($user->ID, false);
	do_action('wp_login', $user->user_login, $user);
	$safe = $redirect ? storesdk_jwt_sanitize_redirect($redirect) : null;
	if ('GET' === $r->get_method() && $safe && !wp_is_json_request()) {
		wp_safe_redirect($safe);
		exit;
	}
	return new WP_REST_Response(['login' => 'success', 'user' => ['id' => $user->ID, 'login' => $user->user_login, 'email' => $user->user_email, 'display_name' => $user->display_name], 'redirect' => $safe]);
}
function storesdk_jwt_sanitize_redirect($url)
{
	if (!$url) return null;
	$url = trim($url);
	if (strpos($url, 'http://') !== 0 && strpos($url, 'https://') !== 0) {
		if (substr($url, 0, 1) !== '/') {
			$url = '/' . $url;
		}
		return $url;
	}
	$host = parse_url(home_url(), PHP_URL_HOST);
	$h2 = parse_url($url, PHP_URL_HOST);
	if ($host && $h2 && strtolower($host) === strtolower($h2)) {
		return $url;
	}
	return null;
}

if (STORESDK_JWT_PLUGIN_ACTIVE) add_filter('determine_current_user', function ($user_id) {
	$header = storesdk_get_authorization_header();
	if (!$header) {
		return $user_id;
	}
	if (!preg_match('/^Bearer\s+(.*)$/i', $header, $m)) {
		return $user_id;
	}
	$token = trim($m[1]);
	if ($token === '') {
		return $user_id;
	}
	$payload = storesdk_jwt_decode($token);
	if (is_wp_error($payload)) {
		if (STORESDK_JWT_ERROR_ON_INVALID_BEARER) {
			global $storesdk_jwt_last_error;
			$errCode = $payload->get_error_code();
			$errMsg = $payload->get_error_message();
			$data = $payload->get_error_data();
			if (!is_array($data)) {
				$data = [];
			}
			if (empty($data['status'])) {
				$data['status'] = 401;
			}
			$storesdk_jwt_last_error = new WP_Error($errCode ?: 'storesdk_jwt.invalid_bearer', $errMsg ?: __('Invalid bearer token', 'store-sdk'), $data);
			return 0;
		}
		return $user_id;
	}
	if (empty($payload['sub'])) {
		return $user_id;
	}
	$jwt_user = get_user_by('id', (int)$payload['sub']);
	if (!$jwt_user) {
		return $user_id;
	}
	$currentVer = storesdk_get_token_version($jwt_user->ID);
	if ($currentVer > 1) {
		if (empty($payload['ver']) || (int)$payload['ver'] !== $currentVer) {
			return $user_id;
		}
	}
	return (int)$jwt_user->ID;
}, 50);

if (STORESDK_JWT_PLUGIN_ACTIVE) add_filter('rest_authentication_errors', function ($result) {
	if (!empty($result)) return $result;
	if (!STORESDK_JWT_ERROR_ON_INVALID_BEARER) return $result;
	global $storesdk_jwt_last_error;
	if ($storesdk_jwt_last_error instanceof WP_Error) {
		$err = $storesdk_jwt_last_error;
		$storesdk_jwt_last_error = null;
		return $err;
	}
	return $result;
});

function storesdk_get_authorization_header()
{
	if (isset($_SERVER['HTTP_AUTHORIZATION'])) return trim($_SERVER['HTTP_AUTHORIZATION']);
	if (function_exists('apache_request_headers')) {
		$headers = apache_request_headers();
		if (!empty($headers['Authorization'])) return trim($headers['Authorization']);
	}
	foreach (['REDIRECT_HTTP_AUTHORIZATION', 'HTTP_X_AUTHORIZATION', 'X-HTTP_AUTHORIZATION'] as $k) {
		if (!empty($_SERVER[$k])) return trim($_SERVER[$k]);
	}
	return null;
}

if (STORESDK_JWT_PLUGIN_ACTIVE) add_action('rest_api_init', function () {
	register_rest_route('store-sdk/v1/auth', '/validate', ['methods' => 'GET', 'callback' => function (WP_REST_Request $r) {
		$h = storesdk_get_authorization_header();
		if (!$h || !preg_match('/^Bearer\s+(.*)$/i', $h, $m)) {
			return new WP_Error('storesdk_jwt.missing_token', __('Missing bearer token', 'store-sdk'), ['status' => 400]);
		}
		$payload = storesdk_jwt_decode($m[1]);
		if (is_wp_error($payload)) return $payload;
		if (!empty($payload['sub'])) {
			$u = get_user_by('id', (int)$payload['sub']);
			if ($u) {
				$cur = storesdk_get_token_version($u->ID);
				if ($cur > 1 && (empty($payload['ver']) || (int)$payload['ver'] !== $cur)) {
					return new WP_Error('storesdk_jwt.version_mismatch', __('Token revoked', 'store-sdk'), ['status' => 400]);
				}
			}
		}
		return new WP_REST_Response(['valid' => true, 'payload' => $payload]);
	}, 'permission_callback' => '__return_true']);
});

function storesdk_rest_revoke_tokens(WP_REST_Request $r)
{
	$scope = $r->get_param('scope');
	if (!$scope) {
		$scope = 'all';
	}
	$user = null;
	if (is_user_logged_in()) {
		$user = wp_get_current_user();
	}
	if (!$user) {
		$user = storesdk_current_user_from_bearer();
	}
	if (!$user || !$user->ID) {
		return new WP_Error('storesdk_jwt.revoke_auth', __('Authentication required', 'store-sdk'), ['status' => 401]);
	}
	update_user_meta($user->ID, 'storesdk_refresh_tokens', []);
	$newVer = storesdk_get_token_version($user->ID);
	if ($scope !== 'refresh') {
		$newVer = storesdk_bump_token_version($user->ID);
	}
	return new WP_REST_Response(['revoked' => true, 'scope' => $scope, 'new_version' => $newVer]);
}

if (STORESDK_JWT_PLUGIN_ACTIVE) add_action('init', function () {
	if (!STORESDK_JWT_ENABLE_FRONT_CHANNEL) return;
	if (!isset($_GET['storesdk_autologin'])) return;
	$token = isset($_GET['token']) ? trim((string)$_GET['token']) : '';
	if ($token === '') return;
	$payload = storesdk_jwt_decode($token);
	if (is_wp_error($payload) || empty($payload['sub'])) return;
	if (STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN && (empty($payload['one_time']) || empty($payload['jti']))) return;
	$tk = 'storesdk_jti_' . sanitize_key($payload['jti']);
	$marker = get_transient($tk);
	if ($marker !== 'valid') return;
	delete_transient($tk);
	$user = get_user_by('id', (int)$payload['sub']);
	if (!$user) return;
	wp_set_current_user($user->ID);
	wp_set_auth_cookie($user->ID, false);
	do_action('wp_login', $user->user_login, $user);
	$redirect = isset($_GET['redirect']) ? storesdk_jwt_sanitize_redirect($_GET['redirect']) : null;
	if ($redirect) {
		wp_safe_redirect($redirect);
		exit;
	}
	wp_safe_redirect(home_url('/'));
	exit;
});

add_action('rest_api_init', function () {
	register_rest_route('store-sdk/v1/auth', '/status', ['methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => function () {
		$flag_defined = defined('STORESDK_JWT_ENABLED');
		$flag_enabled = $flag_defined && (bool)(STORESDK_JWT_ENABLED); // Align secret detection with admin notice logic (exclude placeholder 'change_me')
		$secret_defined = defined('STORESDK_JWT_SECRET') && ($__sv = (string)constant('STORESDK_JWT_SECRET')) !== '' && strtolower($__sv) !== 'change_me';
		$inactive = '';
		if (!$flag_defined) {
			$inactive = 'missing_flag';
		} elseif ($flag_defined && !$flag_enabled) {
			$inactive = 'disabled_flag';
		} elseif ($flag_enabled && !$secret_defined) {
			$inactive = 'missing_secret';
		}
		$active = $flag_enabled && $secret_defined;
		$expected = ['token', 'refresh', 'one-time-token', 'autologin', 'validate', 'revoke'];
		$endpoints = [];
		foreach ($expected as $e) {
			$endpoints[$e] = $active;
		}
		return new WP_REST_Response(['active' => $active, 'flag_defined' => $flag_defined, 'flag_enabled' => $flag_enabled, 'secret_defined' => $secret_defined, 'secret_length' => $secret_defined ? strlen(constant('STORESDK_JWT_SECRET')) : 0, 'inactive_reason' => $active ? null : $inactive, 'endpoints' => $endpoints, 'version' => STORESDK_JWT_AUTH_VERSION, 'timestamp' => time()]);
	}]);
});

do_action('storesdk_jwt_auth_loaded');

