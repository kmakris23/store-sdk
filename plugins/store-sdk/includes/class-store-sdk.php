<?php
/**
 * The main Store SDK plugin class.
 *
 * @since 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Main Store SDK Class.
 *
 * @class Store_SDK
 */
final class Store_SDK {

	/**
	 * The single instance of the class.
	 *
	 * @var Store_SDK
	 * @since 1.0.0
	 */
	protected static $_instance = null;

	/**
	 * CORS handler instance.
	 *
	 * @var Store_SDK_CORS
	 */
	public $cors;

	/**
	 * JWT handler instance.
	 *
	 * @var Store_SDK_JWT
	 */
	public $jwt;

	/**
	 * Auth handler instance.
	 *
	 * @var Store_SDK_Auth
	 */
	public $auth;

	/**
	 * API handler instance.
	 *
	 * @var Store_SDK_API
	 */
	public $api;

	/**
	 * Admin handler instance.
	 *
	 * @var Store_SDK_Admin
	 */
	public $admin;

	/**
	 * Main Store SDK Instance.
	 *
	 * Ensures only one instance of Store SDK is loaded or can be loaded.
	 *
	 * @since 1.0.0
	 * @static
	 * @return Store_SDK - Main instance.
	 */
	public static function instance() {
		if (is_null(self::$_instance)) {
			self::$_instance = new self();
		}
		return self::$_instance;
	}

	/**
	 * Store SDK Constructor.
	 */
	public function __construct() {
		$this->define_constants();
		$this->includes();
		$this->init_hooks();

		do_action('storesdk_loaded');
	}

	/**
	 * Hook into actions and filters.
	 *
	 * @since 1.0.0
	 */
	private function init_hooks() {
		register_activation_hook(STORESDK_PLUGIN_FILE, array($this, 'activation_check'));
		add_action('plugins_loaded', array($this, 'init'), 0);
	}

	/**
	 * Define Store SDK Constants.
	 */
	private function define_constants() {
		$this->define('STORESDK_ABSPATH', dirname(STORESDK_PLUGIN_FILE) . '/');
		$this->define('STORESDK_PLUGIN_BASENAME', plugin_basename(STORESDK_PLUGIN_FILE));
		$this->define('STORESDK_VERSION', '1.0.0');
	}

	/**
	 * Define constant if not already set.
	 *
	 * @param string $name  Constant name.
	 * @param string|bool $value Constant value.
	 */
	private function define($name, $value) {
		if (!defined($name)) {
			define($name, $value);
		}
	}

	/**
	 * What type of request is this?
	 *
	 * @param string $type admin, ajax, cron or frontend.
	 * @return bool
	 */
	private function is_request($type) {
		switch ($type) {
			case 'admin':
				return is_admin();
			case 'ajax':
				return defined('DOING_AJAX');
			case 'cron':
				return defined('DOING_CRON');
			case 'frontend':
				return (!is_admin() || defined('DOING_AJAX')) && !defined('DOING_CRON');
		}
	}

	/**
	 * Include required core files used in admin and on the frontend.
	 */
	public function includes() {
		/**
		 * Core classes.
		 */
		include_once STORESDK_ABSPATH . 'includes/class-cors.php';
		include_once STORESDK_ABSPATH . 'includes/class-jwt.php';
		include_once STORESDK_ABSPATH . 'includes/class-auth.php';
		include_once STORESDK_ABSPATH . 'includes/api/class-api.php';

		if ($this->is_request('admin')) {
			include_once STORESDK_ABSPATH . 'includes/admin/class-admin.php';
		}
	}

	/**
	 * Init Store SDK when WordPress Initialises.
	 */
	public function init() {
		// Before init action.
		do_action('before_storesdk_init');

		// Set up localisation.
		$this->load_plugin_textdomain();

		// Initialize core components.
		$this->cors = new Store_SDK_CORS();
		$this->jwt = new Store_SDK_JWT();
		$this->auth = new Store_SDK_Auth();
		$this->api = new Store_SDK_API();

		if ($this->is_request('admin')) {
			$this->admin = new Store_SDK_Admin();
		}

		// Init action.
		do_action('storesdk_init');
	}

	/**
	 * Load Localisation files.
	 */
	public function load_plugin_textdomain() {
		$locale = determine_locale();
		$locale = apply_filters('plugin_locale', $locale, 'store-sdk');

		unload_textdomain('store-sdk');
		load_textdomain('store-sdk', WP_LANG_DIR . '/store-sdk/store-sdk-' . $locale . '.mo');
		load_plugin_textdomain('store-sdk', false, dirname(STORESDK_PLUGIN_BASENAME) . '/languages');
	}

	/**
	 * Activation check.
	 */
	public function activation_check() {
		if (version_compare(PHP_VERSION, '8.0', '<')) {
			deactivate_plugins(plugin_basename(STORESDK_PLUGIN_FILE));
			wp_die(
				esc_html__('Store SDK requires PHP version 8.0 or above.', 'store-sdk'),
				esc_html__('Plugin Activation Error', 'store-sdk'),
				array('response' => 200, 'back_link' => true)
			);
		}
	}

	/**
	 * Get the plugin url.
	 *
	 * @return string
	 */
	public function plugin_url() {
		return untrailingslashit(plugins_url('/', STORESDK_PLUGIN_FILE));
	}

	/**
	 * Get the plugin path.
	 *
	 * @return string
	 */
	public function plugin_path() {
		return untrailingslashit(plugin_dir_path(STORESDK_PLUGIN_FILE));
	}
}