# distributed systems consistency coordination and convergence — Reference: SWIM membership protocol

Sources: [SWIM: Scalable Weakly-consistent Infection-style Process Group Membership Protocol](https://courses.grainger.illinois.edu/cs425/fa2022/dsn02-SWIM.pdf), [The φ Accrual Failure Detector](https://oneofus.la/have-emacs-will-hack/files/HDY04.pdf).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `SWIM membership protocol` — SWIM separates failure detection from membership-update dissemination. In each protocol period, a member randomly selects a target and sends a direct `ping`; if no acknowledgement arrives by the timeout, it sends `ping-req` requests to a random subgroup, which attempts the ping and relays an acknowledgement. Membership updates are piggybacked on ping and acknowledgement traffic. In the improved protocol, a process can be marked `suspect` for a configured interval before a `failed` update is disseminated; a refutation can cancel the suspicion. Membership is deliberately weakly consistent: different processes can temporarily hold different views. A suspicion or local failure decision is not proof of permanent death.

## Protocol shape and limits

Randomized probing gives each member expected constant message load per protocol period in the paper’s model, while infection-style dissemination latency grows logarithmically with group size; these are protocol analysis results under its assumptions, not a promise for every implementation. Piggybacking membership updates avoids separate dissemination packets in the improved design. Detection is still not instantaneous: probe period, indirect-probe fan-out, network delay, packet loss, and suspicion timeout trade detection speed against false positives and message load. A node falsely suspected may continue serving requests, so membership changes must be paired with fencing, epochs, leases, or another authority check when duplicate leaders could corrupt data.

SWIM membership is not consensus. It tells a node which members it currently believes are alive; it does not elect one globally agreed leader or serialize application writes. Systems commonly combine membership with a separate replication or consensus protocol whose safety rules do not rely on every observer having the same instantaneous membership view.

## Cross-item comparison

SWIM answers “which peers appear reachable?” Consensus answers “which decision/order is committed?” An accrual detector such as φ answers “how suspicious is this delay under an observed timing distribution?” These mechanisms can feed one another but do not provide interchangeable guarantees.

## Examples

With five members, have A fail to receive B’s direct ping, then ask C (and the configured indirect-probe peers) to send `ping-req` to B and relay any acknowledgement. If no acknowledgement arrives, A records suspicion and gossips it; B may refute it before the suspicion timeout, after which failure is disseminated. Trace how different members can temporarily disagree about B’s status. Then partition B from A/C while B can still reach clients: explain why A must not assume B has stopped acting, and which fencing or consensus mechanism protects writes.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a timeout or SWIM suspicion as proof of process death, or treating membership as a consensus decision.
- Assuming constant expected message load means zero network or CPU cost, or that detection time is independent of configuration.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Does SWIM make every node agree immediately on membership?** No; dissemination is weakly consistent and views can temporarily differ.
2. **Does a suspicion prove the target is dead?** No; delay and loss can cause suspicion, so designs must tolerate false positives.
3. **Does membership elect a safe leader?** No; use consensus or fencing for decisions that require one authoritative writer.
