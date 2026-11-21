# system design foundations and infrastructure building blocks — Reference: Firebase Cloud Messaging (FCM)

Sources: [FCM overview](https://firebase.google.com/docs/cloud-messaging), [Message types](https://firebase.google.com/docs/cloud-messaging/customize-messages/set-message-type), [Message lifespan](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-lifespan), [Collapsible messages](https://firebase.google.com/docs/cloud-messaging/customize-messages/collapsible-message-types), [Message priority](https://firebase.google.com/docs/cloud-messaging/customize-messages/setting-message-priority), [Android priority](https://firebase.google.com/docs/cloud-messaging/android-message-priority), [Delivery behavior and reporting](https://firebase.google.com/docs/cloud-messaging/understand-delivery), [Registration token management](https://firebase.google.com/docs/cloud-messaging/manage-tokens), [Throttling and quotas](https://firebase.google.com/docs/cloud-messaging/throttling-and-quotas), [Apple-platform receiving](https://firebase.google.com/docs/cloud-messaging/ios/receive-messages).

## Scope and version

This lesson explains Firebase Cloud Messaging as a cross-platform transport for sending messages to Android, Apple, and web clients. APIs, quotas, platform support, and delivery behavior can change; check current Firebase and platform documentation. FCM acceptance is not proof that a message reached the device or that the user saw it. FCM is not an application-owned durable event log.

## How this group fits the mental model

Your application owns the business event and current state. FCM provides a path to notify a client or ask it to synchronize. A client app registers and obtains a registration token, sends the token to your backend, and your backend sends a message through the FCM HTTP v1 API or Admin SDK. FCM routes it to the platform transport. On delivery, client behavior depends on message type, app state, OS restrictions, and platform-specific configuration.

FCM supports notification messages, data messages, and combinations. On Android, a notification message is automatically displayed by the SDK/system when the app is backgrounded; data-only messages are handled by application code, subject to background limits. In the foreground, the app decides presentation. On Apple platforms FCM uses APNs, and silent/background notifications are not guaranteed to run. Payloads are limited to 4 KB. Cross-platform messages can carry platform-specific options, so define common intent in your domain event and build/validate each platform payload separately.

Messages have priority and time-to-live semantics. On Android, high priority is for time-sensitive, user-visible work; repeated high-priority messages that do not result in visible notifications may be deprioritized or proxied. For Apple data messages, priority must be 5 (normal); high priority is rejected. Current Android guidance also introduces `AndroidConfigV2`, where delivery urgency is selected by message type such as `RemoteNotification` or `BackgroundSync` rather than an explicit priority field; verify API availability and migration guidance. Android and Web TTL can be up to four weeks; Apple delivery expiry is expressed through APNs configuration. Collapse behavior is platform-specific: Android allows at most four simultaneous collapse keys per registration token, and notification messages are always collapsible and ignore the Android `collapse_key`. Android can store up to 100 non-collapsible messages while offline; if that limit is exceeded, stored messages are discarded and the app is signaled to resync. Ordering is not guaranteed. Clients should use event IDs/cursors and fetch authoritative server state to recover from missed, duplicate, delayed, or reordered pushes.

## Supplied names explained

- `Firebase Cloud Messaging (FCM)` — Google's cross-platform messaging service that accepts downstream messages and attempts to route them to registered Android, Apple, and web clients.

## Cross-item comparison

| Mechanism | Appropriate role | Limitation |
| --- | --- | --- |
| FCM push | Notify or wake a client, deliver a small user-visible alert, or signal that data changed | Best-effort/asynchronous; not a durable per-event queue or proof of display |
| Android notification message | Platform/SDK display path for user-visible messages, including background handling | Automatically collapsible; Android `collapse_key` is ignored for notification messages; foreground display is app-controlled |
| Android data message | App-controlled payload processing | Background execution is bounded; high priority is for user-visible urgency, not arbitrary background work |
| Apple silent/background push through FCM | APNs-backed signal for background refresh | Apple does not guarantee background-notification delivery or execution; data-message priority must be normal (5) |
| APNs directly | Provider API for Apple push delivery | Apple-specific provider contract; app still needs durable state and synchronization |
| Durable queue/event log | Store events that must be processed, replayed, audited, or retried | Consumers must be idempotent; queue delivery is a separate concern from notifying a device |
| Client polling/sync API | Recover state after missed pushes and maintain authoritative client state | Adds periodic request load and latency; use cursors/ETags to avoid full downloads |

## Examples

### Notify about an order status change

1. Commit the order transition and an outbox event in one database transaction.
2. A worker sends FCM messages to currently registered device tokens with an event ID, a suitable TTL, and platform-specific notification/data configuration.
3. Record send responses and metrics; a returned message ID means accepted, not delivered. Retry transient failures with bounded backoff. Remove or refresh invalid registration tokens according to current FCM response guidance.
4. The app deduplicates using the event ID and fetches the latest order state from the authenticated API. A missed push does not lose the business event because it remains in the outbox/order history.
5. If several pending updates mean only “the latest order state changed,” use an appropriate collapse behavior. Keep security alerts or separate transactions as distinct events.

### Select notification or data message

For a user-visible “Your ride arrived” alert, a notification payload can allow platform display behavior while the app is backgrounded. For silent synchronization, a data message asks the app to run code, but background execution may be delayed, restricted, or unavailable. Do not make a critical server-side transition depend on the client executing a silent message.

### Handle a device offline

Set TTL based on how long the message remains useful. A live auction price update may have no value after a few seconds; a monthly statement notice may remain useful much longer. If the device is offline, FCM may retain messages according to TTL and platform-specific collapse rules. Android and Web TTL is at most 28 days; Apple delivery expiry is passed through APNs configuration. The app must still sync on next launch because delivery/order are not guaranteed.

## Common mistakes

- Treating a returned FCM message ID as delivery confirmation; it means the request was accepted for delivery.
- Using FCM as the only copy of business events that must not be lost.
- Assuming Android, iOS, and web clients handle the same payload and priority the same way.
- Assuming collapse behavior is uniform across platforms. Android notification messages are always collapsible and ignore `collapse_key`; data-message collapse limits and Apple `apns-collapse-id` have their own semantics.
- Assuming silent/background pushes always wake Apple apps, or that an FCM data message can use high priority on Apple platforms. Apple does not guarantee background delivery, and Apple data messages must use priority 5.
- Using high priority for non-urgent background synchronization, risking platform throttling or policy mismatch.
- Setting a long TTL for ephemeral data or collapsing messages that represent separate events.
- Assuming ordering or exactly-once client handling. Use event IDs, deduplication, cursors, and authoritative sync.
- Keeping registration tokens forever or associating one token with one permanent human identity; tokens rotate and installations/accounts change.
- Sending confidential business records in the push payload instead of a minimal hint followed by authenticated fetch.
- Ignoring FCM quotas, per-device limits, retry-after/error guidance, token cleanup, and platform delivery analytics.
- Assuming Android registration tokens expire on the same schedule for every platform. FCM invalidates Android registrations after 270 days of inactivity; Apple registrations are governed by APNs and do not use that same 270-day inactivity rule.
- Sending oversized payloads. FCM message payloads are limited to 4096 bytes; put larger content behind authenticated application APIs.

## Knowledge checks with answers

1. **What does FCM acceptance mean?** FCM accepted the send request; it does not prove device delivery, display, or user interaction.
2. **When should data live outside FCM?** Whenever the event must be durable, replayable, audited, or eventually processed. Store it in your database/queue and use FCM as a notification path.
3. **What does TTL control?** How long a message remains eligible for delivery while a device is unavailable; it should reflect the data's useful lifetime.
4. **When are collapse keys appropriate?** For replaceable state updates where the latest pending message supersedes older ones, not for independent events that must all be processed.
5. **Why does message type matter?** Notification and data messages have different platform/client handling, especially when an app is backgrounded; platform rules constrain execution.
6. **What happens to Android collapse keys and non-collapsible backlog?** FCM keeps at most four distinct collapse keys per registration token. Android can queue 100 non-collapsible messages; if exceeded, pending messages are discarded and the app should perform a full sync.
7. **How long can FCM retain Android/Web messages?** Up to four weeks; use zero TTL for messages that should not be stored for later delivery. For Apple platforms configure APNs expiration.
8. **Does an Android token cleanup rule apply to Apple registrations?** No. Android registrations expire after 270 days of inactivity; Apple token lifecycle follows APNs and does not share that rule.

## Practice

Design push for a collaborative task app on Android, iOS, and web. Separate user-visible alerts from silent sync signals. Define outbox delivery, payload fields, event IDs, TTL, collapse behavior, priorities per platform, token rotation/account switching, invalid-token cleanup, retry policy, client deduplication, and recovery through a cursor-based sync API. State what happens if the device never receives a push.
