<?php
/**
 * Store SDK JWT Utilities
 *
 * Handles JWT token encoding, decoding, and related utility functions.
 *
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Store SDK JWT Class.
 *
 * @class Store_SDK_JWT
 */
class Store_SDK_JWT {

	/**
	 * Constructor.
	 */
	public function __construct() {
		// JWT utilities are ready to use
	}

	/**
	 * Base64URL encode.
	 *
	 * @param string $data Data to encode.
	 * @return string
	 */
	public function base64url_encode($data) {
		return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
	}

	/**
	 * Base64URL decode.
	 *
	 * @param string $data Data to decode.
	 * @return string
	 */
	public function base64url_decode($data) {
		$remainder = strlen($data) % 4;
		if ($remainder) {
			$data .= str_repeat('=', 4 - $remainder);
		}
		return base64_decode(strtr($data, '-_', '+/'));
	}

	/**
	 * Sign JWT header and payload.
	 *
	 * @param string $header_payload Header and payload concatenated.
	 * @return string
	 */
	public function sign($header_payload) {
		if (!defined('STORESDK_JWT_SECRET')) {
			return '';
		}
		return $this->base64url_encode(hash_hmac('sha256', $header_payload, STORESDK_JWT_SECRET, true));
	}

	/**
	 * Encode JWT token.
	 *
	 * @param array $payload JWT payload.
	 * @return string
	 */
	public function encode(array $payload) {
		$header = array('typ' => 'JWT', 'alg' => 'HS256');
		$segments = array(
			$this->base64url_encode(json_encode($header)),
			$this->base64url_encode(json_encode($payload))
		);
		$signing_input = implode('.', $segments);
		$signature = $this->sign($signing_input);
		$segments[] = $signature;
		return implode('.', $segments);
	}

	/**
	 * Decode JWT token.
	 *
	 * @param string $token JWT token.
	 * @param array $options Decode options.
	 * @return array|WP_Error
	 */
	public function decode($token, $options = array()) {
		$parts = explode('.', $token);
		if (count($parts) !== 3) {
			return new WP_Error('storesdk_jwt.malformed', __('Malformed JWT', 'store-sdk'));
		}

		list($header64, $payload64, $signature) = $parts;
		
		$header = json_decode($this->base64url_decode($header64), true);
		$payload = json_decode($this->base64url_decode($payload64), true);

		if (empty($header) || empty($payload) || !is_array($header) || !is_array($payload)) {
			return new WP_Error('storesdk_jwt.invalid_json', __('Invalid JWT JSON', 'store-sdk'));
		}

		// Verify signature
		$expected_signature = $this->sign($header64 . '.' . $payload64);
		if (!hash_equals($expected_signature, $signature)) {
			return new WP_Error('storesdk_jwt.bad_signature', __('Invalid JWT signature', 'store-sdk'));
		}

		// Validate time-based claims
		$validation_result = $this->validate_time_claims($payload, $options);
		if (is_wp_error($validation_result)) {
			return $validation_result;
		}

		// Validate audience
		$audience_result = $this->validate_audience($payload);
		if (is_wp_error($audience_result)) {
			return $audience_result;
		}

		return $payload;
	}

	/**
	 * Validate time-based claims (nbf, iat, exp).
	 *
	 * @param array $payload JWT payload.
	 * @param array $options Validation options.
	 * @return true|WP_Error
	 */
	private function validate_time_claims($payload, $options) {
		$now = time();
		$leeway = isset($options['leeway']) ? (int) $options['leeway'] : $this->get_leeway();
		$ignore_exp = !empty($options['ignore_exp']);

		// Not before
		if (isset($payload['nbf']) && $payload['nbf'] > $now + $leeway) {
			return new WP_Error('storesdk_jwt.nbf', __('Token not yet valid', 'store-sdk'));
		}

		// Issued at
		if (isset($payload['iat']) && $payload['iat'] > $now + $leeway) {
			return new WP_Error('storesdk_jwt.iat', __('Token issued in the future', 'store-sdk'));
		}

		// Expiration
		if (isset($payload['exp']) && !$ignore_exp && $payload['exp'] < ($now - $leeway)) {
			return new WP_Error('storesdk_jwt.expired', __('Token expired', 'store-sdk'));
		}

		return true;
	}

	/**
	 * Validate audience claim.
	 *
	 * @param array $payload JWT payload.
	 * @return true|WP_Error
	 */
	private function validate_audience($payload) {
		if (!empty($payload['aud']) && $payload['aud'] !== get_site_url()) {
			return new WP_Error('storesdk_jwt.aud', __('Invalid token audience', 'store-sdk'));
		}
		return true;
	}

	/**
	 * Get JWT leeway setting.
	 *
	 * @return int
	 */
	private function get_leeway() {
		return defined('STORESDK_JWT_LEEWAY') ? (int) STORESDK_JWT_LEEWAY : 1;
	}

	/**
	 * Generate a unique JWT ID (jti).
	 *
	 * @return string
	 */
	public function generate_jti() {
		try {
			return bin2hex(random_bytes(16));
		} catch (Exception $e) {
			return wp_hash(uniqid('storesdk_jti_', true));
		}
	}

