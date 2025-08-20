## 1.1.0 (2025-08-20)

### 🚀 Features

- **simple-jwt-login:** add `redirectUrl` optional parameter to `getAutoLoginUrl` method ([5aa0a47](https://github.com/kmakris23/store-sdk/commit/5aa0a47))

## 1.0.1 (2025-08-13)

This was a version bump only for simple-jwt-login to align it with other projects, there were no code changes.

# 1.0.0 (2025-08-12)

### 🚀 Features

- **simple-jwt-login:** add `revokeTokenBeforeLogin` to automatically revoke token before each new login ([079128e](https://github.com/kmakris23/store-sdk/commit/079128e))
- **simple-jwt-login:** add `fetchCartOnLogin` to automatically fetch cart after login and automatically remove `nonce` and `cartToken` on each logout ([fb6e964](https://github.com/kmakris23/store-sdk/commit/fb6e964))
- ⚠️  new event bus implementation ([53b0207](https://github.com/kmakris23/store-sdk/commit/53b0207))
- **simple-jwt-login:** automatically call `clearToken()` on token revoke success ([33c35c3](https://github.com/kmakris23/store-sdk/commit/33c35c3))

### ⚠️  Breaking Changes

- New event bus has been implemented replacing the previous event emitter.

## 0.9.1 (2025-08-06)

### 🩹 Fixes

- **auth:** update getAutoLoginUrl to include route namespace in the endpoint ([af91110](https://github.com/kmakris23/store-sdk/commit/af91110))

## 0.9.0 (2025-08-06)

### 🚀 Features

- **auth:** add getAutoLoginUrl method and autoLoginUrl config option ([05d549b](https://github.com/kmakris23/store-sdk/commit/05d549b))

## 0.8.5 (2025-08-06)

### 🩹 Fixes

- **auth:** make body parameter optional in revokeToken method ([ddc0a83](https://github.com/kmakris23/store-sdk/commit/ddc0a83))

## 0.8.4 (2025-08-06)

### 🩹 Fixes

- **auth, user:** add options parameter to service methods for better request configuration ([224d42d](https://github.com/kmakris23/store-sdk/commit/224d42d))

## 0.8.3 (2025-08-06)

### 🩹 Fixes

- **simple-jwt-login:** refresh-token: improve error handling by ensuring originalRequest is validated before processing 401 responses ([0299667](https://github.com/kmakris23/store-sdk/commit/0299667))

## 0.8.2 (2025-08-06)

### 🩹 Fixes

- **refresh-token:** ensure config is passed to refreshTokenFailed for better error handling ([276e168](https://github.com/kmakris23/store-sdk/commit/276e168))

## 0.8.1 (2025-08-06)

### 🩹 Fixes

- **simple-jwt:** add initial authentication state setup in plugin initialization ([b7bc0bb](https://github.com/kmakris23/store-sdk/commit/b7bc0bb))

## 0.8.0 (2025-08-06)

### 🚀 Features

- **auth:** enhance authentication handling and state management ([ec53370](https://github.com/kmakris23/store-sdk/commit/ec53370))

## 0.7.0 (2025-08-05)

This was a version bump only for simple-jwt-login to align it with other projects, there were no code changes.
