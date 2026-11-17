# distributed systems consistency coordination and convergence — Reference: Phi accrual failure detector

Sources: [Hayashibara et al., The φ Accrual Failure Detector](https://oneofus.la/have-emacs-will-hack/files/HDY04.pdf), [SWIM paper](https://courses.grainger.illinois.edu/cs425/fa2022/dsn02-SWIM.pdf).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Phi accrual failure detector` — Instead of returning only alive/dead, an accrual detector exposes a continuous suspicion value φ derived from how unlikely the observed heartbeat delay is under a learned arrival-time distribution. A consumer chooses its own threshold: a higher threshold tolerates longer delays but detects failures later; a lower threshold reacts sooner but risks more false suspicions. This separates evidence from policy, allowing a database, router, or membership layer to choose different responses.

## Inputs, adaptation, and limits

The detector observes heartbeat inter-arrival times and estimates their distribution. In the paper’s formulation, φ is the negative base-10 logarithm of the probability that the next heartbeat has not arrived by the observed delay. This is a statistical suspicion score, not a calibrated probability that a machine is dead. Estimation choices, sampling windows, heartbeat scheduling, JVM pauses or other runtime stalls, network congestion, and clock/timer behavior affect the signal.

An accrual detector cannot distinguish a failed process from a slow process or a partition in a fully asynchronous system. It improves how an application reasons about varying delays; it does not remove uncertainty or provide consensus. Use hysteresis or staged suspicion where flapping is costly, and fence stale leaders before they can write after a replacement leader is elected.

## Cross-item comparison

Fixed timeout: simpler but assumes a known delay bound. Accrual detector: exposes graded suspicion from observed timing and leaves the reaction threshold to the consumer. Neither proves failure. A consensus election or lease/fencing rule is still needed to protect exclusive ownership.

## Examples

If heartbeats usually arrive each second, then one 1.5-second delay may be low suspicion during a jittery network and high suspicion on a stable local network. The φ value depends on learned history; it is not a universal “1.5 seconds means dead” constant. Show what the consumer does at two thresholds, then explain how a false suspicion is prevented from creating two active writers.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Reading φ as the literal probability the process is dead; it is derived from heartbeat-delay probability, not ground truth about process state.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **What does a larger φ mean?** The observed heartbeat delay is less likely under the learned timing distribution, so suspicion is greater.
2. **Does a threshold prove failure?** No; it is a policy point that trades detection speed against false suspicion.
3. **What protects data if a suspected old leader still runs?** An independent fencing, epoch, lease, or consensus-based authority check at the write boundary.
