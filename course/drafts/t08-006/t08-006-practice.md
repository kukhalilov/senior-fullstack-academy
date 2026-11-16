# system design requirements estimation capacity and tradeoffs — Exercises and worked solutions

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [Azure reliability metrics](https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics), and [Google SRE: Service Best Practices](https://sre.google/sre-book/service-best-practices/).

## Goals

Turn vague needs into measurable targets, estimate demand/capacity, and design explicit overload, recovery, and decision-revision behavior.

## Worked example

For ticket purchase, define valid purchase success at the public API and p95 response threshold over a stated window. Estimate average/peak/burst arrivals and realistic per-request resource use. Test target load with one node unavailable. Preserve purchase correctness; shed optional recommendations. Record assumptions and update them from production.

## Exercises

### Exercise 1: Make “fast” measurable

Rewrite “search must be fast” as a useful acceptance target. What additional questions remain?

#### Worked solution

Specify a user journey, data size and workload, measurement boundary, percentile, threshold, successful-result definition, and observation window—for example, p95 search response under an agreed value at forecast peak traffic. Clarify client/network inclusion, cache state, and failed requests.

### Exercise 2: Average hides the peak

A service averages 200 requests/s but reaches 1,500 requests/s for 10 minutes each day. What workload test should guide capacity?

#### Worked solution

Test steady baseline and the sustained peak with realistic request mix, plus burst ramp and dependency behavior. Measure latency, saturation, queue growth, and recovery. A short one-minute test may miss the sustained resource exhaustion.

### Exercise 3: RTO/RPO distinction

A database backup policy restores service in 6 hours but may lose up to 30 minutes of writes. State the objectives and ask one design question.

#### Worked solution

RTO is 6 hours; RPO is 30 minutes. Ask whether those targets meet business impact requirements and test the full restore path, including validation and traffic cutover.

### Exercise 4: N+1 reality

Four nodes each handle one quarter of target load. After one node fails, survivors reach saturation. Is the design N+1?

#### Worked solution

No. N+1 requires enough remaining capacity to serve the required target after the defined failure. Reserve tested headroom and ensure the nodes do not share a correlated dependency.

### Exercise 5: Retries under overload

Three layers each retry a dependency request up to four times. Explain the risk and an alternative.

#### Worked solution

Nested retries can multiply attempts dramatically and amplify saturation. Set one end-to-end retry budget, bounded exponential backoff with jitter, retry only safe transient failures, propagate deadlines, and shed load when the dependency is unhealthy.

### Exercise 6: Architecture decision

A team proposes active-active two-region deployment for an internal monthly report. What evidence and tradeoffs should be recorded?

#### Worked solution

Ask whether current RTO/RPO and business impact require two-region active serving. Compare cost, consistency, operational expertise, failover testing, and data-residency needs. Record assumptions and a measurable trigger such as user growth or observed recovery breaches.

## Progressive hints

Define good events and measurement boundaries first. Distinguish steady, peak, and burst. Test failure capacity at target demand. State what behavior is sacrificed when overloaded.

## Complete solutions

Each exercise includes a baseline answer. Valid designs differ when requirements differ; make those differences explicit.

## Tests and edge cases

Test realistic payloads, cache misses, one dependency down, burst arrivals, slow consumers, correlated zone failure, restoration from backup, retry storms, and graceful degradation. Confirm overload responses are observable and do not corrupt state.

## Reflection questions

Which assumption has the greatest design sensitivity? What production measurement can validate it? What cost or availability target would trigger a redesign?
