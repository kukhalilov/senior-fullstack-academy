# architecture interviews tradeoffs requirements and constraints — Reference: Back-of-the-envelope demand, storage, traffic, and uncertainty

## Scope and version

Estimation is an interview reasoning tool, not a substitute for measurement. See the [Google Cloud Well-Architected Framework](https://docs.cloud.google.com/architecture/framework) and [Google SRE service-level objectives](https://sre.google/sre-book/service-level-objectives/).

## How this group fits the mental model

Workload estimates connect user assumptions to capacity decisions. The useful output is the dominant load, a plausible range, and the uncertainty that could change the architecture.

## Supplied names explained

- **Back-of-the-envelope estimate** — Short arithmetic model with explicit units and assumptions; use powers of ten and refine only decision-sensitive values.
- **Active user count** — Users performing relevant actions in a stated interval; distinguish registered accounts from actual traffic sources.
- **Daily active users (DAU)** — Unique users active per day. It is not a simultaneous request count.
- **Monthly active users (MAU)** — Unique users active per month; useful for product reach but too broad alone for peak capacity.
- **Requests per user** — Average operation count per user for a defined period; separate page loads, API calls, retries, and background actions.
- **Requests per second (RPS)** — Request rate. Check whether the number is average, peak, per endpoint, or total across replicas/regions.
- **Average RPS** — `users × requests per user / seconds in interval`, with explicit assumptions about active distribution.
- **Peak RPS** — Highest relevant rate or a modeled peak; design and test against a justified peak rather than an arbitrary multiplier.
- **Read-to-write ratio** — Relative read and write volumes; affects indexes, cache value, replication, and storage costs.
- **Concurrency estimate** — Approximate simultaneous in-flight work; Little's Law gives `concurrency ≈ throughput × average time in system` when the system is stable.
- **Payload size** — Bytes transferred per operation; multiply by rate to estimate bandwidth, then account for protocol overhead and response asymmetry.
- **Storage per record** — Persisted bytes per logical record, including a clear statement about indexes, metadata, compression, and replicas.
- **Daily data growth** — New retained bytes per day; multiply by retention and add indexes, replication, backups, and lifecycle rules.
- **Retention period** — Duration data remains available; it drives storage, deletion, compliance, and replay requirements.
- **Replication factor** — Number or policy of copies; it increases storage and affects durability, consistency, and write cost.
- **Total storage estimate** — Approximation combining record volume, record size, indexes, copies, and retained history.
- **Network bandwidth estimate** — `requests per second × bytes per request/response`; calculate upload and download separately if they differ.
- **Cache working set** — Frequently accessed subset that must fit in a cache to reach the expected hit rate; do not assume total data fits.
- **Fan-out factor** — Number of downstream operations or recipients produced by one incoming action; it can dominate aggregate load.
- **Peak-to-average ratio** — Ratio used to describe burstiness; derive from a traffic pattern or label it as a provisional assumption.
- **Growth assumption** — Expected future rate or horizon, used for capacity and migration planning rather than treated as a guarantee.
- **Estimate range** — Low/high values that expose uncertain inputs and make sensitivity visible.
- **Order-of-magnitude check** — Sanity check whether the result is tens, thousands, or billions and whether units were converted correctly.
- **Capacity headroom** — Spare capacity for bursts, failures, and growth; excess headroom costs money and should have a reason.

## Cross-item comparison

DAU and MAU measure users over a period; RPS measures work over seconds. Average RPS can hide bursts, while peak RPS without a time window can exaggerate short spikes. Payload volume and fan-out can make a low request rate expensive. Replication improves failure tolerance only with an explicit placement and consistency model, and it increases storage and network cost.

## Examples

**Worked estimate.** Assume 1.2 million DAU, 30 requests per active user per day, 86,400 seconds per day, and a measured peak-to-average ratio of 4. Average rate is about `1,200,000 × 30 / 86,400 ≈ 417 RPS`; modeled peak is about 1,668 RPS. If 20% are writes, that is about 1,334 read RPS and 334 write RPS at the modeled peak only if the same mix holds at peak. A 12 KB average response at 1,668 RPS is about 20 MB/s before transport overhead and caching. State each assumption and check whether fan-out multiplies server-side work.

## Common mistakes

- Confusing DAU with concurrent users or RPS.
- Multiplying averages by a guessed peak factor without labeling it.
- Forgetting response size, retries, fan-out, indexes, backups, and replication.
- Mixing decimal GB with binary GiB without stating which is used.
- Presenting a precise answer from uncertain activity assumptions.
- Treating headroom as a replacement for autoscaling limits, overload behavior, or load tests.

## Knowledge checks with answers

1. **What is average RPS for 864,000 requests/day?** `864,000 / 86,400 = 10 RPS`.
2. **If response bytes triple but RPS stays constant, which estimate changes first?** Outbound bandwidth and often network/egress cost.
3. **Why estimate a range?** Uncertain assumptions can otherwise create false precision and hide the variables most worth clarifying.
