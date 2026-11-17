# system design foundations and infrastructure building blocks — Reference: Firebase Cloud Messaging (FCM)

Sources: [FCM overview](https://firebase.google.com/docs/cloud-messaging), [Message types](https://firebase.google.com/docs/cloud-messaging/customize-messages/set-message-type), [Message lifespan](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan), [Collapsible messages](https://firebase.google.com/docs/cloud-messaging/customize-messages/collapsible-message-types), [Message priority](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-priority), [Delivery behavior and reporting](https://firebase.google.com/docs/cloud-messaging/understand-delivery), [Registration token management](https://firebase.google.com/docs/cloud-messaging/manage-tokens).

## Scope and version

This lesson explains Firebase Cloud Messaging as a cross-platform transport for sending messages to Android, Apple, and web clients. APIs, quotas, platform support, and delivery behavior can change; check current Firebase and platform documentation. FCM acceptance is not proof that a message reached the device or that the user saw it. FCM is not an application-owned durable event log.

## How this group fits the mental model

Your application owns the business event and current state. FCM provides a path to notify a client or ask it to synchronize. A client app registers and obtains a registration token, sends the token to your backend, and your backend sends a message through the FCM HTTP v1 API or Admin SDK. FCM routes it to the platform transport. On delivery, client behavior depends on message type, app state, OS restrictions, and platform-specific configuration.

FCM supports notification messages, data messages, and combinations. Notification messages may be displayed automatically by the platform SDK when the app is backgrounded; data messages are handled by application code, subject to background execution constraints. Cross-platform messages can carry platform-specific options, so define common intent in your domain event and build/validate each platform payload separately.

Messages have priority and time-to-live semantics. Higher priority is intended for urgent, user-visible work and is subject to platform-specific behavior and limits. Expiration determines how long an offline message remains useful. Collapse keys let replaceable updates coalesce while a device is unavailable; they are inappropriate for distinct events that must each be processed. Ordering is not guaranteed. Clients should use event IDs/cursors and fetch authoritative server state to recover from missed, duplicate, delayed, or reordered pushes.

## Supplied names explained

- `Firebase Cloud Messaging (FCM)` — Google's cross-platform messaging service that accepts downstream messages and attempts to route them to registered Android, Apple, and web clients.

## Cross-item comparison

| Mechanism | Appropriate role | Limitation |
| --- | --- | --- |
| FCM push | Notify or wake a client, deliver a small user-visible alert, or signal that data changed | Best-effort/asynchronous; not a durable per-event queue or proof of display |
| APNs directly | Provider API for Apple push delivery | Apple-specific provider contract; app still needs durable state and synchronization |
| Durable queue/event log | Store events that must be processed, replayed, audited, or retried | Consumers must be idempotent; queue delivery is a separate concern from notifying a device |
| Client polling/sync API | Recover state after missed pushes and maintain authoritative client state | Adds periodic request load and latency; use cursors/ETags to avoid full downloads |

## Examples

### Notify about an order status change

1. Commit the order transition and an outbox event in one database transaction.
2. A worker sends FCM messages to currently registered device tokens with an event ID, a suitable TTL, and platform-specific notification/data configuration.
3. Record send responses and metrics; retry transient failures with bounded backoff. Remove or refresh invalid registration tokens according to current FCM response guidance.
4. The app deduplicates using the event ID and fetches the latest order state from the authenticated API. A missed push does not lose the business event because it remains in the outbox/order history.
5. If several pending updates mean only “the latest order state changed,” use an appropriate collapse behavior. Keep security alerts or separate transactions as distinct events.

### Select notification or data message

For a user-visible “Your ride arrived” alert, a notification payload can allow platform display behavior while the app is backgrounded. For silent synchronization, a data message asks the app to run code, but background execution may be delayed, restricted, or unavailable. Do not make a critical server-side transition depend on the client executing a silent message.

### Handle a device offline

Set TTL based on how long the message remains useful. A live auction price update may have no value after a few seconds; a monthly statement notice may remain useful much longer. If the device is offline, FCM may retain messages according to TTL and collapse rules, but the app must still sync on next launch because delivery/order are not guaranteed.

## Common mistakes

- Treating a returned FCM message ID as delivery confirmation; it means the request was accepted for delivery.
- Using FCM as the only copy of business events that must not be lost.
- Assuming Android, iOS, and web clients handle the same payload and priority the same way.
- Using high priority for non-urgent background synchronization, risking platform throttling or policy mismatch.
- Setting a long TTL for ephemeral data or collapsing messages that represent separate events.
- Assuming ordering or exactly-once client handling. Use event IDs, deduplication, cursors, and authoritative sync.
- Keeping registration tokens forever or associating one token with one permanent human identity; tokens rotate and installations/accounts change.
- Sending confidential business records in the push payload instead of a minimal hint followed by authenticated fetch.
- Ignoring FCM quotas, per-device limits, retry-after/error guidance, token cleanup, and platform delivery analytics.

## Knowledge checks with answers

1. **What does FCM acceptance mean?** FCM accepted the send request; it does not prove device delivery, display, or user interaction.
2. **When should data live outside FCM?** Whenever the event must be durable, replayable, audited, or eventually processed. Store it in your database/queue and use FCM as a notification path.
3. **What does TTL control?** How long a message remains eligible for delivery while a device is unavailable; it should reflect the data's useful lifetime.
4. **When are collapse keys appropriate?** For replaceable state updates where the latest pending message supersedes older ones, not for independent events that must all be processed.
5. **Why does message type matter?** Notification and data messages have different platform/client handling, especially when an app is backgrounded; platform rules constrain execution.

## Practice

Design push for a collaborative task app on Android, iOS, and web. Separate user-visible alerts from silent sync signals. Define outbox delivery, payload fields, event IDs, TTL, collapse behavior, priorities per platform, token rotation/account switching, invalid-token cleanup, retry policy, client deduplication, and recovery through a cursor-based sync API. State what happens if the device never receives a push.
