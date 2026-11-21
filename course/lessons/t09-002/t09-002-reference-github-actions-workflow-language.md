# CI CD builds tests artifacts deployment and rollback — Reference: Current Actions events, jobs, matrices, expressions, outputs, and reusable workflows

Sources: [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [Events that trigger workflows](https://docs.github.com/en/actions/reference/events-that-trigger-workflows).

## Scope and version

Covers the exact assigned inventory against current GitHub Actions documentation checked 2026-11-20. Runner images, action runtimes, product-plan capabilities, and event details can change independently; verify current behavior before depending on it.

### Recent workflow-syntax changes

GitHub Actions schedules support POSIX cron, UTC by default or an IANA timezone, and a minimum interval of five minutes. They use the latest default-branch commit; heavy platform load can delay runs, so do not use a schedule as a precise timer. Concurrency serializes matching work. The default retains at most one pending run and replaces an older pending run; `queue: max` allows up to 100 pending runs. Queue order follows when work starts waiting, not dispatch time. `queue: max` cannot be combined with `cancel-in-progress: true`. [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) · [Events](https://docs.github.com/en/actions/reference/events-that-trigger-workflows) · [Limits](https://docs.github.com/en/actions/reference/limits)

## How this group fits the mental model

Actions YAML describes event triggers and a job graph. Each job/step gets specific contexts and permissions, so trigger filters and untrusted event data are security decisions as well as syntax.

## Supplied names explained

- `GitHub Actions workflow` — A top-level automated process defined in a workflow YAML file and composed of one or more jobs triggered by an event or schedule.
- `Workflow YAML` — YAML configuration that declares triggers, permissions, environment defaults, concurrency, and the job graph. YAML indentation and quoting affect meaning.
- `workflow name` — The display name shown for workflow runs; it helps people identify automation but does not grant permissions or define its trigger.
- `on.push` — Runs on selected pushes; branch/tag filters and path filters narrow which refs or files qualify.
- `on.pull_request` — Runs for selected pull-request activities and base branches; fork context and token permissions require special security care.
- `on.schedule` — Runs on POSIX cron, UTC by default or an IANA timezone. Minimum interval is five minutes; it uses the latest default-branch commit and can be delayed under load.
- `on.workflow_dispatch` — Enables manual initiation with declared inputs; the chosen ref and input validation must be considered.
- `on.workflow_call` — Makes a workflow callable from another workflow and defines its reusable interface.
- `on.workflow_run` — Starts after named workflows complete; avoid treating completion as proof of a trusted artifact without checking the source run/ref.
- `on.merge_group` — Runs checks for a merge-queue candidate ref; required checks need to include this event where merge queues are used.
- `Workflow filter branches` — Restricts matching event runs to named branch patterns; understand whether the event refers to source or target branch.
- `Workflow filter paths` — Restricts push/pull-request runs to changes in selected paths; filters can accidentally skip required checks.
- `Workflow filter tags` — Restricts push events to matching tag names, often for release workflows.
- `Workflow activity types` — Selects which activities of an event trigger the workflow, reducing unnecessary runs while potentially skipping needed cases.
- `Job` — A schedulable unit in the workflow graph that runs on one runner and contains ordered steps.
- `runs-on` — Selects a GitHub-hosted or self-hosted runner label; runner image contents and labels can evolve.
- `needs` — Declares prerequisite jobs and permits reading their outputs; a failed dependency normally blocks downstream work unless conditions alter it.
- `steps` — Ordered actions and shell commands within a job; steps share that job’s runner filesystem and environment.
- `uses` — References an action or reusable workflow; it executes third-party or repository code and should follow pinning/audit policy.
- `run` — Executes shell script text on the runner; quote validated data and specify the shell to avoid injection and platform surprises.
- `with` — Provides named inputs to an action or reusable workflow; input names and value types come from that component’s contract.
- `env` — Defines environment variables at workflow, job, or step scope; narrower scope limits accidental exposure.
- `defaults.run.shell` — Sets the default shell for run steps; explicit shell settings make command behavior and error handling clearer.
- `defaults.run.working-directory` — Sets the default directory for shell commands; use a path that matches the checked-out project.
- `if expression` — Conditional expression controlling a job or step; understand implicit status checks and when to use explicit status functions.
- `Expression context` — A namespace of workflow values available at particular YAML keys; context availability differs by key and evaluation time.
- `github context` — Event and repository metadata such as ref, actor, and event payload; payload fields may be untrusted input.
- `env context` — Environment variables declared in workflow configuration, subject to scope and evaluation rules.
- `vars context` — Configuration variables for non-secret values; do not use them to store credentials.
- `secrets context` — Secret values exposed only in supported workflow contexts; avoid printing/interpolating them and minimize which jobs can access them.
- `inputs context` — Values supplied to a reusable or manually triggered workflow; validate them before using in shell, paths, or deployment targets.
- `needs context` — Results and outputs from prerequisite jobs; it is populated only for jobs declared as dependencies.
- `strategy.matrix` — Expands one job into multiple runs over combinations of declared values, useful for platform/runtime coverage.
- `include matrix entry` — Adds or augments selected matrix combinations with values without applying them to every combination.
- `exclude matrix entry` — Removes matching combinations from an expanded matrix to avoid unsupported or unnecessary runs.
- `fail-fast matrix option` — Controls whether remaining matrix jobs are cancelled after one failure; disable when complete diagnostic results matter.
- `max-parallel matrix option` — Caps simultaneously running matrix jobs to manage capacity, cost, or external service pressure.
- `continue-on-error` — Allows a selected step/job failure without failing the overall run; use narrowly so required failures are not hidden.
- `Job output` — A named value exported from a completed job to dependent jobs; use for small metadata, not files or secrets.
- `Step output` — A value written by a step for later workflow steps or dependent jobs to consume.
- `GITHUB_OUTPUT` — Runner-provided environment-file path through which a step writes output values; handle multiline data using documented delimiters.
- `GITHUB_ENV` — Runner-provided file for setting environment variables available to subsequent steps in the same job.
- `GITHUB_STEP_SUMMARY` — Runner-provided file for adding Markdown summary content to the run interface; do not include secrets.
- `Reusable workflow` — A workflow invoked through workflow_call, letting teams centralize a job graph and its controls.
- `workflow_call input` — A typed named parameter passed by a caller; define required/default behavior and validate values before use.
- `workflow_call output` — A value surfaced by the called workflow from a job output to its caller.
- `workflow_call secret` — A secret the caller explicitly passes to a reusable workflow; avoid broad secret inheritance without need.
- `Composite action` — An action that bundles multiple steps behind one action interface; its internal steps still run in the caller’s job context.
- `JavaScript action` — An action implemented in JavaScript and executed by the runner’s supported Node runtime; runtime deprecations can require updates.
- `Docker container action` — An action executed in a container image, providing a defined environment but still requiring image and source trust.
- `workflow_dispatch input` — A user-supplied manual trigger parameter; declare type/options/default and validate it before acting.
- `Workflow concurrency group` — A key that identifies runs competing for the same resource or branch, enabling serialization or cancellation policy.
- `cancel-in-progress` — A concurrency policy that can stop an active run when a newer one starts; dangerous for deployments with side effects.
- `Concurrency queue policy` — `single` (default) keeps one pending run and replaces it with a newer one; `max` permits up to 100 pending runs, but ordering follows wait-start time and is not guaranteed by dispatch order. `max` cannot pair with `cancel-in-progress: true`.
- `Job timeout-minutes` — Upper limit on job duration, helping terminate hung work while allowing valid slow tasks to finish.
- `Workflow permissions` — Default GITHUB_TOKEN scope for jobs; prefer minimum read access, then raise only required scopes.
- `Job-level permissions` — Per-job override of token scopes, isolating a publishing/deploying job from ordinary validation.
- `Workflow artifact` — A set of files uploaded from a workflow run for retention or transfer between jobs; distinct from cache.

## Cross-item comparison

Events trigger; jobs form dependencies; matrices vary inputs. Outputs pass small values; artifacts transfer files. Reusable workflows share jobs; composite actions bundle steps.

## Examples

A read-only pull-request job checks untrusted code. A trusted main-branch publish job gets package-write permission only after checks, and downloads the build artifact instead of rebuilding.

## Common mistakes

Check event filters and context availability. Never interpolate untrusted event text into shell commands or execute fork code with privileged secrets.

## Knowledge checks with answers

1. **What does a job dependency express?** A required completion relationship; downstream jobs can consume outputs/artifacts only through supported mechanisms.
2. **Why pin third-party actions?** A mutable tag can change behavior; pinning an immutable commit improves supply-chain repeatability.
3. **How should untrusted event text be handled in scripts?** Pass it as data through environment/arguments and validate it; do not interpolate it into shell code.
