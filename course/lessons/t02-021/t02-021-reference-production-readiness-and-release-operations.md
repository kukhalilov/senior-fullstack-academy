# deployment settings environments troubleshooting and performance — Reference: published application configuration rollout compatibility and operational checks

## Scope and version

This lesson connects publish output to safe production rollout. Publish modes change what runtime/platform is required and which features can be used. A rolling release may run old and new app versions at once, and rollback cannot automatically reverse persisted data changes. Container, IIS, cloud, and orchestrator procedures are handled in the infrastructure track. [`dotnet publish`](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-publish) [Deployment modes](https://learn.microsoft.com/en-us/dotnet/core/deploying/deployment-modes) [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module)

## How this group fits the mental model

Build and test a known artifact, publish it for the intended runtime mode and target platform, supply environment-specific configuration at deployment, and validate readiness before routing user traffic. During rolling changes, assume both versions coexist. Persistent keys and database schemas must remain compatible across process restart, replica replacement, and rollback.

## Supplied names explained

| Supplied name | Explanation |
|---|---|
| `dotnet publish output and application deployment artifact` | Publish produces the files/package intended for deployment; deploy this output rather than relying on a developer's `bin` directory or launch profile. |
| `Framework-dependent deployment` | Publishes the app without bundling the .NET runtime; the target machine/container must have a compatible shared framework installed. |
| `Self-contained deployment` | Includes the runtime for a selected target runtime identifier; output is larger and runtime servicing must be republished. |
| `Single-file deployment` | Bundles app files into one executable shape where supported; some native/runtime files may still extract or remain separate depending on settings. Test path and reflection assumptions. |
| `ReadyToRun publishing option` | Adds ahead-of-time compiled code to reduce startup/JIT work in some scenarios, typically increasing size; measure on target architecture. |
| `Native AOT publishing boundary for supported ASP.NET Core features` | Native AOT can improve startup/size for supported app shapes, but reflection/dynamic-loading and framework feature compatibility are constrained; verify feature support before choosing it. |
| `Native AOT implies trimming and platform-specific native compilation` | Native AOT removes runtime JIT and requires trimming-compatible code; it cannot use runtime code generation or dynamic assembly loading and must target a supported OS/architecture. Review all publish warnings and feature support. |
| `ReadyToRun retains IL and native code` | ReadyToRun reduces some JIT work while retaining IL and native code in a larger artifact; it is not Native AOT and supports a broader library shape. |
| `Single-file is independent of self-contained and Native AOT modes` | Single-file describes packaging. It does not by itself bundle the shared runtime or remove trimming/AOT compatibility constraints. |
| `Runtime identifier and platform-specific publish output` | Selects OS/architecture-specific native assets and runtime behavior; publish and test for the actual deployment target. |
| `ASP.NET Core shared framework and installed runtime compatibility` | Framework-dependent apps need a compatible installed shared framework; patch level/roll-forward behavior must match policy. |
| `Use the current supported ASP.NET Core release` | Keep to a supported release for security fixes and servicing; plan regular upgrades and compatibility testing. |
| `Configuration supplied by deployment environment rather than source defaults` | Keep environment-specific values and credentials out of repository defaults; inject through deployment configuration and protected providers. |
| `Environment-specific configuration validation before rollout` | Check required keys, formats, permissions, and dependency endpoints in the target environment before routing production traffic. |
| `Health check endpoint integration with deployment readiness` | Let the deployment platform use readiness signals to decide whether an instance should receive traffic; keep readiness semantics distinct from liveness. |
| `Readiness versus liveness health-check semantics` | Readiness answers whether an instance should receive traffic; liveness answers whether the process should be restarted. Avoid making temporary dependency outages fail liveness and trigger restart loops. |
| `Health check endpoint output and access control` | Expose only the information the orchestrator needs and restrict detailed dependency output to trusted operators; health endpoints can disclose service topology. |
| `Graceful shutdown and connection draining before termination` | Stop accepting new work, allow in-flight requests to complete within the orchestrator/host deadline, and drain connections safely. |
| `Database expand-and-contract compatibility during rolling deployment` | Add compatible schema first, deploy code that supports both forms, migrate/backfill, then remove old schema after old instances are gone. |
| `Application version and service identity in logs and telemetry` | Include stable service/version/deployment metadata to correlate errors and performance with the released artifact. |
| `Production logging level and log retention boundary` | Keep useful structured events while controlling volume, access, sensitive fields, and retention according to operational needs. |
| `Secret rotation without publishing secret values` | Introduce a new credential, allow safe overlap/refresh, switch consumers, then revoke the old one; log only rotation status/identity. |
| `Data Protection key persistence across app restarts and replicas` | Persist and share the key ring when encrypted/authenticated payloads must survive restart or move between replicas; protect the key store. |
| `Time synchronization and certificate expiration monitoring` | Clock skew affects tokens, signatures, and scheduled behavior; monitor time and certificate lifetimes to rotate before expiry. |
| `Static assets and backend API version compatibility` | Frontend assets may remain cached while backend versions roll; use compatible API evolution and fingerprinted asset names. |
| `Smoke testing published output rather than only development launch profile` | Run the actual published artifact with production-like environment, filesystem, identity, ports, and dependencies. |
| `Deployment rollback does not automatically roll back data changes` | App rollback leaves database migrations, queued messages, and user writes in place; design changes to remain backward-compatible and plan data recovery separately. |
| `Container and cloud deployment runbooks in infrastructure topics t09-003 through t09-013` | Scope boundary for platform-specific deployment, orchestration, cloud, and operations procedures. |

## Cross-item comparison

Framework-dependent publish minimizes output but relies on a compatible installed shared framework; self-contained publish carries a runtime and requires republishing for runtime security updates. ReadyToRun precompiles selected code but is not the same as Native AOT, which imposes stronger compatibility constraints. Single-file changes packaging, not necessarily deployment configuration or key persistence. A smoke test of published output validates the artifact path; a health/readiness probe continually informs traffic routing. Neither replaces staged rollout and compatibility checks.

## Examples

### Expand-and-contract rollout

Suppose a table column `DisplayName` will be replaced by `PublicName`. First add `PublicName` without removing `DisplayName`. Deploy code that writes both and can read either. Backfill old records and verify. Deploy code that reads the new field while old app instances are gone. Only then remove the old field in a later release. If rollback is needed before cleanup, the old version still has its required column and the new version tolerates both.

### Publish-mode decision

For a framework-dependent Linux container, publish for the intended Linux RID or framework-dependent container layout and include a compatible runtime in the base image. For a self-contained executable, publish for the exact architecture and schedule a republish when .NET receives security servicing. In either case smoke-test the published output, not a local profile with development certificates and a developer's user secrets.

## Common mistakes

- Assuming self-contained output automatically receives later runtime security patches.
- Assuming one publish artifact is portable across all operating systems/architectures.
- Selecting Native AOT without checking ASP.NET Core feature and reflection compatibility.
- Treating readiness as the same thing as process liveness or dependency health.
- Removing a database field while old app instances may still run during a rollout.
- Believing app rollback reverts data, messages, or external side effects.
- Losing Data Protection keys on restart or using separate rings on replicas that must decrypt each other's cookies/tokens.
- Publishing secrets into appsettings or deployment artifacts.
- Testing only under a local launch profile with different content root, environment, identity, and runtime.
- Ignoring cache overlap between fingerprinted frontend assets and rolling backend versions.

## Knowledge checks with answers

1. **What must exist for framework-dependent deployment?** A compatible installed shared framework on the target.
2. **Does self-contained mean no runtime patching work?** No; republish with the serviced runtime.
3. **Why use expand-and-contract schema rollout?** Old and new app versions can overlap while each remains compatible with the schema.
4. **Does rolling back binaries undo data writes?** No. Persisted changes need a separate compatible or restorative plan.

## Sources

[`dotnet publish`](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-publish) · [Deployment modes](https://learn.microsoft.com/en-us/dotnet/core/deploying/deployment-modes) · [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module)

### Additional application release checks

For Native AOT, inspect every publish analyzer warning and verify all framework/library features used by the app are supported. AOT implies trimming and native compilation, disallows runtime code generation and dynamic assembly loading, and produces platform/architecture-specific output. ReadyToRun is less restrictive and retains IL alongside native code; it reduces some JIT work but increases artifact size and still requires a compatible runtime unless combined with self-contained deployment. Single-file is a packaging choice and does not by itself mean self-contained or Native AOT.

When adding health endpoints, separate readiness from liveness when initialization or dependencies can be temporarily unavailable. Readiness controls traffic admission; liveness should normally indicate whether restarting the process is appropriate. A failed dependency check on liveness can create restart loops. Protect detailed health output from public access and return only the status needed by the orchestrator.
