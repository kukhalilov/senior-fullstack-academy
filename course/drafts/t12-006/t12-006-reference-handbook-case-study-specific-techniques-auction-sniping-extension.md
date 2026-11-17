# end-to-end system design case studies — Reference: Auction sniping extension

Sources: [HLD Handbook](https://hld.handbook.academy/), [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html), [RFC 3339: Date and Time on the Internet](https://www.rfc-editor.org/rfc/rfc3339.html).

## Scope and version

This is a system-design case study for an auction rule that extends the closing deadline when a qualifying bid arrives near the end. It is not a universal auction policy: the extension window, qualification rules, maximum extension, and settlement behavior are product decisions that must be disclosed. Database examples are conceptual; use the chosen store’s current transaction and concurrency documentation.

## How this group fits the mental model

An auction has one authoritative state: current deadline, accepted bids, and status. A “sniping extension” aims to give other bidders time to respond to a bid near closing. It changes the state transition rule, not merely the countdown display. Every bid near the deadline must be ordered consistently with closing so the system cannot accept a bid after declaring the auction closed, or close while a qualifying bid is being committed.

The server’s persisted deadline is authoritative. Client clocks and countdowns are presentation hints and can be skewed, paused, or stale. State the rule in precise terms, such as: accept a bid only if server receive/commit time is before the current deadline; if the bid qualifies and falls within the configured extension window, set deadline to the later of the existing deadline and `acceptedBidTime + extension`, subject to any published cap. Other policies are possible, but must be unambiguous and consistently implemented.

## Supplied names explained

- **Extension window:** interval before the current deadline during which a qualifying bid extends the auction.
- **Extension duration:** amount added by a qualifying bid. Clarify whether repeated bids reset from the new end, add cumulatively, or only extend to a fixed later point.
- **Maximum end/cap:** optional bound preventing indefinite extension; explain whether it is measured from original close or another point.
- **Authoritative server time:** time source used by the state transition. Store timestamps with an explicit timezone/UTC policy and use a monotonic ordering/version mechanism for concurrent updates where needed.
- **Atomic bid transition:** validation, bid acceptance, current-price/leader update, deadline extension, and durable event creation must obey the chosen transactional boundary.
- **Idempotency and ordering:** stable request ID prevents a client retry from creating duplicate bids; a deterministic ordering policy handles simultaneous bids, tie rules, and event replay.

## Cross-item comparison

| Close rule | User experience | Operational implications |
| --- | --- | --- |
| Hard close at fixed deadline | Simple, predictable end time; late bids can win without response time | Must define the exact boundary and order bids racing with close |
| Rolling extension | Qualifying late bids provide a response window | Auction may run indefinitely without a cap; every accepted bid may move the deadline |
| Fixed capped extension | Gives a response window while bounding maximum duration | Bids near the cap may get less than the nominal extension; this must be communicated clearly |
| Proxy/max bidding | Participants submit a maximum; system automatically bids under disclosed increments | Changes the bidding model; requires secure maximum handling and deterministic bid-price rules, independent of close extension |

## Examples

The auction closes at 12:00:00 UTC, has a 2-minute qualifying window, and grants a 2-minute extension. A bid accepted at 11:59:20 qualifies; the new deadline becomes 12:01:20. A bid accepted at 12:01:00 then qualifies under a rolling rule and moves the deadline to 12:03:00. If the policy caps the end at 12:10:00, no accepted bid may push it past that cap. The user interface should show the server-confirmed new deadline and explain the cap behavior.

To avoid a close/bid race, serialize state transitions for one auction (for example, with a row lock, compare-and-swap version, or serializable transaction) so bid acceptance and closing compete through one authoritative rule. If the bid request times out, return/query its durable status using an idempotency key; do not submit another logically distinct bid automatically. Publish notifications from committed state so clients do not display a deadline extension for a bid that later rolled back.

Test simultaneous bids, request retries, delayed network delivery, a close worker running concurrently, clock skew, transaction retry, service failover, and replayed notifications. Audit event timestamps and state versions so disputes can be reconstructed. Do not promise “server received” semantics unless the system can define which timestamp is used and establish a reliable ordering at the authoritative service.

## Common mistakes

- Extending only the browser countdown while persisted close logic still uses the original deadline.
- Using each client’s clock or a loosely synchronized application server timestamp as the unquestioned authority.
- Accepting a bid and updating the deadline in separate non-atomic operations.
- Letting a close job race with a final bid without a serialized state transition.
- Adding the extension duration repeatedly without a disclosed cap, allowing auction duration to grow without bound.
- Describing a “two-minute extension” without clarifying rolling, cumulative, capped, or original-deadline semantics.
- Emitting a notification before the bid/deadline transaction commits, leaving a false UI state after rollback.
- Retrying a timed-out bid as a new bid and accidentally charging or ranking it twice.
- Ignoring timezone serialization, daylight-saving display changes, or client/server countdown skew.

## Knowledge checks with answers

1. **A qualifying bid and close job execute simultaneously. What determines the winner?** One authoritative serialized state transition and a documented time/order boundary; whichever operation linearizes first according to that rule determines whether the bid is accepted.
2. **Why is the browser countdown not authoritative?** Client time and rendering can lag or be manipulated; the accepted deadline lives in server-controlled auction state.
3. **How do you prevent a retry from creating a second bid?** Use an idempotency/request identity and return the previously committed outcome for the same logical bid.
4. **Why define an extension cap?** A rolling extension can otherwise keep an auction open indefinitely; whether and how a cap applies is a product policy that must be explicit.

## Review status

The concurrency-control examples are checked against PostgreSQL’s official transaction/locking documentation; timestamp interchange is framed with RFC 3339. Auction rules are explicitly presented as policy choices rather than universal standards. This lesson remains pending full claim-by-claim audit and manifest omission check.
