# Kubernetes workloads configuration scheduling and networking — Reference: Replica controllers, stateful identity, batch work, and deployment updates

Sources: [Controllers](https://kubernetes.io/docs/concepts/architecture/controller/), [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/), [DaemonSets](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/), [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/), and [CronJobs](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/).

## Scope and version

These built-in workload APIs create or maintain Pods for long-running replicas, per-node agents, or finite tasks. Feature maturity can vary by cluster version. Current upstream version checked 2026-11-20 is v1.37.1. StatefulSet `Recreate` strategy is Alpha in v1.37 and requires the relevant feature gate; do not copy it into production manifests without verifying the cluster.

## How this group fits the mental model

Controllers watch desired objects and reconcile lower-level objects. The workload controller chooses replica identity, replacement rules, update order and completion semantics. Pods remain replaceable. Select a controller based on what makes instances equivalent, whether work is finite, and which ordering/identity guarantees the application requires.

## Supplied names explained

### Deployments and replica sets

- `Deployment` — Manages a stateless ReplicaSet and its Pods, with declarative rollout history. It is the usual controller for interchangeable web/API replicas.
- `Deployment selector` — Label selector that binds the Deployment to its Pod template and ReplicaSets. It must match template labels and should not be changed casually.
- `ReplicaSet` — Maintains a requested number of matching Pods. Deployments manage ReplicaSets to provide update history; avoid managing a Deployment's ReplicaSet directly.
- `Deployment revision` — A rollout history entry created by relevant Pod-template changes; not every metadata edit creates a new revision.
- `Deployment rollout` — Progressive replacement of old Pods by new-template Pods. Progress depends on scheduling capacity, readiness, quota and app startup.
- `RollingUpdate deployment strategy` — Adds new Pods and removes old Pods within surge/unavailable bounds; it can temporarily need more capacity than the steady replica count.
- `Recreate deployment strategy` — Scales down old Pods before scaling up the new version. It introduces downtime but avoids intentional overlap.
- `maxSurge` — Maximum extra Pods above desired replicas during a rolling update. It may be an integer or percentage; rounding and quota/capacity matter.
- `maxUnavailable` — Maximum number/percentage of desired Pods that may be unavailable during update. A zero value requires surge capacity for progress.
- `kubectl rollout status` — Watches rollout conditions until completion or failure; the command does not validate user-level behavior.
- `kubectl rollout history` — Lists and inspects retained Deployment revisions. History retention is bounded and is not a substitute for source control.
- `kubectl rollout undo` — Reverts a Deployment template to a prior revision. It cannot reverse database migrations, external side effects or lost state.
- `Deployment pause` — Stops creation of new rollout revisions while changes are staged; resume to trigger normal progression.
- `Deployment progress deadline` — Time allowed without observed rollout progress before the controller reports failure. It reports stalled progress; it does not automatically repair the cause.

### Stateful and per-node controllers

- `StatefulSet` — Manages Pods with stable ordinal identity and stable storage association. It supports ordered or parallel lifecycle behavior but does not provide database replication by itself.
- `StatefulSet ordinal` — Integer suffix identifying a replica, commonly starting at zero. It is stable for that member's lifetime and participates in predictable naming.
- `StatefulSet serviceName` — Name of the governing Service used to provide stable network identity; typically paired with a headless Service.
- `StatefulSet headless Service` — Service with `clusterIP: None` that supports direct Pod DNS discovery rather than one virtual Service IP.
- `StatefulSet podManagementPolicy` — Controls whether creation/deletion is ordered (`OrderedReady`) or independent (`Parallel`); it does not change rolling update ordering semantics by itself.
- `OrderedReady pod management` — Default behavior that creates Pods in ordinal order and waits for readiness before proceeding; a stuck lower ordinal can block later creation.
- `Parallel pod management` — Allows concurrent creation/deletion for faster operations when the application can handle unordered member startup.
- `StatefulSet updateStrategy` — Selects how template changes replace Pods: RollingUpdate or OnDelete in standard API behavior; newer strategies may be feature-gated.
- `RollingUpdate StatefulSet strategy` — Updates Pods in reverse ordinal order by default, waiting for readiness. A partition can limit which ordinals update.
- `OnDelete StatefulSet strategy` — Updates a Pod only after it is manually deleted; useful for controlled migration but easy to leave replicas on mixed revisions.
- `partitioned StatefulSet rollout` — Uses a partition to update only ordinals at or above a threshold, enabling staged changes and canarying by identity.
- `Persistent identity` — Stable name/ordinal and storage association provided by workload APIs; it is not a guarantee of a stable node, IP, or correct consensus membership.
- `DaemonSet` — Ensures a Pod copy on each eligible node, often for logging, networking or storage agents. Node selectors, taints and tolerations affect eligibility.
- `DaemonSet node selector` — Node label requirements for where the DaemonSet Pod should run; scheduler and other constraints still apply.
- `DaemonSet rolling update` — Replaces agent Pods on nodes progressively; `maxUnavailable` and readiness determine safe rollout pace.

### Finite work and legacy ownership

- `Job` — Runs Pods until the configured completions succeed or retry/deadline conditions end the Job. A successful Job does not mean its external side effects happened exactly once.
- `Job parallelism` — Maximum number of Job Pods running at once; resource capacity and retry policy affect realized concurrency.
- `Job completions` — Number of successful completion targets required for Job completion.
- `Job completionMode` — `NonIndexed` (ordinary interchangeable completions) or `Indexed` (each completion has a stable completion index).
- `Indexed Job` — Gives each completion index to a task Pod, useful for parallel shard processing. Ensure each shard is idempotent and can be retried safely.
- `Job backoffLimit` — Retry allowance for failed Pods before the Job is considered failed, with nuances for per-index and pod failure policies in supported API versions.
- `Job activeDeadlineSeconds` — Upper bound on total active Job duration; if exceeded, active Pods are terminated and the Job fails.
- `Job TTL-after-finished` — Optional cleanup controller delay after Job completion/failure. Retain enough history for debugging and auditing before cleanup.
- `CronJob` — Creates Jobs on a schedule. Controller downtime, missed schedules, concurrency and startup delays mean it is not an exactly-once clock.
- `CronJob schedule` — Cron expression interpreted by the controller; validate time zones and daylight-saving behavior for the intended schedule.
- `CronJob timeZone` — IANA time zone used to interpret the schedule when set; otherwise the controller's local time zone applies. Verify cluster support.
- `CronJob concurrencyPolicy` — `Allow`, `Forbid`, or `Replace` behavior when a prior Job is still running. `Forbid` can skip scheduled runs rather than queueing them.
- `CronJob startingDeadlineSeconds` — Window in which a missed schedule may still start. Too small can skip work after controller delays; excessive windows can create catch-up bursts.
- `CronJob successfulJobsHistoryLimit` — Number of successful Jobs retained by default for history; zero removes successes promptly.
- `CronJob failedJobsHistoryLimit` — Number of failed Jobs retained; failures are valuable for diagnosis, balanced against object retention.
- `ReplicationController` — Legacy replica-maintenance controller. New workloads generally use ReplicaSet through Deployment.
- `Workload controller ownership` — Owner references connect generated objects to their controller; deleting or replacing owners affects dependents according to garbage-collection policy.
- `Orphan Pod` — Pod no longer owned by its expected higher-level controller. It may continue running but will not be recreated by that controller.
- `Garbage collection owner reference` — Relationship used by Kubernetes garbage collection to remove dependents when owners are deleted (subject to propagation policy); it does not back up data.

## Cross-item comparison

| Controller | Replica identity | Typical use | Main caution |
|---|---|---|---|
| Deployment | Interchangeable Pods | Stateless services | App must tolerate concurrent old/new versions during rolling updates |
| StatefulSet | Stable ordinal and volume association | Stateful clustered members | Stable identity is not database consistency or backup |
| DaemonSet | One eligible Pod per node | Node-local agents | Node upgrades can make the agent rollout a cluster-wide risk |
| Job | Finite success target | Batch/one-off work | Retries may repeat external effects |
| CronJob | Scheduled Job creation | Recurring batch work | Missed, skipped or overlapping execution must be designed for |

## Examples

For six desired replicas, `maxUnavailable: 1` allows at most one unavailable replica during rolling progress, while `maxSurge: 2` allows up to two extra Pods. The cluster still needs enough quota and node capacity for the surge. If startup takes 90 seconds, readiness must reflect actual serving behavior and the progress deadline must allow expected rollout duration plus scheduling and pull delays. A database migration should use an expand/migrate/contract strategy so old and new versions can overlap safely.

For a Job processing a payment export, persist a unique batch/job key and make output creation idempotent. A Pod may finish an external operation but fail before reporting completion; Kubernetes can retry it. Correctness must not depend on Job controller retries occurring exactly once.

## Common mistakes

- Using StatefulSet when only stable DNS is needed, or assuming StatefulSet supplies consensus and backup.
- Changing a Deployment selector and expecting an in-place change.
- Setting `maxUnavailable: 0` with no surge capacity and then wondering why rollout cannot advance.
- Rolling out an API change incompatible with the still-running prior revision.
- Treating `rollout undo` as application/data rollback.
- Assuming a CronJob runs exactly once at the specified wall-clock instant.
- Assuming `Forbid` queues missed CronJob executions.
- Deleting completed Jobs before logs/results are captured.
- Forgetting that DaemonSet Pods are filtered by node eligibility and may not exist on every node.
- Manually scaling a ReplicaSet controlled by Deployment.

## Knowledge checks with answers

1. `Why can a Deployment rollout stall after creating new Pods?` They may fail scheduling, pull, startup or readiness; quota/capacity and progress deadlines also matter.
2. `When is StatefulSet identity valuable?` When the application needs stable per-replica identity or persistent volume association; app-level replication is still required.
3. `Can a Job execute a side effect exactly once?` No guarantee. Design idempotency/deduplication at the external data boundary.
4. `What does CronJob `Forbid` do?` It prevents overlap by not starting a new Job while the previous one is active; it does not maintain a durable queue of every missed tick.
5. `How does a partitioned StatefulSet rollout help?` It limits template-driven updates to ordinals at/above a boundary, allowing deliberate staged rollout.
6. `What should an operator verify before using StatefulSet Recreate?` Cluster version, feature gate, API acceptance and documented behavior; upstream v1.37 lists it as Alpha.
