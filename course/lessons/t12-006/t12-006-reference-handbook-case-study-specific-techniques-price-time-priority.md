# end-to-end system design case studies — Reference: Price-time priority

Sources: [CME Globex supported matching algorithms](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457218479/Supported+Matching+Algorithms), [CME Globex matching algorithm steps](https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457218521/CME+Globex+Matching+Algorithm+Steps), [CME matching algorithm overview](https://www.cmegroup.com/education/matching-algorithm-overview).

## Scope and version

Price-time priority is one matching rule used by some electronic markets. It means price is considered first, then time priority among orders at the same price, subject to that venue’s exact order types, allocation rules, and modification policy. It is not universal: exchanges may offer FIFO, pro-rata, allocation hybrids, or product-specific algorithms. The venue rulebook and instrument configuration are authoritative.

## How this group fits the mental model

An order book groups resting buy orders (bids) from highest price to lowest and sell orders (asks) from lowest price to highest. A crossing incoming order can trade against eligible resting liquidity. Under strict price-time priority, the best-priced eligible resting order matches first; within one price level, the oldest eligible order matches first. The rule supplies deterministic allocation and an incentive to post early at a price, but it does not decide whether an order is valid, risk-approved, or in a particular market state.

For a buy marketable limit order with limit price `L`, it can match asks whose prices are at most `L`, starting at the lowest ask. For a sell limit order, it can match bids at or above its limit, starting at the highest bid. The remainder may rest if its time-in-force permits. Market orders, auctions, self-trade prevention, reserve quantity, implied liquidity, and special order types can change the path; consult the applicable venue rules.

## Supplied names explained

- **Price-time priority**: rank eligible orders by price first, then by the venue-defined arrival sequence at the same price.
- **FIFO**: first-in, first-out allocation within the same price level when the venue applies strict time priority.
- **Pro-rata**: an alternative allocation family that distributes fills according to eligible displayed or defined size at a price, under venue-specific rounding and minimum rules.
- **Matching engine sequence**: the authoritative ordering assigned by the matching service; client clocks do not establish exchange priority.

## Data and ordering model

At each price level, maintain an ordered queue of resting order priority. A simplified in-memory structure is an ordered map from price to FIFO queue, with indexes from order ID to its queue node for cancellation and modification. A production matching engine also needs deterministic sequence assignment, validation, risk controls, session state, market data publication, and durable recovery appropriate to its service objectives.

Priority should be based on the venue’s authoritative event order, usually a sequenced order-entry stream or matching-engine sequence, not client wall-clock timestamps. Distributed clocks can skew, and requests can arrive through different network paths. A monotonic sequence creates a total order within the relevant matching domain. If the engine partitions instruments across shards, each instrument’s matching authority must still define the order for that instrument.

## Changes and edge cases

Whether a modified order keeps its priority depends on the venue rule. A price change typically loses time priority because it changes the order’s competitive position. Increasing quantity may lose priority, while reducing quantity may preserve it on some venues; exact treatment is venue-specific. Cancel-and-replace is not automatically equivalent to an in-place change. Partial fills generally leave the remaining quantity at its existing position unless venue rules say otherwise.

Validate price increments, quantity increments, trading status, account limits, and self-trade policy before matching. A matching engine must process commands deterministically: given the same accepted event sequence and starting state, replay should produce the same fills and book. Persisting or replicating the sequence and event log is crucial to recovery; a snapshot without an ordered delta boundary can lose or duplicate state.

## Examples

### Worked example

Resting asks are `100.00 × 5` (order A, sequence 41), `100.00 × 8` (order B, sequence 45), and `100.01 × 10` (order C, sequence 47). A buy limit for 9 at `100.01` arrives. Under price-time allocation, it fills 5 against A, then 4 against B. B has 4 remaining; C is untouched because it is at a worse price. If the incoming order were limited to `100.00`, it could not trade with C. Fees, hidden quantity, and venue-specific allocation can alter this simple illustration.

## Cross-item comparison

FIFO is easy to explain and supports transparent queue position, but it rewards latency and can favor the fastest participants. Pro-rata allocates at one price in proportion to displayed or eligible quantity and may encourage larger quotes, but introduces rounding, minimum-allocation, and fairness rules. Hybrid algorithms apply different rules by product or market phase. Auctions aggregate orders and choose a clearing price under separate rules. None is inherently “fairest”; measure the incentives and state the exact allocation semantics.

## Common mistakes

- Saying all exchanges use price-time priority.
- Ordering by client timestamps rather than the matching authority’s sequence.
- Assuming a modification always retains priority or always loses it.
- Matching a buy limit above its maximum or a sell below its minimum.
- Forgetting partial-fill remainder, time-in-force, cancel races, or self-trade handling.
- Treating market-data display as the authoritative matching state.
- Replaying events without a clear sequence boundary between snapshot and log.

## Knowledge checks with answers

1. **Which order fills first at an equal price under strict FIFO?** The earliest eligible order by the venue’s defined priority sequence.
2. **Can a buy limit at 100.00 trade with an ask at 100.01?** No; that would violate the buyer’s maximum price.
3. **Does a price amendment retain queue position?** It depends on venue rules and commonly loses priority; never infer it without the specific rulebook.
4. **Why not use wall-clock arrival times from clients?** Clock skew and network-path differences make them unreliable; the matching authority must establish a deterministic order.
