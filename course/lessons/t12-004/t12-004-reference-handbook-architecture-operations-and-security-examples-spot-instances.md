# architecture patterns multi-region tenancy and reliability — Reference: Spot instances

Sources: [HLD Handbook](https://hld.handbook.academy/), [Amazon EC2 Spot Instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html), [Spot interruption notices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-instance-termination-notices.html), [How Spot works](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/how-spot-instances-work.html), [AWS Well-Architected cost optimization](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/select-the-best-pricing-model.html), [FinOps rate optimization](https://www.finops.org/framework/capabilities/rate-optimization/).

## Scope and version

Spot instances are provider-specific interruptible compute capacity sold at a discount in exchange for allowing the provider to reclaim it. AWS EC2 Spot is used as a concrete example; other clouds use different products, interruption models, and notices. Check current provider terms and interruption behavior before placing a workload on this capacity.

## How this group fits the mental model

Spot changes the price/availability contract of a compute unit. It can lower cost for work that can move, retry, checkpoint, or finish before interruption. It is a poor fit for a single irreplaceable process that must remain available, unless another layer masks interruption with replicated capacity and safe handoff.

The key design question is not “is this workload stateless?” but “what happens if this particular worker disappears now?” Stateless front ends may still hold an active request or connection; batch workers may have already performed an external side effect; distributed jobs may have lost expensive intermediate state. Build interruption into the work protocol and test it.

## Supplied names explained

- **Spot instances** — Discounted provider capacity that can be reclaimed when the provider needs it. AWS EC2 Spot may issue an interruption notice two minutes before stop/termination; the warning is best effort, and hibernation begins immediately rather than providing that two-minute working window.

### Designing interruption-tolerant work

- **Make work restartable.** Divide batch work into bounded tasks with durable checkpoints. Persist progress outside the interruptible instance and make task claims lease-based or otherwise recoverable.
- **Make effects idempotent.** An interrupted worker may have completed a remote action but failed to record its acknowledgement. Use idempotency keys and reconcile uncertain outcomes before retrying.
- **Watch for interruption signals.** Provider notices can arrive through metadata/events, but do not assume every interruption gives enough warning. Poll or subscribe according to current provider guidance and retain a graceful shutdown path.
- **Drain and replace.** Stop accepting new work, finish or checkpoint what safely fits in the remaining window, release locks, remove the worker from service discovery, then let the orchestrator replace capacity. An autoscaler needs spare capacity or a compatible alternative pool.
- **Diversify pools.** Distribute across eligible instance types, zones, or capacity pools where the platform supports it. A single narrow pool can be interrupted or unavailable together. Diversification reduces correlated risk but does not guarantee capacity.
- **Keep a resilient baseline.** Use non-interruptible capacity for minimum user-facing service and critical control-plane functions when required. Add Spot for flexible overflow or workers whose recovery time meets the business objective.
- **Compare effective cost.** Include retries, checkpoint storage, engineering, idle replacement capacity, interruption-driven queue delay, and on-demand fallback. A lower hourly price can produce a higher cost per completed job if work is repeatedly lost.

## Cross-item comparison

| Capacity type | Cost/availability trade | Typical workload |
|---|---|---|
| On-demand | Flexible, higher list price, no long usage commitment | Baseline, uncertain demand, or workloads that cannot tolerate reclamation |
| Spot/interruptible | Discounted but reclaimable capacity | Retryable batch, stateless overflow, distributed workers with checkpointing |
| Reserved/committed use | Discount for a usage/term commitment; capacity guarantee depends on product and reservation | Stable predictable baseline after demand analysis |
| Queue-backed worker pool | Separates work admission from worker count | Work that can wait and be retried without losing user intent |

## Examples

**Image transformation.** Each image-processing job has a durable input reference, task ID, and idempotent output key. A worker writes an intermediate checkpoint, listens for interruption, stops claiming work, and finishes or checkpoints. If it is terminated without notice, the task lease expires and another worker retries. An on-demand pool can take urgent jobs when Spot capacity is unavailable. The team measures cost per successfully transformed image and completion-time SLO, not only VM-hour price.

**Unsafe payment worker.** A worker charges a card and then is interrupted before recording completion. Blind retry may charge twice. Until the payment API and local workflow support idempotency and reconciliation, keep that side effect on a safer execution path or put it behind a durable workflow that can resolve unknown outcomes.

## Common mistakes

- Treating an interruption notice as guaranteed lead time; AWS documents notices as best effort.
- Running a single critical replica on Spot and assuming an autoscaler will replace it before users notice.
- Saving checkpoints only to the instance disk that is about to disappear.
- Retrying external effects without an idempotency key or reconciliation step.
- Optimizing instance-hour cost while ignoring restart work, delay, storage, and operator burden.
- Relying on one instance type/zone pool and assuming Spot capacity is always available.
- Putting the application’s only scheduler, coordination state, or other control-plane dependency on interruptible capacity.

## Knowledge checks with answers

1. **What is the safe default assumption about warning time?** Interruption may happen without enough usable notice; AWS notices are best effort even though a typical termination warning is two minutes.
2. **What makes a batch job a good Spot candidate?** Durable checkpoints, bounded tasks, idempotent effects, recoverable leases, and an SLO that tolerates replacement delay.
3. **How should cost be compared?** Use cost per completed useful unit and include retries, checkpoints, fallback capacity, delay, and operations—not just hourly rate.
4. **Can Spot be used for a critical service?** It can contribute as one diversified capacity pool if redundancy and replacement preserve the service objective; avoid depending on a single reclaimable instance.
