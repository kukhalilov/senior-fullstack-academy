# end-to-end system design case studies — Reference: YAML workflow DAG

Sources: [HLD Handbook](https://hld.handbook.academy/), [YAML 1.2.2 specification](https://yaml.org/spec/1.2.2/), [PyYAML safe loading documentation](https://pyyaml.org/wiki/PyYAMLDocumentation), [GitHub Actions workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [GitHub Actions jobs and `needs`](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-jobs), [GitHub Actions concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency), [GitHub Actions script injection](https://docs.github.com/en/actions/concepts/security/script-injections), [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use), [Argo Workflows DAGs](https://argo-workflows.readthedocs.io/en/latest/walk-through/dag/).

## Scope and version

This lesson designs a workflow runner whose job definitions are written in YAML and whose execution dependencies form a directed acyclic graph (DAG). YAML is only the serialization syntax; the workflow engine defines its own schema and execution semantics. GitHub Actions and Argo Workflows are examples, not interchangeable specifications. Documentation was checked on 2026-11-21. Runner limits and product syntax are version-dependent.

## How this group fits the mental model

A workflow is a declarative plan: what event starts work, which jobs need which outputs, what should run concurrently, how failures affect dependents, and what permissions and resources each job receives. The scheduler validates the plan, computes which nodes are ready, runs them on isolated workers, records outcomes, and releases dependent work when prerequisites complete.

The graph is a DAG because cycles make it impossible to decide which prerequisite should run first. Independent nodes can run in parallel; dependent nodes wait. The scheduler must define more than ordering: retries, cancellation, skipped nodes, conditional cleanup, timeouts, resource limits, outputs, artifact retention, concurrency groups, and secret exposure all affect the actual result.

## Supplied names explained

- **Workflow document:** YAML document parsed into a data model. YAML itself defines scalars, sequences, mappings, tags, anchors, aliases, and document streams; the workflow product determines valid keys, expression syntax, and execution meaning.
- **Schema validation:** check that fields have expected types, required keys exist, references resolve, limits are respected, and unsupported fields are rejected before any job runs.
- **Job/node:** independently schedulable unit with an executor, steps, permissions, environment, timeout, and outputs.
- **Dependency edge:** directed relationship saying a downstream job depends on upstream completion and possibly its outputs. In GitHub Actions, `needs` establishes job dependencies; downstream jobs are normally skipped after failed/skipped prerequisites unless conditions override that behavior.
- **DAG validation and topological scheduling:** reject cycles and invalid references; run all ready nodes subject to worker/resource/concurrency limits. The graph orders jobs, while step ordering within a job is usually sequential unless the product defines otherwise.
- **Status and condition semantics:** success, failure, skipped, cancelled, timed out, and neutral/conditional states determine whether downstream nodes execute. Always-run cleanup must be expressed carefully so it cannot mask failed setup or hang on unavailable dependencies.
- **Retry policy:** retries transient infrastructure failures only when operations are idempotent or protected by stable run/job/step IDs. An ambiguous timeout can mean the side effect completed; retry can duplicate deployment, payment, publication, or external notification.
- **Concurrency group:** limits or serializes overlapping runs that target the same resource. Define whether new runs queue, replace, cancel, or run concurrently; stale deployment runs must not overwrite newer desired state.
- **Artifact/output:** immutable, identified data passed between nodes or retained for release/audit. Validate provenance and size; do not confuse an artifact with disposable cache state.
- **Expression/interpolation:** workflow expressions can combine metadata and user-controlled values. Treat pull-request titles, branch names, issue text, file contents, and repository code as untrusted; avoid inserting them directly into shell source.
- **Runner/executor isolation:** execute jobs in disposable or appropriately isolated workers with bounded CPU, memory, disk, network, and runtime. Untrusted code must not share credentials or privileged host state with trusted deployment jobs.
- **Secret and token scope:** grant permissions and credentials per job/environment; many platforms expose a job token to every action in that job. Secret masking is not a security boundary.
- **Safe YAML parsing:** untrusted YAML should be size/depth bounded and parsed with a loader that does not construct arbitrary application objects. Validate aliases, tags, duplicate keys, and resource exhaustion according to the selected parser and schema.

## Architecture and execution lifecycle

1. **Receive a trigger.** Authenticate the event source, establish repository/project and ref identity, assign a unique run ID, and snapshot the workflow definition/version used for this run.
2. **Parse defensively.** Enforce input size and complexity limits, parse a single supported YAML schema, reject unexpected tags/keys/duplicate fields, and avoid unsafe object-construction loaders for user-supplied workflow text.
3. **Resolve references.** Validate job IDs, dependencies, output references, action/plugin versions, environment names, permissions, and conditions. Reject missing nodes, self-dependencies, and cycles before scheduling.
4. **Build execution plan.** Compute the DAG's ready set, critical path, maximum parallelism, estimated resource demand, and concurrency conflicts. Apply organization policy such as required review, signed actions, pinned dependencies, or restricted egress.
5. **Schedule bounded work.** Claim ready jobs subject to runner pool capacity, per-repository/concurrency groups, quotas, and priority. Use fair scheduling so a large workflow cannot monopolize shared workers.
6. **Provision isolated execution.** Start a fresh container/VM or suitably sandboxed worker, check out only the intended revision, mount needed artifacts, grant least-privilege tokens, and expose step secrets only where required. Never run attacker-controlled contribution code with production deployment credentials.
7. **Execute and capture state.** Run ordered steps with timeouts; stream bounded logs; store outputs/artifacts with run and job identity; update node status atomically so a scheduler restart can recover without launching duplicate side effects.
8. **Handle failure and retry.** Mark downstream nodes skipped or run explicit failure/cleanup paths according to the product's condition semantics. Retry transient runner failures with bounded backoff; require idempotency or operator reconciliation before repeating external effects.
9. **Cancel and clean up.** Propagate cancellation, terminate processes and child processes, revoke credentials, remove ephemeral workspaces, and preserve only intentionally retained logs/artifacts. Cleanup must still execute when appropriate but should not report the workflow as successful after an earlier failure.
10. **Audit and report.** Record workflow version, trigger, resolved graph, actor, job/step status, action digests, permission grants, artifact hashes, retry/cancel events, and environment approvals. Redact sensitive data without relying on redaction as the only protection.

## Cross-item comparison

| Execution model | Strength | Trade-off |
| --- | --- | --- |
| DAG jobs with explicit dependencies | Parallel work and visible prerequisites | More complex conditional/failure semantics and artifact passing |
| Sequential pipeline | Easy-to-understand order | Wastes time when steps are independent and can create one long failure bottleneck |
| Dynamic workflow graph | Adapts jobs to runtime-discovered work | Harder to validate, audit, bound, and reproduce |
| GitHub Actions `needs` | Convenient hosted job DAG with workflow-specific conditions and permissions | Product-specific semantics; `needs` failure/skip behavior must be understood |
| Argo Workflows DAG template | Kubernetes-native workflow graph and task scheduling | Requires Kubernetes control plane, executor security, and cluster capacity management |

## Examples

### Build, test, package, deploy

The `build` job emits a content-addressed artifact. Unit and integration tests can run in parallel after build. `package` waits for required tests and verifies the artifact digest. `deploy-staging` depends on package and receives only staging credentials. `deploy-production` requires protected-environment approval and separately scoped production identity. A failed test blocks release; an independent log-upload cleanup can run under a condition that preserves the original failure status.

### Pull request from a fork

The workflow runs format/lint/unit tests with read-only permissions in a disposable runner and without repository secrets. A separate trusted deployment workflow only accepts a reviewed protected-branch commit and verifies the artifact provenance. Do not switch to a privileged pull-request event and then check out and execute the untrusted fork head.

### Scheduler crash after an external side effect

A deployment action reaches the cloud provider, updates service version, then the runner loses its connection before reporting success. The scheduler sees an unknown outcome. Use a stable deployment operation ID and query the provider's desired/current state before retrying. Marking it simply “failed” and blindly rerunning can repeat non-idempotent operations.

## Common mistakes

- Assuming YAML syntax determines workflow execution semantics or graph behavior.
- Parsing untrusted YAML with an unsafe loader or allowing unbounded aliases/nesting/resource use.
- Skipping schema validation and discovering cycles or missing outputs after jobs have started.
- Assuming `needs` only orders jobs; failure and skip status propagate to dependents by product rules.
- Using `always()` broadly and accidentally running unsafe work after cancellation or critical setup failure.
- Retrying non-idempotent effects after an ambiguous timeout.
- Giving every job write permissions and all repository secrets “for convenience.”
- Interpolating pull-request or issue text directly into shell code.
- Running untrusted pull-request code in a privileged event/runner context.
- Treating cache as trusted artifact storage or failing to verify artifact provenance.
- Letting concurrency cancellation terminate a newer run or allow an older deployment to overwrite the latest version.
- Treating log masking as protection after secrets entered process arguments or output.

## Knowledge checks with answers

1. **Does YAML guarantee that jobs execute in dependency order?** No. The workflow schema and scheduler interpret dependency fields and statuses.
2. **Why reject cycles before scheduling?** No node in a directed cycle can become ready from completed prerequisites; the plan is unschedulable.
3. **What does a downstream job do after a prerequisite fails?** Follow the engine's status/condition semantics; default behavior may skip it, while cleanup/reporting needs an explicit safe condition.
4. **Can the scheduler blindly retry after losing a runner during deployment?** No. The effect may have completed; reconcile by stable operation ID/state or make the action idempotent.
5. **How should a fork pull request be tested?** Run untrusted code with isolated resources and minimal/read-only permissions, without privileged deployment secrets.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder text with a concrete workflow-runner design. YAML 1.2.2 was checked for the serialization model; PyYAML docs for safe versus arbitrary-object loading; GitHub docs for `needs`, failure/skip conditions, concurrency, token permissions, and script injection; Argo docs for DAG execution semantics. The lesson distinguishes the YAML format from workflow-engine semantics and covers validation, scheduling, idempotency, isolation, artifacts, secrets, and recovery. No material omissions remain in the supplied topic scope.
