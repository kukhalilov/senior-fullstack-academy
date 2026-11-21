# Browser persistence offline operation and web workers — Problem: Design an offline task editor with conflict recovery

## Goals

Design a local data model and user flow that preserves edits across a brief outage, makes server synchronization explicit, and recovers safely from duplicate delivery and concurrent edits.

## Worked example

The user changes task title from “Call Sam” to “Call Sam today” while offline. The app stores the new local snapshot and a pending operation with an operation ID, task ID, and base version. Another device changes the title before reconnection. On reconnect, the server rejects the stale base version. The app retains both values and asks the user to choose or merge; it does not silently overwrite.

## Exercises

1. Define fields for a task snapshot and a pending operation.
2. Decide when the screen may say “saved on this device” and when it may say “synced.”
3. Explain how a retry behaves if the first request committed but its response was lost.
4. Define what happens to pending operations on logout and on local quota failure.
5. State a conflict policy for a title edit and for a multi-field form with independent fields.

## Progressive hints

1. Keep server identity, local operation identity, and record version separate.
2. Persist the snapshot and pending operation together in an IndexedDB read/write transaction.
3. Reuse the same operation ID on retry; the server must support idempotent processing.
4. A conflict requires domain policy; idempotency alone does not merge concurrent edits.
5. Keep unsynchronized work visible and recoverable. Do not promise durability if the write failed.

## Complete solutions

Use an IndexedDB object store keyed by stable task ID and another store for pending operations keyed by stable operation ID. Store a base server version or validator with each pending operation. In one read/write transaction, update the local task snapshot and add the pending operation. Show “saved on this device; waiting to sync” only after transaction completion. Send the operation with the same ID on every retry. The server deduplicates that ID and checks the expected version. On success, persist the server response and remove the pending marker atomically. On a version conflict, preserve local and server versions, show the conflict, and ask the user or apply a documented field-level merge. On quota failure, do not report success; preserve the form in memory while possible and tell the user that it was not durably saved. On logout, follow a stated account-data policy: either securely retain encrypted user-owned work with consent or remove account-specific state and warn before discarding unsynced work.

## Tests and edge cases

- Simulate a timeout after server commit; retry must not create a duplicate task or side effect.
- Simulate two devices changing the same field; local work must remain recoverable.
- Simulate IndexedDB transaction abort and quota failure; UI must not claim durable save.
- Simulate browser data clearing; reload should explain that the local offline copy is gone and offer server recovery.
- Simulate account switching; pending work from one account must never be sent under another account.

## Reflection questions

1. Which fields can be safely merged, and which require a user decision?
2. What promise does “saved” make in this product: in memory, on this device, or on the server?
3. What evidence would show that a pending operation is no longer needed?

### Sources

- [Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [AWS: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
- [WHATWG Storage Standard](https://storage.spec.whatwg.org/)
