# end-to-end system design case studies — Reference: FIFO order book

Sources: [HLD Handbook](https://hld.handbook.academy/), [FIX Market Data Order Book Management specification](https://www.fixtrading.org/wp-content/uploads/download-manager-files/MDOWG_Book_Mgt-v20.pdf), [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html).

## Scope and version

This lesson models a limit order book using price priority and FIFO time priority within a price level. It is an educational design, not an exchange rulebook. Actual venues can use different allocation methods (pro-rata, auctions, participant priority, or hybrid rules), order types, market regulations, and tie-breaking; venue rules and current specifications are authoritative.

## How this group fits the mental model

An order book stores resting buy bids and sell offers. A matching rule determines which compatible orders trade and in what sequence. Under price-time priority, the best price is selected first; among orders at the same price, earlier eligible arrival has priority. FIFO applies within that level, not across all prices. For example, a better-priced later order can outrank an older worse-priced order.

The book is mutable state with strict ordering and audit requirements. A command such as submit, cancel, replace, or execute must be sequenced with all other commands for the relevant instrument according to the venue’s authoritative ordering rule. The visible book is a projection of accepted commands/trades, not a permission for a client to invent queue priority.

## Supplied names explained

- **Bid/ask:** buy/sell interest. Their price ordering determines the best bid and best offer under the market convention.
- **Price level:** collection of resting orders at the same price, usually ordered by venue-defined priority within the level.
- **FIFO/time priority:** first eligible order at a price level is considered before later eligible orders, subject to venue rules and order attributes.
- **Crossing order:** incoming order whose limit is compatible with resting opposite-side prices; it can execute against one or multiple resting orders until filled, no longer executable, or stopped by rules.
- **Partial fill:** execution of only part of an order’s remaining quantity; unfilled quantity may rest, expire, or be canceled according to time-in-force and venue rules.
- **Cancel/replace:** state transitions that can affect priority. A replace that changes price/quantity may lose priority depending on the rulebook; never assume it preserves time rank.
- **Sequence number/event log:** deterministic order of accepted commands, useful for replay, audit, and reconstructing state after a crash.

## Cross-item comparison

| Allocation policy | How orders at a price level share executions | Trade-off |
| --- | --- | --- |
| FIFO / price-time | Earlier eligible order receives quantity first | Rewards displayed time priority; relies on precise ordering and can favor queue position |
| Pro-rata | Eligible quantity is allocated proportionally, often with venue-specific rounding/minimums | Rewards displayed size; allocation math and rounding become important |
| Auction/call allocation | Orders accumulate and execute at a clearing process/price/time | Useful for opening/closing or batch liquidity, but differs from continuous FIFO matching |

These are examples, not exhaustive venue methods. A production engine must implement the specific published rule set, including hidden/reserve orders, self-trade prevention, price collars, trading halts, lot sizes, and time-in-force behavior where applicable.

## Examples

Resting asks: 10 shares at $100 entered first, then 8 shares at $100; another ask is 5 shares at $101. A buy limit at $101 for 15 shares is compatible with all three levels. Under this simplified price-time rule, it fills 10 at $100 with the first order, 5 of the second order at $100, and leaves 3 shares of the second plus 5 at $101 resting. A later order at $100 cannot jump ahead of the earlier eligible quantity at that same level. Fees, hidden liquidity, and venue-specific rules are omitted from the example.

Persist a canonical event sequence: accepted order, priority assignment, match/trade, remaining quantity, cancel/replace, and resulting book version. On recovery, rebuild from a consistent snapshot plus later events and verify invariants: nonnegative remaining quantities, no order matched beyond its leaves quantity, generated trades satisfy crossing price constraints, and book order follows the configured priority. Use deterministic replay and reconcile trade records with downstream settlement.

## Common mistakes

- Saying “FIFO order book” while ignoring price priority across different price levels.
- Using client timestamps as authoritative queue position without a venue-defined sequencing rule.
- Assuming all replace operations preserve priority or all cancellations are immediate.
- Losing commands/trades between in-memory matching and durable recording.
- Sending duplicate trade events after recovery and settling them twice.
- Applying one venue’s simplified priority model to another venue’s rulebook.
- Ignoring partial fills, precision/tick sizes, quantity constraints, order expiration, halts, and self-trade rules.
- Serving a market-data projection as if it were the authoritative matching state.

## Knowledge checks with answers

1. **Can an older order at $101 outrank a later order at $100 on the ask side?** Under price-time priority, no: the lower ask has the better price and is considered first; FIFO orders only within a price level.
2. **A replace changes price. Does its original queue time necessarily remain?** No. Priority treatment is venue-specific; consult and implement the rulebook.
3. **Why sequence commands and persist an event log?** To make the accepted order, match, cancel, and replay order deterministic and auditable after failure.
4. **Does a matching engine’s event guarantee the trade settled externally?** No. Execution and settlement are distinct lifecycle steps that need their own durable workflow and reconciliation.

## Review status

Order-book depth distinctions are checked against the FIX book-management specification; concurrency/replay examples against PostgreSQL transaction documentation. Venue-specific claims are explicitly excluded. This lesson remains pending full claim-by-claim audit and manifest omission check.
