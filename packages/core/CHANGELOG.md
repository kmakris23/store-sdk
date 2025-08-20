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
- ⚠️  new event bus implementation ([53b0207](https://github.com/kmakris23/store-sdk/commit/53b0207))
- ⚠️  **core:** move store api services under `store` property ([2978784](https://github.com/kmakris23/store-sdk/commit/2978784))
- **core:** add specific `simple-jwt-login` plugin interceptor ([7a5d061](https://github.com/kmakris23/store-sdk/commit/7a5d061))

### 🩹 Fixes

- **core:** use `simple-jwt-login` config for interceptor ([c57ed92](https://github.com/kmakris23/store-sdk/commit/c57ed92))

### ⚠️  Breaking Changes

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
