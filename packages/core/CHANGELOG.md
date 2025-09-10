# 2.0.0 (2025-09-10)

### 🚀 Features

- ⚠️  unify authentication in core package and introduce WordPress plugin ([74ede26](https://github.com/kmakris23/store-sdk/commit/74ede26))
- enhance cart and order integration tests, improve error handling and assertions ([649641d](https://github.com/kmakris23/store-sdk/commit/649641d))
- Implement enhanced plugin architecture with event handler registration and include Angular example in CI builds ([fcf9ac3](https://github.com/kmakris23/store-sdk/commit/fcf9ac3))

### ⚠️  Breaking Changes

- ⚠️  unify authentication in core package and introduce WordPress plugin ([74ede26](https://github.com/kmakris23/store-sdk/commit/74ede26))

## 1.3.5-alpha.5 (2025-09-10)

### 🚀 Features

- **auth:** update getAutoLoginUrl parameter names for consistency ([60a6ad2](https://github.com/kmakris23/store-sdk/commit/60a6ad2))

## 1.3.5-alpha.4 (2025-09-10)

### 🚀 Features

- **auth:** refactor getAutoLoginUrl tests to directly pass token and redirectUrl ([43beb57](https://github.com/kmakris23/store-sdk/commit/43beb57))
- **auth:** update getAutoLoginUrl to accept ott parameter for token generation ([c405c12](https://github.com/kmakris23/store-sdk/commit/c405c12))

## 1.3.5-alpha.3 (2025-09-10)

### 🚀 Features

- **auth:** update getAutoLoginUrl to require redirectUrl and improve URL generation ([07af077](https://github.com/kmakris23/store-sdk/commit/07af077))

## 1.3.5-alpha.2 (2025-09-10)

### 🚀 Features

- **interceptors:** enhance refresh token handling with queue management and state reset functionality ([b296d14](https://github.com/kmakris23/store-sdk/commit/b296d14))

## 1.3.5-alpha.1 (2025-09-10)

### 🚀 Features

- **auth:** improve token handling by ensuring async token and refresh token setting ([c7723c8](https://github.com/kmakris23/store-sdk/commit/c7723c8))

## 1.3.5-alpha.0 (2025-09-09)

This was a version bump only for core to align it with other projects, there were no code changes.

## 1.3.4-alpha.0 (2025-09-08)

This was a version bump only for core to align it with other projects, there were no code changes.

## 1.3.3-alpha.0 (2025-09-08)

### 🚀 Features

- **auth:** initialize authentication state based on provided token ([442c25f](https://github.com/kmakris23/store-sdk/commit/442c25f))

### 🩹 Fixes

- **auth:** correct token retrieval logic in refresh token interceptor ([1a491d6](https://github.com/kmakris23/store-sdk/commit/1a491d6))

## 1.3.2-alpha.0 (2025-09-08)

### 🚀 Features

- **auth:** add support for setting refresh token in token response ([91f13bf](https://github.com/kmakris23/store-sdk/commit/91f13bf))

## 1.3.1-alpha.0 (2025-09-08)

### 🚀 Features

- **auth:** enhance authentication flow with token management and auto-login URL ([4ee683b](https://github.com/kmakris23/store-sdk/commit/4ee683b))

## 1.3.0-alpha.0 (2025-09-08)

This was a version bump only for core to align it with other projects, there were no code changes.

## 1.2.0-alpha.0 (2025-09-08)

### 🚀 Features

- **auth:** implement token management and refresh functionality ([3511c31](https://github.com/kmakris23/store-sdk/commit/3511c31))
- enhance cart and order integration tests, improve error handling and assertions ([649641d](https://github.com/kmakris23/store-sdk/commit/649641d))
- Implement enhanced plugin architecture with event handler registration and include Angular example in CI builds ([fcf9ac3](https://github.com/kmakris23/store-sdk/commit/fcf9ac3))

## 1.1.1 (2025-08-20)

This was a version bump only for core to align it with other projects, there were no code changes.

## 1.1.0 (2025-08-20)

This was a version bump only for core to align it with other projects, there were no code changes.

## 1.0.1 (2025-08-13)

### 🩹 Fixes

- **core:** remove `simple-jwt-login` interceptor ([4104c9a](https://github.com/kmakris23/store-sdk/commit/4104c9a))
- **core:** always clear `nonce` and `cartToken` when auth change to `false` ([7dc98cd](https://github.com/kmakris23/store-sdk/commit/7dc98cd))

# 1.0.0 (2025-08-12)

### 🚀 Features

- **simple-jwt-login:** add `revokeTokenBeforeLogin` to automatically revoke token before each new login ([079128e](https://github.com/kmakris23/store-sdk/commit/079128e))
- **simple-jwt-login:** add `fetchCartOnLogin` to automatically fetch cart after login and automatically remove `nonce` and `cartToken` on each logout ([fb6e964](https://github.com/kmakris23/store-sdk/commit/fb6e964))
- ⚠️ new event bus implementation ([53b0207](https://github.com/kmakris23/store-sdk/commit/53b0207))
- ⚠️ **core:** move store api services under `store` property ([2978784](https://github.com/kmakris23/store-sdk/commit/2978784))
- **core:** add specific `simple-jwt-login` plugin interceptor ([7a5d061](https://github.com/kmakris23/store-sdk/commit/7a5d061))

### 🩹 Fixes

- **core:** use `simple-jwt-login` config for interceptor ([c57ed92](https://github.com/kmakris23/store-sdk/commit/c57ed92))

### ⚠️ Breaking Changes

- New event bus has been implemented replacing the previous event emitter.
- **core:** Store API services have been moved under `store` property in `StoreSdk`.

## 0.9.1 (2025-08-06)

This was a version bump only for core to align it with other projects, there were no code changes.

## 0.9.0 (2025-08-06)

This was a version bump only for core to align it with other projects, there were no code changes.

## 0.8.5 (2025-08-06)

### 🩹 Fixes

- **axios:** ensure options are spread correctly in doRequest function ([26e6297](https://github.com/kmakris23/store-sdk/commit/26e6297))

## 0.8.4 (2025-08-06)

This was a version bump only for core to align it with other projects, there were no code changes.

## 0.8.3 (2025-08-06)

This was a version bump only for core to align it with other projects, there were no code changes.

## 0.8.2 (2025-08-06)

This was a version bump only for core to align it with other projects, there were no code changes.

## 0.8.1 (2025-08-06)

This was a version bump only for core to align it with other projects, there were no code changes.

## 0.8.0 (2025-08-06)

### 🚀 Features

- **auth:** enhance authentication handling and state management ([ec53370](https://github.com/kmakris23/store-sdk/commit/ec53370))

## 0.7.0 (2025-08-05)

### 🚀 Features

- **core:** enhance API services to support pagination in responses ([b6fbdad](https://github.com/kmakris23/store-sdk/commit/b6fbdad))
