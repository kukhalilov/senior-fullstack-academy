# end-to-end system design case studies — Reference: Delta sync

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google Drive API: retrieve changes](https://developers.google.com/workspace/drive/api/guides/manage-changes), [Google Drive API: getStartPageToken](https://developers.google.com/workspace/drive/api/reference/rest/v3/changes/getStartPageToken), [Google Drive API: changes.list](https://developers.google.com/workspace/drive/api/reference/rest/v3/changes/list), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 6902: JSON Patch](https://www.rfc-editor.org/rfc/rfc6902.html).

## Scope and version

This lesson covers synchronizing a client’s local copy by fetching changes since a saved cursor, rather than downloading the full dataset each time. Google Drive is a concrete API example; its exact token and change semantics are specific to Drive API v3. Other systems may use sequence numbers, revision IDs, change feeds, or conditional HTTP requests.

## How this group fits the mental model

The server owns a canonical state and exposes a durable way to continue from a known point. A client stores both its local data and a sync cursor. It requests changes after that cursor, applies them safely, and advances the cursor only after the corresponding changes are durably applied. This reduces transfer for large collections but introduces cursor lifecycle, pagination, deletion, conflict, and recovery behavior.

A change notification usually means “check for changes,” not “the notification itself contains the complete durable change history.” A robust design can poll a change feed and use push only to reduce detection delay. Define how a client recovers if it loses local state, a cursor becomes invalid, pagination is interrupted, or an item changes while being downloaded.

## Supplied names explained

- **Change feed:** ordered or cursor-addressable record of changes since a point. It may contain full current resource state, operations, or invalidation hints; know which.
- **Cursor/page token:** opaque continuation marker. Store it exactly as issued; do not infer order or manufacture one.
- **Pagination:** fetching all pages in a batch. Advance to a new durable cursor only after the complete batch is processed and persisted.
- **Tombstone/removal event:** representation that an item was deleted or removed from the user’s view. In Drive API v3, a `removed` change can mean deletion or loss of access; it is not always proof that the underlying file was deleted. Without handling removal, stale local copies can remain forever.
- **Idempotent apply:** applying the same change twice has the same resulting local state as applying it once, or duplicates are detected by change ID/version.
- **Snapshot/resync:** full baseline download followed by change-feed continuation when local state is missing or cursor recovery requires it.
- **Conditional update:** client submits an expected version/ETag so the server can reject a write based on stale state instead of silently overwriting newer data.

## Cross-item comparison

| Sync strategy | Network/state cost | Best fit / caveat |
| --- | --- | --- |
| Full snapshot | Transfers and rebuilds the full visible dataset | Simple baseline and recovery; expensive for large collections |
| Timestamp polling | Fetches records newer than a timestamp | Simple, but clock skew, equal timestamps, and deletions can create gaps unless the API defines a stable overlap/cursor scheme |
| Opaque change cursor | Fetches a sequence/feed after a saved token | Efficient incremental sync; token expiry, permissions, pagination, and replay semantics must be handled |
| Content delta/patch | Sends operations or changed fields rather than full objects | Saves bytes for large resources; patch base version and ordering must match, and patch application may fail on divergent local state |
| Push notification plus feed | Low-latency signal, then cursor-based reconciliation | Notifications can be duplicated/lost/delayed; the durable feed remains the recovery source |

## Examples

Google Drive API v3 provides a start page token, `changes.list`, and pagination using `nextPageToken`; its response supplies `newStartPageToken` at the end of the current changes list for future polling. Drive documents these tokens as non-expiring, but the token is still scoped to Drive's API semantics. The client should process every page, persist local effects, and then save the returned new start token. A `removed` entry can represent deletion or loss of access; the API’s change list may include current file state and removal information according to requested options, and is not a generic patch protocol.

For a generic client, maintain a local transaction that upserts/deletes changes and records the consumed page position atomically. If the client crashes after applying changes but before saving the cursor, it replays the page, so handlers must be idempotent. If it saves the cursor before committing local changes, a crash can skip data permanently. If a downloaded object and change record refer to different revisions, fetch/validate the current revision or retry from a consistent snapshot.

For client edits, include the base revision/ETag. RFC 9110 conditional `If-Match` semantics can make a state-changing request conditional on the current representation; a mismatch prevents applying the stale update (often with `412 Precondition Failed`). The client can then fetch the newer state and merge or ask the user to resolve the conflict.

## Common mistakes

- Saving the next cursor before all pages and local mutations are committed.
- Assuming notifications are durable, ordered change records and never reconciling with the feed.
- Ignoring deletions/tombstones, causing removed data to reappear after a later sync.
- Treating an opaque token as a timestamp or assuming its format/order.
- Failing to make repeated page application safe after a crash or network timeout.
- Using timestamps without handling clock skew, same-time updates, and pagination boundaries.
- Applying a patch to the wrong base version or advancing after a failed patch.
- Assuming access/permission changes are ordinary content updates; a user’s visible collection can change without the object itself changing.
- Reusing an old cursor after a full local reset without obtaining a consistent new baseline.

## Knowledge checks with answers

1. **When is it safe to persist the next cursor?** After all changes through that cursor are durably applied, ideally atomically with the cursor or with idempotent replay protection.
2. **Why do push notifications not replace the change feed?** They can signal that work exists but may be duplicated, delayed, or missed; cursor reconciliation recovers actual state.
3. **What prevents a stale client edit from overwriting newer data?** A conditional update tied to the base revision/ETag, followed by conflict resolution when the precondition fails.
4. **What happens if a client loses its local database?** It needs a snapshot/resync procedure and a new valid continuation token, not merely a cursor from the lost state.

## Review status

Drive cursor, token-lifetime, pagination, and removal semantics are checked against current official Google API documentation; HTTP conditional update semantics against RFC 9110; patch format scope against RFC 6902. Generic cursor expiry remains a concern for other APIs even though Drive documents its page tokens as non-expiring.
