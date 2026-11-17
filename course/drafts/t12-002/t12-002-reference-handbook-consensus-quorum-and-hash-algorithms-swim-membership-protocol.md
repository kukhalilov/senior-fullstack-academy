# distributed systems consistency coordination and convergence — Reference: SWIM membership protocol

Sources: [SWIM: Scalable Weakly-consistent Infection-style Process Group Membership Protocol](https://courses.grainger.illinois.edu/cs425/fa2022/dsn02-SWIM.pdf), [The φ Accrual Failure Detector](https://oneofus.la/have-emacs-will-hack/files/HDY04.pdf).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `SWIM membership protocol` — SWIM separates failure detection from dissemination. A process probes a randomly selected member; if direct probing fails, it can ask others to probe indirectly. Suspicion can be disseminated before a member is declared failed, allowing evidence to arrive and reducing false declarations under transient delay. Membership remains weakly consistent: different nodes can temporarily hold different views. A `suspect` or `failed` status is a local protocol judgment, not proof that the process is permanently dead.

## Protocol shape and limits

Randomized probing spreads load and avoids a centralized monitor. Piggybacking membership updates on probes spreads changes with low extra message cost. This does not make detection instantaneous: probe intervals, indirect-probe fan-out, network delay, packet loss, and suspicion timeouts trade detection speed against false positives and message load. A node falsely suspected may continue serving requests, so membership changes must be paired with fencing, epochs, leases, or another authority check when duplicate leaders could corrupt data.

SWIM membership is not consensus. It tells a node which members it currently believes are alive; it does not elect one globally agreed leader or serialize application writes. Systems commonly combine membership with a separate replication or consensus protocol whose safety rules do not rely on every observer having the same instantaneous membership view.

## Cross-item comparison

SWIM answers “which peers appear reachable?” Consensus answers “which decision/order is committed?” An accrual detector such as φ answers “how suspicious is this delay under an observed timing distribution?” These mechanisms can feed one another but do not provide interchangeable guarantees.

## Examples

With five members, have A fail to receive B’s direct probe, then ask C to probe B. Trace how suspicion is propagated and what evidence could refute it before timeout. Then partition B from A/C while B can still reach clients: explain why A must not assume B has stopped acting, and which fencing or consensus mechanism protects writes.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a timeout or SWIM suspicion as proof of process death, or treating membership as a consensus decision.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Does SWIM make every node agree immediately on membership?** No; dissemination is weakly consistent and views can temporarily differ.
2. **Does a suspicion prove the target is dead?** No; delay and loss can cause suspicion, so designs must tolerate false positives.
3. **Does membership elect a safe leader?** No; use consensus or fencing for decisions that require one authoritative writer.
