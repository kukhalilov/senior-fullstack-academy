# Browser persistence offline operation and web workers — Reference: Quota, eviction, privacy, and security boundaries

## Scope and version

Browser-managed storage limits and eviction are implementation-dependent and may change. Treat quota estimates as guidance, and design for failures and user clearing.

## How this group fits the mental model

Local storage is a convenience under browser and user control. It may disappear, be unavailable, or reject writes. Durability, privacy, and recovery are part of the product design, not guarantees provided by choosing a particular API.

## Supplied names explained

- `Origin-scoped storage` — Browser storage is separated by origin, which includes scheme, host, and port. This separation is an important boundary, but it does not protect data from compromised same-origin script.
- `Storage estimate` — `navigator.storage.estimate()` returns approximate usage and quota information where available. It is not a reservation, and values can change before the next write.
- `QuotaExceededError` — A write may fail when storage capacity or policy limits are reached. Catch the failure, preserve recoverable work, and avoid reporting the operation as saved when it was not.
- `Best-effort storage` — The default storage posture is generally subject to eviction under pressure. Do not promise permanent retention of local-only data.
- `Persistent storage request` — `navigator.storage.persist()` can ask the browser for stronger eviction protection. The request may be denied; it is not a backup and does not prevent user deletion or device loss.
- `Browser eviction` — The browser may remove origin data under storage pressure according to user-agent policy. Keep a server or export recovery path for important data.
- `Private browsing behavior` — Storage behavior and lifetime can differ in private modes and among browsers. Avoid brittle capacity assumptions; test target environments and handle unavailable or temporary storage.
- `User-initiated data clearing` — Users can clear site data through browser controls. Treat this as a supported state: initialize cleanly and recover from the server or an export where appropriate.
- `XSS exposure from script-readable storage` — Same-origin injected script can read script-accessible data such as Web Storage and IndexedDB. Avoid storing credentials or secrets there, and reduce XSS risk through output encoding, safe DOM APIs, and content security controls.
- `Data minimization and retention` — Persist only the data needed for a clear purpose and only as long as needed. Delete stale caches and account-specific content on logout or account change.

## Cross-item comparison

An estimate predicts available capacity but does not reserve it. Persistent storage can reduce some eviction risk but does not defeat user clearing. Origin scoping limits cross-origin access; it does not defend against same-origin script execution. Data minimization reduces impact even when the platform boundary is respected.

## Examples

Before importing a large offline dataset, inspect an estimate if available, but still catch quota errors while writing. If a transaction fails, keep the prior committed state and tell the user the import did not finish. On logout, remove user-specific records and cache entries according to the product’s retention policy. Never describe `persist()` as a backup.

## Common mistakes

- Hard-coding one browser’s quota as a universal limit.
- Assuming `persist()` is always granted.
- Treating client-side encryption with a key available to the same script as protection from XSS.
- Silently dropping pending user work after quota failure.

## Knowledge checks with answers

1. Does `estimate()` guarantee that the next write fits? No.
2. Does persistent storage prevent the user from clearing site data? No.
3. Does origin-scoped storage stop a script injection on the same origin from reading Web Storage? No.

### Sources

- [Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Persistent storage request](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist)
- [WHATWG Storage Standard](https://storage.spec.whatwg.org/)
- [MDN cookies security context](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
