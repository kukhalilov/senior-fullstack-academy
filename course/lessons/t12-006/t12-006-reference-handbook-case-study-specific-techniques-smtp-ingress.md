# end-to-end system design case studies — Reference: SMTP ingress

Sources: [RFC 5321: Simple Mail Transfer Protocol](https://www.rfc-editor.org/rfc/rfc5321.html), [RFC 6409: Message Submission for Mail](https://www.rfc-editor.org/rfc/rfc6409.html), [RFC 3207: SMTP STARTTLS](https://www.rfc-editor.org/rfc/rfc3207.html), [RFC 8461: SMTP MTA Strict Transport Security](https://www.rfc-editor.org/rfc/rfc8461.html), [RFC 5322: Internet Message Format](https://www.rfc-editor.org/rfc/rfc5322.html).

## Scope and version

SMTP ingress accepts messages from other mail transfer agents (MTAs) for local delivery or onward relay. SMTP relay normally uses TCP port 25. User submission is a separate service with distinct policy, normally on port 587, as described by RFC 6409. This lesson covers an MTA boundary and its queue; it does not claim one universal spam, reputation, or mailbox-delivery product design.

## How this group fits the mental model

Inbound mail is an asynchronous delivery protocol. A sending MTA looks up the recipient domain’s MX records, connects to a receiving MTA, negotiates SMTP capabilities, provides an envelope sender and one or more recipients, then transfers message content. The receiving service validates policy and capacity and decides whether to reject, defer, or accept. Once it sends a final success reply after `DATA`, RFC 5321 says it has accepted responsibility for delivering or relaying the message; the implementation must not acknowledge a message it has no reliable way to retain.

The receiver’s acceptance boundary should therefore align with durable queue persistence or a replicated equivalent. Mailbox delivery, malware scanning, routing, and downstream relay can happen asynchronously after acceptance, with retry and dead-letter/operations paths. An SMTP response is not an end-user read receipt and does not promise the recipient will read the message.

## Supplied names explained

- **SMTP ingress**: the publicly reachable receiving MTA path for mail destined to hosted domains. It should accept local recipients and explicitly authorized relay paths, not act as an open relay.
- **MX lookup**: DNS resolution selects a receiving domain’s mail exchangers, with priority and fallback behavior. Cache DNS according to TTLs and handle temporary lookup failures differently from a domain with no mail route.
- **`EHLO` / `HELO`**: client greeting and extension negotiation. Capabilities may include `STARTTLS`, `PIPELINING`, `SIZE`, `8BITMIME`, or `SMTPUTF8`; negotiate only features actually supported.
- **`STARTTLS`**: upgrades the current SMTP connection to TLS when advertised and negotiated. Opportunistic TLS can encrypt a connection when supported, but does not by itself guarantee authenticated TLS to every destination. MTA-STS or DANE can provide policy mechanisms when deployed correctly.
- **SMTP envelope**: `MAIL FROM` reverse path plus one or more `RCPT TO` forward paths. These transport recipients are separate from message header fields such as `From:` and `To:`; a message can have BCC recipients absent from visible headers.
- **`DATA`**: begins transfer of message content. The client ends the data with the SMTP terminator; dot-stuffing and CRLF rules apply. The server’s final reply determines whether it accepted responsibility.
- **4xx / 5xx replies**: temporary failures invite retry; permanent failures indicate retrying the same request is not expected to succeed. Choose codes carefully because sender MTAs control retry schedules.
- **Message queue**: durable state for accepted messages not yet delivered. Queue IDs, retry schedule, recipient-level status, expiration, and operator visibility support reliable recovery.
- **Message submission (MSA)**: authenticated client-facing send path, usually port 587, governed by submission policy. Do not conflate this with unauthenticated MTA-to-MTA relay on port 25.

## Cross-item comparison

SMTP is store-and-forward message transport with retrying peers; HTTP webhooks are request/response integrations with different delivery, timeout, and retry contracts. A message broker usually serves application-controlled producers and consumers, while public SMTP must interoperate with independent MTAs and email-specific DNS, reputation, bounce, and policy mechanisms. SMTP does not guarantee exactly-once delivery: after a lost final acknowledgement, a sender may retry and the receiver can see a duplicate.

Separate ingress from user submission so public mail relay, account authentication, and outbound abuse controls can have distinct policies. Keep delivery queues partitioned or prioritized where one slow recipient domain should not block all traffic. Store per-recipient outcomes because one SMTP transaction can have several recipients with different acceptance results.

## Examples

An external MTA connects on port 25, sends `EHLO`, negotiates TLS if available, then sends `MAIL FROM`, `RCPT TO`, and `DATA`. The receiving service checks that the recipient is hosted, applies connection/message-size and abuse policies, writes the accepted message and recipient state to durable queue storage, and only then sends the final success response. A delivery worker later connects to the mailbox service or remote MTA. A temporary downstream outage schedules retry with bounded backoff; a permanent failure creates an appropriate delivery status notification (DSN) where protocol rules and policy require it.

If the receiver stores the message but its final `250` response is lost, the sending MTA may retry. Use stable queue identifiers and duplicate heuristics cautiously; content-based suppression can incorrectly discard legitimate identical messages. Make downstream processing idempotent where possible, but preserve email semantics and recipient-specific delivery outcomes.

## Common mistakes

- Returning final `250` before accepted content is durably retained.
- Treating port 25 relay and port 587 authenticated message submission as one policy surface.
- Allowing arbitrary relay and becoming an open relay.
- Confusing RFC 5322 `From:`/`To:` headers with SMTP envelope addresses.
- Assuming STARTTLS alone guarantees authenticated transport or blocks downgrade attacks.
- Treating a lost SMTP response as proof that the peer did not accept the message.
- Retrying permanent 5xx failures indefinitely or giving temporary 4xx failures permanent semantics.
- Ignoring queue age, disk capacity, per-domain deferrals, and bounce loops.
- Claiming email is delivered to a human merely because an SMTP server accepted it.

## Knowledge checks with answers

1. **What does a final `250` after DATA mean?** The receiving SMTP server accepted responsibility for the message; it must retain and deliver or relay it according to protocol requirements.
2. **Why separate port 25 and port 587?** Relay between MTAs and authenticated client submission need different trust, authentication, and abuse policies.
3. **Are the `To:` header and `RCPT TO` always identical?** No. The SMTP envelope controls transport recipients; headers are message content and can differ, including BCC behavior.
4. **Can SMTP provide exactly-once delivery?** No. A lost acknowledgement can cause a retry after the message was accepted, so duplicate handling is a system concern.
