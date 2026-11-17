# system design foundations and infrastructure building blocks — Reference: APNs

Sources: [Set up a remote notification server](https://developer.apple.com/documentation/usernotifications/setting-up-a-remote-notification-server), [Send notification requests](https://developer.apple.com/documentation/usernotifications/sending-notification-requests-to-apns), [Handle APNs responses](https://developer.apple.com/documentation/usernotifications/handling-notification-responses-from-apns), [Token-based authentication](https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns), [Register an app for remote notifications](https://developer.apple.com/documentation/usernotifications/registering-your-app-with-apns).

## Scope and version

This lesson covers Apple's Apple Push Notification service (APNs) provider API for sending remote notifications to Apple platforms. Apple may update API requirements, authentication details, and error reasons; check current Apple documentation. APNs is a best-effort notification transport, not a durable application message queue and not proof that a person saw or acted on a notification.

## How this group fits the mental model

Your server owns the business event, such as “a package shipped.” APNs is a delivery path that asks a device to present or process a notification. The application registers with APNs and receives a device token. It sends that token to its provider server, which associates the token with an account/device and later sends a payload through APNs. The app handles the notification or fetches current authoritative state from your API.

APNs uses an HTTP/2 provider API over TLS. Requests include the device token in the path, a topic identifying the app/service, headers controlling push type, priority, expiration, and optionally collapse behavior, plus a JSON payload. Providers authenticate with token-based or certificate-based trust. A successful HTTP response means APNs accepted the request; delivery can be delayed, reordered, coalesced, expired, or not occur while a device is unavailable. The device OS and user settings also affect presentation.

Treat notifications as hints or wake-up signals when correctness matters. Store the business event in your own database/queue, make device sync idempotent, and let the app fetch current state. For replaceable state such as “unread count changed,” collapse/coalesce notifications. For events that must each be processed, retain them in an application-owned durable stream and have clients sync by cursor; APNs alone does not provide that event log.

## Supplied names explained

- `APNs` — Apple Push Notification service, which accepts provider requests and attempts to deliver notification payloads to registered Apple devices.

## Cross-item comparison

| Need | APNs role | Application responsibility |
| --- | --- | --- |
| Alert a user about a new event | Best-effort push delivery to an app/device | Persist event, handle delayed/missing/reordered notifications, and fetch authoritative state |
| Replace multiple obsolete updates | Collapse identifier can let APNs coalesce notifications for a topic/device | Use only when latest state supersedes earlier alerts; do not use it for independent events that must all be shown |
| Deliver a durable job or audit event | APNs is not the durable queue | Use a database outbox or message broker with retries, retention, consumer checkpoints, and idempotency |
| Wake an app to synchronize | Push can be a signal to fetch updates | Respect platform background execution limits and always support later sync when a push is delayed or suppressed |
| Support Apple and non-Apple devices | APNs handles Apple ecosystem delivery | Put providers behind a notification abstraction while preserving provider-specific payload and receipt semantics |

## Examples

### Send a shipment update

1. Commit the shipment state change and a notification event atomically in your database using an outbox pattern.
2. A worker reads the outbox and sends a push request with the device token, correct topic/push type, bounded expiration, and payload containing an event ID or minimal display information.
3. Record APNs's response. Retry transient conditions with bounded backoff; correct permanent errors and stop using tokens Apple reports as no longer valid at the supplied timestamp.
4. The app receives the push and fetches the latest shipment state from the API. The event ID makes duplicate processing harmless.
5. If the user has multiple obsolete “status changed” notifications pending, a collapse identifier can let APNs retain a single current notification. Do not collapse distinct messages such as separate security alerts.

### Manage tokens as changing registrations

The app obtains a token from APNs and sends it to your provider. Store it with app topic/environment and the associated installation/account context, support token updates, and remove or deactivate stale registrations based on APNs responses and app lifecycle. Do not treat a token as a permanent user identity: users can reinstall, restore, switch accounts, or register another device. Avoid logging raw tokens and protect provider signing keys/certificates as secrets.

### Respect expiration and delivery semantics

Set expiration according to whether a delayed notification still has value. A “live now” match update may expire quickly; a package status alert may remain useful longer. APNs documents best-effort behavior, possible reordering, and storage for a bounded duration based on the expiration header. Since acceptance does not prove device receipt or display, the app should recover from missed pushes by syncing from the server.

## Common mistakes

- Treating HTTP success from APNs as proof that a notification was displayed or read.
- Using APNs as the only storage for a message that must be delivered and processed exactly once.
- Assuming notifications arrive in send order or that every pending notification will be delivered.
- Reusing a collapse identifier for distinct events that must all be visible.
- Treating the device token as a stable user ID or failing to associate it with environment/topic and installation state.
- Retrying every error indefinitely. Distinguish invalid tokens/payload/authentication from transient service or connection errors using Apple's response reason and status.
- Using a long expiration for time-sensitive alerts, or a short expiration for notifications that remain useful offline.
- Sending large or sensitive business data in the payload when the app can fetch it from an authenticated API.
- Ignoring APNs connection lifecycle, HTTP/2 stream limits, token refresh requirements, GOAWAY, and credential revocation handling.

## Knowledge checks with answers

1. **What does a successful APNs provider response prove?** APNs accepted the request; it does not prove device delivery, display, or user action.
2. **Where should a must-not-lose event live?** In your own durable database/queue or event log. APNs can notify the app to synchronize but is not the event's source of truth.
3. **When is a collapse identifier appropriate?** When multiple pending updates represent replaceable state and only the newest alert is useful; not when each event must be independently presented.
4. **How should an invalid token response be handled?** Use the reason and timestamp semantics in Apple's response guidance to deactivate the stale registration, then accept updated registrations from the app.
5. **Why should an app fetch state after a push?** Push delivery can be delayed, reordered, coalesced, or unavailable; the server API remains authoritative and synchronization can recover missed updates.

## Practice

Design notification delivery for a banking app with transaction alerts, marketing messages, and one-time security codes. Define separate expiration/collapse rules, token registration and account-switch behavior, durable event storage, provider-worker retries, invalid-token cleanup, payload sensitivity, app synchronization, and observability. State which notification types can be delayed, coalesced, or safely omitted.
