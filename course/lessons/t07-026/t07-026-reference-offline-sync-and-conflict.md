# Browser persistence offline operation and web workers — Reference: Offline experience, queued writes, synchronization, and conflicts

## Scope and version

Offline behavior depends on application, server, browser, and product policy. Background execution support varies. A reliable design includes a foreground recovery path.

## How this group fits the mental model

An offline interface is a promise about what remains available, how old it may be, and what happens to edits. Separate locally saved, queued, sent, accepted, rejected, and conflicted states so neither the UI nor the user confuses them.

## Supplied names explained

- `Offline read fallback` — A defined local response when the network is unavailable. Include when it was last refreshed and what actions remain safe.
- `Offline write queue` — Durable local operations waiting for synchronization. Store enough information to identify the operation and its target; define what logout or storage deletion does to the queue.
- `Optimistic update` — Show a likely result before server confirmation. Keep a pending state and rollback or conflict path if the server rejects it.
- `Pending versus synchronized state` — A local pending edit is not server accepted. Expose that distinction in the UI and data model.
- `Idempotent replay` — Retry the same logical operation with a stable identity so a duplicate delivery does not create a second effect. This requires server support and does not by itself solve concurrent edits.
- `Conflict detection` — Compare versions, validators, or domain state to notice that the server changed since the local copy was read.
- `Conflict resolution policy` — Decide whether to reject and ask the user, merge according to domain rules, or apply a documented precedence rule. Keep user work recoverable when automatic merging is unsafe.
- `Background Sync availability caveat` — A browser may support a deferred synchronization API under conditions, but support and execution timing vary. Do not promise a precise delivery time; retry when the app is foregrounded.
- `Retry and backoff` — Retry transient failures with bounded delay and jitter where appropriate, while distinguishing permanent validation/authentication failures. Do not retry forever without limits or user feedback.
- `User-visible freshness and recovery` — Show last-sync time, pending count, failure reason, retry affordance, and recovery choices. Make stale data and unresolved conflicts understandable.

## Cross-item comparison

Optimistic UI affects what appears before confirmation; the durable queue records the operation; idempotent replay handles duplicate delivery; conflict detection and policy address concurrent changes. Background Sync can improve convenience but cannot be the only recovery route.

## Examples

An offline title edit is written to IndexedDB together with an operation ID and base version. When the app reconnects, it sends the operation. If the first response was lost, replay uses the same ID. If the server reports a newer version, keep both versions and ask the user to merge or choose. After a confirmed response, remove the pending marker and update the local server snapshot.

## Common mistakes

- Treating an `online` event as proof that an API request will succeed.
- Generating a new idempotency key on every retry.
- Applying last-write-wins to data where it can silently destroy important edits.
- Relying exclusively on Background Sync.
- Hiding pending work or deleting it on an unhandled storage error.

## Knowledge checks with answers

1. What does idempotency solve? Duplicate delivery of the same logical operation, when the server honors its identity.
2. Does it resolve two separate edits from two devices? No; a conflict policy is still needed.
3. What is the foreground fallback for Background Sync? Retry and reconcile when the user opens or resumes the app, with clear status.

### Sources

- [Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [AWS: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
- [Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