	/**
	 * Generate random token for refresh tokens.
	 *
	 * @return string
	 */
	public function generate_random_token() {
		try {
			return bin2hex(random_bytes(32));
		} catch (Exception $e) {
			return wp_hash(uniqid('storesdk_refresh_', true));
		}
	}

	/**
	 * Hash refresh token.
	 *
	 * @param string $raw_token Raw refresh token.
	 * @return string
	 */
	public function hash_refresh_token($raw_token) {
		if (!defined('STORESDK_JWT_SECRET')) {
			return '';
		}
		return hash_hmac('sha256', $raw_token, STORESDK_JWT_SECRET);
	}

	/**
	 * Get default token expiration.
	 *
	 * @return int
	 */
	public function get_default_expiration() {
		$ttl = defined('STORESDK_JWT_ACCESS_TTL') ? (int) STORESDK_JWT_ACCESS_TTL : 3600;
		return (int) apply_filters('storesdk_jwt_default_expiration', $ttl);
	}

	/**
	 * Get user token version.
	 *
	 * @param int $user_id User ID.
	 * @return int
	 */
	public function get_user_token_version($user_id) {
		$version = get_user_meta($user_id, 'storesdk_token_version', true);
		if (!$version || !is_numeric($version)) {
			return 1;
		}
		return (int) $version;
	}

	/**
	 * Bump user token version (invalidates all existing tokens).
	 *
	 * @param int $user_id User ID.
	 * @return int New version number.
	 */
	public function bump_user_token_version($user_id) {
		$version = $this->get_user_token_version($user_id) + 1;
		update_user_meta($user_id, 'storesdk_token_version', $version);
		return $version;
	}

	/**
	 * Issue refresh token for user.
	 *
	 * @param int $user_id User ID.
	 * @param int $ttl Time to live in seconds.
	 * @return array
	 */
	public function issue_refresh_token($user_id, $ttl) {
		$raw_token = $this->generate_random_token();
		$now = time();
		$expires = $now + $ttl;
		$hash = $this->hash_refresh_token($raw_token);

		$tokens = get_user_meta($user_id, 'storesdk_refresh_tokens', true);
		if (!is_array($tokens)) {
			$tokens = array();
		}

		$tokens[] = array('hash' => $hash, 'exp' => $expires);

		// Garbage collect expired tokens
		$tokens = array_values(array_filter($tokens, function ($token) use ($now) {
			return !empty($token['exp']) && $token['exp'] > $now;
		}));

		// Enforce max tokens limit
		$max_tokens = defined('STORESDK_JWT_REFRESH_MAX_TOKENS') ? (int) STORESDK_JWT_REFRESH_MAX_TOKENS : 10;
		if ($max_tokens > 0 && count($tokens) > $max_tokens) {
			$excess = count($tokens) - $max_tokens;
			$tokens = array_slice($tokens, $excess);
		}

		update_user_meta($user_id, 'storesdk_refresh_tokens', $tokens);

		return array(
			'token' => $raw_token,
			'expires_in' => $expires - $now
		);
	}

	/**
	 * Consume (invalidate) a refresh token.
	 *
	 * @param int $user_id User ID.
	 * @param string $raw_token Raw refresh token.
	 * @return true|WP_Error
	 */
	public function consume_refresh_token($user_id, $raw_token) {
		$hash = $this->hash_refresh_token($raw_token);
		$key = 'storesdk_refresh_tokens';

		$tokens = get_user_meta($user_id, $key, true);
		if (!is_array($tokens) || empty($tokens)) {
			return new WP_Error('storesdk_jwt.refresh_invalid', __('Invalid refresh token', 'store-sdk'), array('status' => 401));
		}

		$now = time();
		$found = false;
		$remaining = array();

		foreach ($tokens as $token) {
			if (empty($token['hash']) || empty($token['exp'])) {
				continue;
			}

			if ($token['hash'] === $hash) {
				if ($token['exp'] < $now) {
					return new WP_Error('storesdk_jwt.refresh_expired', __('Refresh token expired', 'store-sdk'), array('status' => 401));
				}
				$found = true;
				continue; // Skip - this token is consumed
			}

			if ($token['exp'] > $now) {
				$remaining[] = $token;
			}
		}

		if (!$found) {
			return new WP_Error('storesdk_jwt.refresh_invalid', __('Invalid refresh token', 'store-sdk'), array('status' => 401));
		}

		$success = update_user_meta($user_id, $key, $remaining);
		if (!$success) {
			// Check if token still exists (race condition)
			$after = get_user_meta($user_id, $key, true);
			if (is_array($after)) {
				foreach ($after as $token) {
					if (!empty($token['hash']) && $token['hash'] === $hash && !empty($token['exp']) && $token['exp'] > $now) {
						return new WP_Error('storesdk_jwt.refresh_race', __('Concurrent refresh detected, please retry', 'store-sdk'), array('status' => 409));
					}
				}
			}
			return new WP_Error('storesdk_jwt.refresh_update_failed', __('Failed to update refresh tokens', 'store-sdk'), array('status' => 500));
		}

		return true;
	}
}