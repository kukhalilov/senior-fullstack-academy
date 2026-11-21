# end-to-end system design case studies — Reference: Multicast market-data distribution

Sources: [CME Market Data Platform](https://www.cmegroup.com/market-data/distributor/market-data-platform.html), [CME Market Data FAQ](https://www.cmegroup.com/market-data/distributor/files/MarketData_Network_FAQ.pdf), [Nasdaq multicast and retransmission announcement](https://classic.nasdaqtrader.com/TraderNews.aspx?id=DTN2025-13), [FIX data transparency and book-management overview](https://fixtrading.org/guidelines/data-transparency/), [Nasdaq redundancy and resiliency notice](https://www.nasdaqtrader.com/TraderNews.aspx?id=dtn2020-37).

## Scope and version

This lesson covers distributing high-rate market data from an exchange to many subscribers. CME and Nasdaq are examples whose protocols and recovery services differ; consult the current feed specification for sequence numbers, packet layout, retransmission, snapshot, and entitlement details. Multicast is a delivery topology, not an integrity or completeness guarantee.

## How this group fits the mental model

An exchange publishes ordered market events—trades, quotes, book changes, and status updates—to multicast groups. Subscribers join the groups they are entitled to receive and process a high-volume stream without the publisher establishing a separate connection for every consumer. UDP multicast can be efficient for one-to-many delivery, but packets may be lost or arrive out of order. The consumer must detect gaps using feed sequence numbers, recover missing data if supported, and avoid publishing a book assembled from an incomplete sequence.

Many market-data systems offer redundant A/B feeds. A consumer receives both, arbitrates by sequence number, and uses one copy when the other feed loses a packet. If both have a gap, the consumer may request retransmission over a recovery channel or obtain a fresh snapshot and replay subsequent updates. Recovery has a latency cost; a snapshot must align to a sequence boundary so that applying incremental messages neither skips nor double-applies updates.

## Supplied names explained

- **Multicast market-data distribution:** the end-to-many delivery pattern for exchange events described in this lesson.
- **IP multicast group:** a destination group joined by multiple receivers; sender transmits once at the network layer and the network replicates packets along subscribed paths.
- **Sequence number:** identifies message or packet order in a feed/channel; a gap signals incomplete state, though reset and session boundaries are feed-specific.
- **A/B redundant feeds:** independent delivery paths carrying equivalent or coordinated data so a consumer can arbitrate and survive a path-specific loss.
- **Snapshot/full refresh:** a baseline representation of book state at a sequence point.
- **Incremental update:** a change applied to a known baseline, such as add/change/delete of a quote or order-book entry.
- **Retransmission/recovery:** a separate mechanism to fill missing sequence ranges; it may use unicast/TCP or vendor-specific recovery channels and may have limits.
- **Feed handler:** specialized process that parses, sequences, validates, and distributes normalized events to downstream consumers.
- **Backpressure:** subscriber inability to process incoming rate. A feed may drop or lag data rather than buffer indefinitely; monitoring and recovery are essential.

## Cross-item comparison

| Delivery style | Strength | Limitation |
| --- | --- | --- |
| UDP multicast | Efficient fan-out to many receivers; no per-subscriber send loop | Best-effort packet delivery; network access and recovery vary by environment |
| TCP/unicast stream | Ordered reliable byte stream for each connection | Per-client state and bandwidth; slow clients can accumulate lag or require disconnect/recovery |
| Dual multicast feeds | Path redundancy and fast arbitration when one feed loses packets | Duplicate processing and correlated failure remain possible; both feeds must be monitored |
| Snapshot plus incremental replay | Rebuilds a correct state after startup or unrecoverable gaps | Snapshot/replay boundary must be consistent; rebuild can be large and slow |

## Examples

A feed handler processes sequence 1,000, 1,001, 1,002. The A feed delivers 1,000 and 1,002, while B delivers all three. The handler uses sequence 1,001 from B, then confirms both feeds agree at 1,002. If both miss 1,001, it marks the book stale and requests recovery rather than silently applying 1,002 to an incomplete state. If recovery is unavailable or too slow, it requests a snapshot, installs that baseline at its documented sequence, then applies later incrementals.

A low-latency consumer may keep parsing and recovery on dedicated CPU cores and avoid blocking I/O in the hot path. It still needs correctness checks: sequence continuity, feed/session reset handling, checksum or message validation if specified, stale-book alarms, recovery latency, duplicate suppression, and operational failover. A UI or downstream strategy should know whether its book is live, recovering, or stale.

## Common mistakes

- Assuming multicast is reliable because it is sent over a private network.
- Treating the A and B feeds as independent when they share a switch, route, or upstream source.
- Applying incremental changes after a sequence gap and continuing to label the book current.
- Mixing a snapshot from one sequence boundary with incrementals from another.
- Ignoring duplicate, retransmitted, reset, or out-of-order messages.
- Letting an overloaded consumer queue grow until data is seconds behind without signaling stale state.
- Assuming an example vendor’s batching or recovery policy applies to every exchange.
- Treating successful network subscription as proof of entitlement, completeness, or correctness.

## Knowledge checks with answers

1. **What does a sequence gap mean?** The consumer may be missing an update; it should recover or rebuild before claiming its state is complete.
2. **Why use two feeds?** To arbitrate equivalent data across redundant paths and reduce loss when one path fails; correlated failures still matter.
3. **Can a snapshot be applied at any time?** It must have a defined sequence boundary so incrementals before or after it can be applied correctly.
4. **What should downstream users see during recovery?** A stale/recovering status or a policy-approved behavior, rather than an unqualified current book.
