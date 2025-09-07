Deprecated placeholder for old slug. Use plugin under `../store-sdk` directory.

Security features:

* Refresh token rotation with reuse prevention
* Optional forced one-time tokens for autologin flows
* Access token versioning to invalidate existing tokens on revoke
* Configurable TTLs (access, refresh, one-time) via constants

> NOTE: For production deployments you must configure a strong secret and consider additional hardening (rate limiting, WAF, IP/device binding, monitoring).

== Installation ==
1. Upload the plugin folder to `/wp-content/plugins/` or install via the Plugins screen.
2. Activate the plugin through the 'Plugins' menu.
3. Define the required constants in `wp-config.php` before the line that says `/* That's all, stop editing! */`:

```
define( 'STORESDK_JWT_ENABLED', true );
define( 'STORESDK_JWT_SECRET', 'generate-a-long-random-secret-here' );
```

4. (Optional) Adjust TTLs / features:
```
// Access token lifetime (seconds)
define( 'STORESDK_JWT_ACCESS_TTL', 3600 );
// Refresh default/min/max
define( 'STORESDK_JWT_REFRESH_DEFAULT_TTL', 60*60*24*14 );
define( 'STORESDK_JWT_REFRESH_MIN_TTL', 60*60*24 );
define( 'STORESDK_JWT_REFRESH_MAX_TTL', 60*60*24*30 );
// One-time token TTL bounds
define( 'STORESDK_JWT_ONE_TIME_DEFAULT_TTL', 300 );
define( 'STORESDK_JWT_ONE_TIME_MIN_TTL', 30 );
define( 'STORESDK_JWT_ONE_TIME_MAX_TTL', 900 );
// Max stored refresh tokens per user (0 = unlimited)
define( 'STORESDK_JWT_REFRESH_MAX_TOKENS', 10 );
// Require one-time token for autologin
define( 'STORESDK_JWT_REQUIRE_ONE_TIME_FOR_AUTOLOGIN', true );
// Enable front-channel (?storesdk_autologin=1)
define( 'STORESDK_JWT_ENABLE_FRONT_CHANNEL', true );
// Emit 401 on invalid bearer instead of silent ignore
define( 'STORESDK_JWT_ERROR_ON_INVALID_BEARER', false );
```

== Frequently Asked Questions ==

= Is this production ready? =
Yes, if you configure a strong secret and pair with standard protections (HTTPS, rate limiting, monitoring). For advanced revocation, device binding, and auditing you may integrate an external identity provider.

= Does it rely on external JWT libraries? =
No. It implements minimal HS256 signing internally to keep footprint low.

= Can I customize access token lifetime? =
Yes via the `STORESDK_JWT_ACCESS_TTL` constant or the `storesdk_jwt_token_expiration` filter.

= How do I revoke all existing access tokens for a user? =
Call the `/revoke` endpoint with scope `all` while authenticated (cookie or bearer). This clears refresh tokens and bumps an internal version invalidating prior access tokens.

= What happens if I rotate the secret? =
All existing tokens become invalid immediately (they cannot be revalidated due to signature mismatch). Perform secret rotation during a maintenance window if active sessions matter.

== Screenshots ==
1. No UI – endpoints only.

== Changelog ==
= 1.0.0 =
* Initial public release (token, refresh, one-time, autologin, validate, revoke; rotation & versioning).

== Upgrade Notice ==
= 1.0.0 =
First release.
