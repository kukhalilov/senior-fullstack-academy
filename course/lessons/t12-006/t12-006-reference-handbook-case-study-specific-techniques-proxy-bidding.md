# end-to-end system design case studies — Reference: Proxy bidding

Sources: [eBay automatic bidding](https://www.ebay.com/help/buying/auctions-bidding/bidding-works?id=4014), [eBay bidding API guide](https://developer.ebay.com/develop/guides/buy/checkout-bid-guide), [PostgreSQL transaction isolation](https://www.postgresql.org/docs/18/transaction-iso.html), [Redis Lua scripting](https://redis.io/docs/latest/develop/programmability/eval-intro/), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

Proxy bidding accepts a bidder’s confidential maximum and automatically raises the displayed bid only as needed under the auction’s published rules. eBay is a product example; its increment table, tie-breaking, API capabilities, and auction policy are not universal. A platform must define its own rules and keep bidder maximums confidential.

## How this group fits the mental model

There are two values: each bidder’s private maximum and the public current price/leader. When a new maximum arrives, the auction engine compares it with the current leading maximum and applies its own bid-increment schedule. The winning displayed price may be below the winner’s maximum. The maximum is authorization for future automatic bids, not a price that should be broadcast to competitors.

Correctness requires an ordered decision for each auction. Concurrent maximum changes must not both evaluate against the same stale leader and publish contradictory winners. Store auction state in an authoritative transactional system or execute a bounded atomic compare/update in a single-shard state store, and append an audit event. Define tie policy, minimum increments, reserve price, close time, bid retraction rules, and what happens when two requests race with close. A maximum bid should be encrypted/protected at rest, excluded from ordinary logs and analytics, and visible only to services and staff with a need to know.

## Supplied names explained

- **Proxy/automatic bid:** a stored maximum limit from which the platform emits the minimum bid needed to remain competitive under its published rules.
- **Maximum bid:** private limit; it should not be exposed through public APIs, events, or client-visible error details.
- **Displayed/current price:** public auction amount, derived from the leading and competing maximums plus the increment policy.
- **Bid increment table:** deterministic rule mapping price ranges to minimum legal step; version it or snapshot it with the auction so later changes do not silently alter active auctions.
- **Tie-breaking:** explicit rule for equal maximums, often based on order accepted by the service; the rule must use a trusted serialization point, not client clocks.
- **Idempotency key:** lets a bidder safely retry an ambiguous request without storing the same logical maximum as multiple actions.
- **Audit trail:** durable record of bid acceptance, rule version, auction state transition, and result for support and disputes; protect private maximums in that record too.

## Cross-item comparison

| Auction approach | User experience | System requirement |
| --- | --- | --- |
| Manual bidding | User submits each new public bid | Handle repeated requests and concurrent updates; no automatic proxy behavior |
| Proxy bidding | User submits a private cap once; system raises bid as needed | Secure maximum storage, deterministic auction ordering, privacy-safe observability |
| First-price sealed bid | Bidders submit hidden offers and winner pays own offer under defined rules | Sealed submission and close-time processing; fundamentally different price rule |
| Second-price style auction | Winner’s payment derives from next-best offer plus rule-specific adjustment | Precise reserve/tie/increment rules and auditability; do not assume it is equivalent to every proxy-bid implementation |

## Examples

The leading bidder’s maximum is 80 and current price is 52. Another bidder submits a maximum of 65. The engine keeps the first bidder leading and raises the displayed price only according to the applicable increment rule, never exposing the private 80 maximum. If a third bidder submits 90, the new bidder becomes leader and the displayed amount is derived from the previous maximum plus the rule’s increment, subject to the new bidder’s cap. The exact number depends on the auction’s published rules; the engine should compute it in one serialized state transition and record the decision.

If a client times out after submitting a maximum, the server may have accepted it. The client retries with the same idempotency key and receives the original outcome. If the auction closes at nearly the same moment, a single authoritative ordering determines whether the bid was accepted before the close boundary. A late event must not reopen a closed auction unless the rules explicitly define an extension mechanism.

## Common mistakes

- Revealing the maximum to other bidders in API payloads, logs, telemetry, or support tooling.
- Assuming a proxy-bid system always charges the winner the full maximum or always implements a textbook second-price auction.
- Using browser timestamps to decide which equal bid arrived first.
- Checking auction state and writing the leader in separate unprotected operations.
- Retrying after a timeout with a new request identity and creating ambiguous duplicate actions.
- Changing increments or close rules mid-auction without versioning or preserving the original contract.
- Emitting public bid events before the durable decision commits.
- Treating fraud, eligibility, payment authorization, settlement, and auction ordering as one concern.

## Knowledge checks with answers

1. **Is the private maximum the public current price?** No. It is an upper limit used by the engine; the current price is derived according to auction rules.
2. **Why must tie handling use a server-side order?** Client clocks and network delays are not a trustworthy global ordering; the auction needs a defined serialized decision point.
3. **What should a client do after a submission timeout?** Retry with the same idempotency identity or query the result, because the outcome may already have committed.
4. **Does the term “proxy bidding” define a universal pricing formula?** No. The platform must specify increments, tie policy, reserves, close semantics, and payment rules.
