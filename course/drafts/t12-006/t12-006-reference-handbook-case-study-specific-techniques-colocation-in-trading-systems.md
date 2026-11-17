# end-to-end system design case studies — Reference: Colocation in trading systems

Sources: [HLD Handbook](https://hld.handbook.academy/), [Nasdaq colocation services](https://www.nasdaq.com/products/north-american-markets/connectivity/co-location), [SEC Rule 15c3-5 staff FAQs](https://www.sec.gov/rules-regulations/staff-guidance/trading-markets-frequently-asked-questions/divisionsmarketregfaq-0), [SEC market-access rule](https://www.sec.gov/files/rules/final/2010/34-63241.pdf).

## Scope and version

This is a vendor-neutral architecture case study, current to the cited materials checked on 2026-11-17. Colocation means placing a participant's computing equipment in or near an exchange's data-center environment. Exact facilities, connectivity, fees, protocols, and regulatory obligations are venue- and jurisdiction-specific; this lesson is not trading, legal, or vendor configuration advice.

## How this group fits the mental model

Suppose an electronic trading system receives market data, decides whether to submit an order, sends it to an exchange, receives acknowledgements and fills, and updates its risk and position state. Network propagation and queueing consume part of the time between observing an event and acting on it. Colocation can reduce some network distance and simplify a participant's connection to the venue. It does not make the market instantaneous, guarantee a particular latency, or make a strategy profitable.

Begin by asking what latency matters. Measure end-to-end time from a defined event (such as packet arrival at the participant's network boundary) to a defined outcome (such as order acknowledgement). A single average hides tail delays and jitter. Separate feed delivery, decoding, strategy computation, order construction, outbound network, venue processing, and acknowledgement. Establish percentile objectives, correctness requirements, and a baseline before buying proximity.

## Supplied names explained

- `Colocation in trading systems` — places a participant’s equipment near a trading venue to reduce some network distance; it does not guarantee a specific end-to-end latency or execution result.

1. The venue publishes market data through one or more feeds. The participant validates sequence numbers, detects gaps, and reconstructs the intended book according to that feed's contract. A faster path is useless if it silently misses updates or uses stale state.
2. The strategy consumes a well-defined snapshot or event stream. Bound work per event, avoid unbounded queues, and define overload behavior. A backlog can make a fast machine act on old information.
3. Pre-trade controls validate authorization, order size, price collars, credit/capital exposure, instrument restrictions, and rate or position limits as applicable. SEC Rule 15c3-5 imposes obligations on covered broker-dealers with market access; the responsible regulated entity must design and maintain applicable controls. A latency design must not bypass required controls.
4. The order gateway serializes and transmits orders using the venue's supported protocol. It tracks client and venue identifiers, sequence state, acknowledgements, rejects, cancel/replace outcomes, and executions. A lost acknowledgement creates an unknown outcome: reconcile before retrying an order that could duplicate exposure.
5. An independent risk and operations path monitors order and execution reports, position/exposure limits, feed health, and system liveness. Define a kill or disable mechanism, its authority, and its behavior during partial network failure. Persist enough evidence for reconciliation and audit without putting slow, nonessential work in the critical path.

## Cross-item comparison

This assigned group contains one named item, so no within-group comparison applies.

### What colocation changes—and what it does not

It can shorten the participant-to-venue network path, reduce some intermediate routing, and offer venue-specific connectivity options. It cannot eliminate serialization, switch and NIC queues, software scheduling, feed dissemination delay, exchange processing, contention, or propagation within the facility. The fastest physical path also does not imply equal access to all data or superior execution; market rules and the specific product determine access.

The design remains a distributed system. Packets can be delayed, dropped, duplicated at application boundaries, or reordered across independent channels. Redundant feeds may disagree temporarily; clocks have uncertainty; a process can fail after sending an order but before recording the acknowledgement. Use sequence/gap recovery, idempotent internal event processing, explicit order-state machines, reconciliation, and tested failover. Never infer that a timeout means an order was not accepted.

## Examples

Track at least feed-to-decision, decision-to-send, send-to-acknowledgement, and event-to-position-update durations. Record distributions (including p50, p99, and p99.9 where sample sizes support them), jitter, queue depth, dropped or late messages, rejects, and stale-input events. Use monotonic clocks for elapsed-time measurement. For cross-host event correlation, use an appropriately synchronized clock and record its uncertainty; wall-clock timestamps are not a substitute for causal sequence numbers.

Benchmark under realistic traffic, bursts, CPU/IRQ contention, garbage collection or allocator behavior, thermal and power limits, failover, and market-open conditions. Instrumentation itself can perturb a microsecond-scale path, so validate overhead and use sampling or hardware timestamps where available. Compare like-for-like boundaries and feed types; quote latency without measurement boundaries is ambiguous.

Optimize only after profiling. Common choices include keeping critical data local, minimizing allocations and unnecessary copies, controlling thread placement and queueing, using batching only when its added wait is acceptable, and isolating critical work from background jobs. Kernel bypass, specialized NICs, FPGA logic, and low-level languages can reduce some overhead but increase engineering, testing, hiring, observability, and recovery costs. Complexity that causes a rare outage can outweigh a small median-latency gain.

## Operational, security, and economic tradeoffs

Colocation can add recurring rack, power, cross-connect, bandwidth, remote-hands, compliance, and staffing costs. It can increase dependence on one facility and create operational risks during maintenance or access loss. Plan diverse paths and recovery according to the business requirement; a geographically distant disaster-recovery site is not a low-latency substitute for the primary. Test cutover while ensuring that failover cannot create duplicate live orders.

Treat the facility as a security boundary: control physical access, credentials, configuration changes, software releases, and out-of-band management. Use signed or otherwise authenticated artifacts, least privilege, change review, inventory, and a tested rollback. A configuration rollout must not leave gateways with inconsistent risk limits. Keep an independent, auditable control path and alert on disabled or stale controls.

Evaluate the decision economically: expected value of measured latency improvement versus all-in cost, engineering effort, operational burden, and the cost of failure. If the application is dominated by computation, user geography, a remote dependency, or stale input, moving closer to the exchange may not improve the actual outcome. Start with a measured bottleneck, then run a controlled comparison.

## Example and failure walkthrough

A strategy receives sequence 410, then 412. It must detect the missing 411 rather than assume that 412 alone is a complete current book. It pauses decisions that depend on the incomplete state, requests recovery or switches to a validated redundant feed, and resumes only after a defined synchronization check. If an order sent during this period times out, the gateway queries or reconciles its state before resubmission. Pre-trade limits remain active throughout; if their authoritative state cannot be established, the system fails closed for affected order classes and raises an operator-visible alarm.

For a latency experiment, compare the same software, feed, order path, traffic profile, and measurement boundaries before and after colocation. Report tail latency and error rates alongside median latency. Do not attribute a strategy result to colocation unless the experiment isolates that change and includes market-regime effects.

## Common mistakes

- Treating the shortest network round trip as the whole trading-system latency.
- Reporting only averages and omitting tails, jitter, dropped messages, and the measurement boundary.
- Assuming colocation guarantees fairness, fills, profit, or a fixed latency.
- Trading on a gapped or stale feed because a newer packet arrived quickly.
- Retrying an order after a timeout without resolving the unknown outcome.
- Bypassing or weakening pre-trade controls to reduce latency.
- Treating redundant network paths as safe without testing split-brain and duplicate-order behavior.
- Introducing specialized hardware before identifying a measured bottleneck and operational owner.

## Knowledge checks with answers

1. **What does colocation improve?** It can reduce some network distance and connection complexity between participant systems and a venue. It does not remove processing, queueing, feed delay, or failure modes, and it is not a performance or profitability guarantee.
2. **How would you measure the benefit?** Define start and end events, instrument each path segment, compare equivalent workloads, and report percentiles, jitter, data-quality failures, and order outcomes. Include the costs and operational risk.
3. **What happens after a feed sequence gap?** Mark dependent state incomplete, recover or switch to a validated source, resynchronize, and prevent decisions from using an invalid book. Resume under an explicit consistency check.
4. **An order timed out. Do you resend it?** Not blindly. Its outcome is unknown; reconcile by client/venue order identifiers and the venue's supported state-query or recovery mechanism before any retry.
5. **How do you preserve safety in a low-latency architecture?** Keep required pre-trade controls in the order path, make their state authoritative and observable, define fail-closed behavior when validation is unavailable, and test kill-switch and recovery behavior under partial failures.

## Practice

Draw the feed-to-fill path and mark every queue, clock, state owner, and failure boundary. Propose five measurements that could distinguish network delay from software queueing. Then explain what the system does for a feed gap, a process crash after send, and loss of the primary facility. A sound answer states assumptions, prevents unsafe duplicate orders, and balances tail latency against correctness, cost, and recoverability.
