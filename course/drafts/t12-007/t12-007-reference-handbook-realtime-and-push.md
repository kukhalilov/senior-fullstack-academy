# system design technology landscape and selection — Reference: Realtime and push

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [Firebase Realtime Database](https://firebase.google.com/docs/database), [Realtime Database security rules](https://firebase.google.com/docs/database/security), [Firestore listeners and offline data](https://firebase.google.com/docs/firestore/manage-data/enable-offline), [FCM message types](https://firebase.google.com/docs/cloud-messaging/customize-messages/set-message-type), [FCM delivery](https://firebase.google.com/docs/cloud-messaging/understand-delivery), [FCM priority](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-priority).

## Scope and version

“Firebase” is a product suite, not one realtime protocol. This lesson distinguishes Firebase Realtime Database, Cloud Firestore listeners/offline support, and Firebase Cloud Messaging (FCM). Exact SDK behavior, limits, and pricing vary by product, platform, and plan; use current service documentation.

## How this group fits the mental model

Realtime user experience has two separate paths: authoritative state changes and a signal that tells clients to refresh or display something. A persistent connection or push notification can reduce perceived delay, but neither automatically provides durable event history, exactly-once delivery, authorization, or conflict-free multi-device edits. The server-side data model remains the source of truth; clients must recover after disconnects and determine whether local data is stale.

Choose the simplest interaction contract:

- **Polling** periodically asks for changes; easy to operate but adds request load and delay.
- **Server-Sent Events (SSE)** streams server-to-browser updates over HTTP in one direction; useful when the client does not need to send messages on the same stream.
- **WebSockets** support a long-lived bidirectional application channel.
- **Database listeners** synchronize/query data according to a platform’s rules and offline model.
- **Push notifications** prompt or notify a device; they are not a substitute for synchronizing canonical state.

## Supplied names explained

- **Firebase** — A development platform with several distinct realtime-related services. **Realtime Database** is a cloud-hosted JSON NoSQL database with client SDK synchronization and server-enforced security rules; its model encourages denormalized paths shaped around reads. **Cloud Firestore** is a document database with query listeners and optional offline persistence on supported client platforms; offline writes that conflict on the same document use last-write-wins behavior as documented. **Firebase Cloud Messaging** sends notification messages (which the SDK may display) or data messages (which app code handles) to devices. Notifications are always collapsible; FCM delivery can be delayed or handled differently by platform/app state and should be treated as a notification/sync hint, not the durable source of truth.

Realtime Database rules and Firestore rules are different systems and must be configured for least privilege. Direct client access can be safe when rules enforce ownership and allowed operations, but Firebase Authentication alone does not authorize a database read/write.

## Cross-item comparison

| Need | Suitable Firebase capability | Key tradeoff |
|---|---|---|
| Simple low-latency synchronized JSON state | Realtime Database | Tree-shaped data model; queries/indexing and denormalization shape the schema |
| Document/query model with live listeners and offline client cache | Cloud Firestore | Document/query semantics, usage-based cost, and offline conflict behavior need careful design |
| Notify a device that new state or work is available | FCM | Delivery/handling is platform-dependent; keep canonical data elsewhere and refetch/reconcile |
| Arbitrary app-to-server bidirectional live messages | A WebSocket or suitable realtime service | Application owns connection lifecycle, authorization, backpressure, delivery, and replay |

## Examples

### Shared task board

Store task documents with an owner/workspace identifier and server-enforced rules. Clients subscribe to only the workspace query they are authorized to read. On reconnect, they use server-confirmed state and show whether the current snapshot came from cache. Concurrent edits to the same document require an explicit conflict policy; the platform’s last-write-wins behavior may be inadequate for collaborative text or inventory. FCM can notify a background device that it should refresh, but the app still reads authoritative task data.

### Offline mobile workflow

The client edits cached records while disconnected. On reconnection, local writes synchronize. The product must explain pending/sync state and define conflict resolution, especially for money, inventory, or workflow transitions. For high-integrity operations, send a command to a trusted backend that validates current state rather than allowing arbitrary client overwrite.

## Common mistakes

- Treating “Firebase realtime” as one product with one data model or guarantee.
- Treating a push notification as proof that a user saw it or that business state has been synchronized.
- Enabling direct client database access without rules that enforce per-record authorization and validation.
- Assuming cached data is fresh while offline or failing to indicate cache/server metadata to the user.
- Using last-write-wins for noncommutative business operations without reviewing data-loss consequences.
- Sending sensitive records in push payloads when the device can instead fetch them after authorization.

## Knowledge checks with answers

1. **What is the source of truth when using FCM?** The backend database or service; FCM is a delivery/notification mechanism.
2. **Does Firebase Authentication by itself prevent one user reading another user’s data?** No. Database Security Rules must enforce authorization on each read/write.
3. **What happens to concurrent offline edits to the same Firestore document under the documented behavior?** When changes synchronize, the last write wins; applications needing merge semantics must design them explicitly.
4. **When is Firebase Realtime Database appropriate?** When its synchronized JSON tree and access patterns fit, and its rules, query model, offline behavior, and operating limits meet the requirements.
