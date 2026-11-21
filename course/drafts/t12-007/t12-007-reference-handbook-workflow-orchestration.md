# system design technology landscape and selection — Reference: Workflow orchestration

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [Temporal durable execution](https://docs.temporal.io/durable-execution), [Temporal retry policies](https://docs.temporal.io/encyclopedia/retry-policies), [Apache Airflow core concepts](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html), [Airflow DAGs](https://airflow.apache.org/docs/apache-airflow/stable/concepts/dags.html), [Airflow tasks](https://airflow.apache.org/docs/apache-airflow/stable/concepts/tasks.html), [Airflow scheduler](https://airflow.apache.org/docs/apache-airflow/stable/scheduler.html).

## Scope and version

This lesson compares Temporal and Apache Airflow as the named orchestration systems. Airflow is a rapidly evolving project; its current stable documentation is 3.4. Temporal docs are continuously updated. Use versioned documentation and deployment-specific capabilities when implementing.

## How this group fits the mental model

Orchestration coordinates a multi-step process across time and failure boundaries. It records enough state to decide which step is next after a worker, process, or dependency fails. The workflow definition describes control flow; the orchestration system persists progress; workers perform activities/tasks; external systems still own their own data and side effects.

The central question is duration and recovery model. Is this a business process that may wait hours or days for a person or external system and must resume from durable history? Or is it a scheduled data pipeline whose main job is to run a dependency graph for each interval/backfill? Both need idempotency, bounded retries, timeouts, observability, and a plan for failures that cannot be retried.

## Supplied names explained

- **Temporal** — A durable execution platform for application workflows. Workflow code defines orchestration logic; Temporal records workflow history and replays it to reconstruct workflow state after worker/process failure. Activities perform external side effects and can be retried according to policy. Workflow code must obey determinism constraints, and activities should be idempotent or otherwise designed for retries. Durable timers, signals, and long-running state make it suitable for business processes. Retry policies need bounds or deliberate handling: repeated transient retries do not fix permanent errors, and compensation may be needed after partial success.
- **Apache Airflow** — A platform for authoring, scheduling, and monitoring directed acyclic graphs (DAGs), especially batch and data workflows. A DAG defines tasks, dependencies, schedule/data intervals, retries, and timeouts. The scheduler creates DAG runs and task instances; an executor and workers run tasks. Tasks are independent by default and should pass bounded metadata/results through supported mechanisms such as XCom when appropriate, rather than treating the scheduler as a general-purpose application state store. Airflow can orchestrate many kinds of work, but it is not a substitute for a durable per-customer application workflow engine in every case.

## Cross-item comparison

| Question | Temporal | Airflow |
|---|---|---|
| Typical shape | Stateful application process lasting minutes to months; waits, signals, timers, retries | Scheduled DAG/run for batch, analytics, ML, or operational pipelines; dependencies and backfills |
| Recovery model | Persisted event history and deterministic workflow replay | Persisted DAG/task instance state for each run and task attempt |
| Code model | Workflow logic plus Activities for side effects | DAG/task definitions plus operators/sensors and execution environment |
| Key caution | Replay determinism, activity idempotency, history growth, retry/compensation policy | Idempotent tasks, data intervals, scheduler/executor capacity, retries and backfill impact |

There is overlap. Choose based on lifecycle, state, scheduling, and team needs rather than the product label alone.

## Examples

### Customer onboarding

A user signs up, waits for identity verification, then provisions resources and sends a welcome notification. The process can wait for days and receive an external signal. Temporal models the durable process and timer; each provisioning/notification activity has a stable idempotency key, timeout, bounded retry policy, and compensation or manual-repair path.

### Nightly analytics pipeline

At each data interval, extract source data, validate it, transform it, and publish a report. Airflow models the dependency DAG, retries failed tasks, tracks each task instance, and supports backfills. Tasks must safely handle reruns, and a large backfill must be capacity-planned so it does not overwhelm production data stores.

## Failure design

- Separate orchestration state from business data and external effects.
- Make task/activity effects idempotent where retries can repeat them.
- Classify retryable versus permanent errors; use exponential backoff, jitter, caps, and deadlines where supported.
- Set task/activity timeouts and cancellation behavior; distinguish a timed-out caller from a stopped remote side effect.
- Define compensation or human intervention for partially completed workflows.
- Monitor queue/worker saturation, schedule lag, retries, age of oldest work, and stuck executions.
- Test worker restarts, duplicate delivery, dependency outage, deployment/version change, and recovery from long pauses.

## Common mistakes

- Using a workflow engine as a distributed transaction manager for arbitrary external services.
- Retrying non-idempotent side effects without deduplication or reconciliation.
- Leaving retries effectively unbounded for permanent failures.
- Putting large business payloads in orchestration history or metadata channels instead of durable domain storage.
- Choosing Airflow solely because a process has steps, or Temporal solely because it is “reliable,” without checking process lifecycle and operating model.
- Assuming a timeout cancels a remote side effect that may already have completed.

## Knowledge checks with answers

1. **Why does Temporal replay workflow code?** It reconstructs workflow state from durable history after a worker restart; code that changes decisions nondeterministically can make replay unsafe.
2. **What is a task instance in Airflow?** A specific task execution for a particular DAG run/data interval, with its own lifecycle state and attempt history.
3. **When is Airflow a natural fit?** Scheduled dependency graphs such as data pipelines, especially when run history, retries, scheduling, and backfills are central.
4. **Why are retries not sufficient for correctness?** They can repeat effects and cannot repair permanent errors; idempotency, classification, deadlines, compensation, and reconciliation are also needed.
