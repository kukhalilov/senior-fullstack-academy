# Kubernetes workloads configuration scheduling and networking — Reference: Pod structure, initialization, sidecars, container lifecycle, and probes

Sources: [Pods](https://kubernetes.io/docs/concepts/workloads/pods/), [Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/), [Probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/), [Sidecar containers](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/), [Ephemeral containers](https://kubernetes.io/docs/concepts/workloads/pods/ephemeral-containers/), and [User namespaces](https://kubernetes.io/docs/concepts/workloads/pods/user-namespaces/).

## Scope and version

This reference covers the Pod and container interfaces relevant to workloads. A Pod is a Kubernetes API and execution boundary; exact runtime behavior can depend on the supported Kubernetes version, kubelet, CRI runtime, CNI and storage configuration. Current upstream version checked 2026-11-16: v1.37.1. Native restartable init-container sidecars are stable since v1.33. Consult the target cluster's docs for feature support and platform-specific constraints.

## How this group fits the mental model

The Pod template is replicated by a workload controller. The scheduler chooses a node for each Pod; the kubelet realizes it there. Containers in a Pod share its network identity and may share volumes. Probes and conditions communicate different kinds of health. Pod replacement is ordinary, so durable state and stable client identity must live outside the Pod IP/UID.

## Supplied names explained

### Pod identity, containers, and startup ordering

- `Pod` — Smallest schedulable unit. Its containers share a network namespace, Pod IP, and explicitly mounted shared volumes; keep tightly coupled processes together.
- `Pod template` — Embedded Pod specification in a controller such as Deployment. Changing it generally creates replacement Pods through the controller's rollout behavior.
- `Pod UID` — Unique identifier for one Pod object incarnation. A replacement gets another UID even if its name is reused.
- `Pod IP` — Address assigned to the Pod by the cluster network. It can change after replacement; use a Service for stable discovery.
- `Pod phase` — Coarse lifecycle summary such as Pending, Running, Succeeded, Failed or Unknown. `Running` is not equivalent to Ready.
- `Pod condition` — Typed status signal such as PodScheduled, Initialized, Ready or ContainersReady, with status/reason/message and transition information.
- `Pod readiness gate` — Additional condition that must be true before Pod Ready becomes true. A controller/integration must populate the condition; an unknown gate can keep a Pod unready.
- `Pod sandbox` — Runtime-created isolation environment for a Pod, especially its shared network namespace. A sandbox failure can block all containers.
- `Pod restartPolicy` — Pod-level `Always`, `OnFailure` or `Never` behavior used when a container exits. Controllers still decide whether to replace the whole Pod.
- `Pod-level resources` — Beta since v1.34 and enabled by default upstream as of v1.37. A Pod-level CPU/memory/hugepage budget can let containers share idle resources; it is a separate feature from container-level requests and limits and must be checked against node/runtime support.
- `Pod user namespace` — Stable since v1.36, Linux user-namespace isolation maps container UIDs/GIDs to distinct host IDs; opt-in requires compatible runtime, filesystem and node support and forbids host PID/IPC/network namespaces ([v1.36 release announcement](https://kubernetes.io/blog/2026/04/23/kubernetes-v1-36-userns-ga/)).
- `hostUsers` — Pod field; `false` opts a Linux Pod into a user namespace when supported. Do not set it without checking host namespace, block-device and filesystem limitations.
- `runtimeClassName` — Selects a RuntimeClass configuration by name, often for a specialized runtime handler or overhead. The RuntimeClass must exist and supported nodes must provide its handler.
- `shareProcessNamespace` — Allows containers in a Pod to view and signal each other's processes through a shared process namespace; it changes isolation and can expose process details.
- `Container` — Runtime instance declared in a Pod. It has an image, command, environment, resources, mounts, security settings and lifecycle.
- `Application container` — Ordinary long-running workload container in `spec.containers`; it may be restarted by the kubelet according to Pod policy.
- `Init container` — Sequential startup container in `spec.initContainers`. It must complete successfully before the next init container and application containers start.
- `Restartable init container` — Init-container entry with `restartPolicy: Always`; it starts before later init/application containers and continues running as a native sidecar.
- `Native sidecar container` — Restartable init container with ordered startup and shutdown relative to the Pod's main containers; useful for proxies, log agents or setup helpers that share Pod lifetime.
- `Ephemeral container` — Temporary troubleshooting container added to an existing Pod. It cannot be declared in the Pod template and does not behave like a normal restartable app container.
- `Container lifecycle hook` — `lifecycle` actions that run at container start/stop, commonly HTTP, exec, or sleep forms supported by the API/runtime. They are best-effort bounded actions, not durable workflow orchestration.
- `PostStart hook` — Runs after container creation, but may race with the image entrypoint; it is not a guarantee that the application has completed startup.
- `PreStop hook` — Runs before termination, commonly to drain or notify. Its time is within the termination grace budget and can delay SIGTERM delivery.
- `Container termination grace period` — Pod/container termination time budget (Pod-level by default, with supported overrides). After the grace period, remaining processes may be force killed.

### Image, process, and configuration inputs

- `ImagePullPolicy` — Controls whether kubelet pulls an image (`Always`, `IfNotPresent`, `Never`); defaulting depends partly on image tag/digest at object creation.
- `IfNotPresent image pull policy` — Use a local image if present, otherwise pull. Mutable tags can produce different bits on different nodes.
- `Always image pull policy` — Resolve/pull the image on each container start; image layers may be cached, but tag-to-digest resolution can vary if the tag is mutable.
- `Never image pull policy` — Never pull. Startup fails if the required image is not already available on the node.
- `imagePullSecrets` — Names of same-namespace Secrets with registry credentials; kubelet uses them for private image pulls. Prefer managed credential providers where available.
- `Container command` — Overrides image `ENTRYPOINT` semantics in Kubernetes' exec-style configuration; verify the image/runtime argument mapping.
- `Container args` — Arguments passed to the selected command, commonly replacing image `CMD` defaults.
- `Container environment variable` — Process environment value set at container start. It does not automatically change inside a running process when a source object changes.
- `EnvVar` — API shape for a literal `value` or `valueFrom` source such as a Secret/ConfigMap key or field reference.
- `EnvFromSource` — Imports multiple keys from a ConfigMap or Secret into environment variables, optionally with a prefix. Avoid collisions and accidental secret exposure.
- `Downward API` — Exposes selected Pod/container metadata (and some resource fields) through environment variables or files without querying the API directly.
- `Container ports` — Declared port metadata useful for named `targetPort` resolution and tooling; declaring a port does not open a firewall or bind a process.
- `ContainerPort` — Named/numbered protocol port on a container. The process must listen on the right interface and port for traffic to work.

### Health checks and failure behavior

- `Probe` — Kubelet test that observes a container. A probe failure affects readiness, startup gating or container restart depending on probe type.
- `Startup probe` — Delays liveness/readiness checks until startup succeeds; use it for slow or variable initialization instead of an oversized liveness delay.
- `Liveness probe` — Indicates whether restarting a container is an appropriate recovery. A poor check can cause cascading restarts under load or dependency failures.
- `Readiness probe` — Indicates whether a container should receive traffic. Failed readiness removes the Pod from ready Service endpoints without necessarily restarting it.
- `exec probe action` — Runs a command in the container and considers its exit status. Keep commands installed, bounded and cheap.
- `httpGet probe action` — Sends an HTTP request to a configured port/path/host/scheme. A response in the accepted range succeeds; ensure the endpoint tests useful local readiness.
- `tcpSocket probe action` — Checks whether a TCP connection can be opened; it confirms a listener, not business-level correctness.
- `gRPC probe action` — Calls the gRPC health-check protocol on a port; configure compatible service behavior and understand that named ports are not supported for this action.
- `Probe initialDelaySeconds` — Delay before the kubelet starts a probe. Startup probes are usually better for unknown startup duration.
- `Probe periodSeconds` — Approximate interval between checks; many failing Pods can make aggressive checks expensive.
- `Probe timeoutSeconds` — Per-check time limit. Set it above ordinary response latency while keeping failure detection bounded.
- `Probe successThreshold` — Consecutive successes needed to recover from failure; liveness/startup generally require one.
- `Probe failureThreshold` — Consecutive failures before the probe fails; tune to tolerate transient faults without masking a real problem too long.
- `Probe terminationGracePeriodSeconds` — Probe-specific grace period for a failed liveness/startup probe when supported; it can override the normal Pod shutdown budget for that restart.
- `Container restart backoff` — Increasing delay between repeated failed starts, preventing tight crash loops; this is a kubelet behavior, not a retry policy for application requests.
- `CrashLoopBackOff` — Displayed waiting reason after repeated container exits. Inspect current and previous logs, exit code, events, config and resource pressure.
- `ImagePullBackOff` — Retry backoff after image retrieval failed. Check image name/tag/digest, registry reachability, credentials, rate limits and architecture.

### Termination and interactive diagnosis

- `Pod termination` — Graceful deletion marks the Pod terminating, allows shutdown hooks/processes to stop, then ends remaining processes after the grace period. Traffic and endpoint removal are coordinated but timing is not an application protocol guarantee.
- `SIGTERM in Kubernetes` — Normal termination signal sent to the container's main process; ensure PID 1 forwards/handles it and the app drains safely.
- `SIGKILL after termination grace period` — Forced termination after the allowed time. No cleanup handler can catch SIGKILL; data consistency requires earlier flushing/checkpointing.
- `kubectl debug` — Creates a debugging workflow, including ephemeral containers or copied Pods where supported; it changes cluster state and requires authorization.
- `Ephemeral debug container` — Ephemeral container aimed at an existing Pod, useful when the original image has no shell/tools. It shares Pod namespaces according to configuration and is not a permanent fix.

## Cross-item comparison

| Signal/action | Main question | Effect of failure |
|---|---|---|
| Startup probe | Has initialization completed? | Holds off startup-dependent health checks; repeated failure restarts the container |
| Liveness probe | Should this process be restarted? | Kubelet restarts container after the failure threshold |
| Readiness probe | Should this instance receive traffic? | Pod is not Ready; Service should not send it new traffic |
| Lifecycle hook | Can this process perform a bounded start/stop action? | Hook can fail or time out; application still needs safe behavior |

## Examples

```yaml
spec:
  terminationGracePeriodSeconds: 45
  containers:
    - name: api
      image: example.invalid/api@sha256:REPLACE_WITH_DIGEST
      ports:
        - name: http
          containerPort: 8080
      startupProbe:
        httpGet: { path: /startup, port: http }
        periodSeconds: 5
        failureThreshold: 24
      readinessProbe:
        httpGet: { path: /ready, port: http }
        periodSeconds: 5
        timeoutSeconds: 2
      livenessProbe:
        httpGet: { path: /live, port: http }
        periodSeconds: 10
        failureThreshold: 3
```

The startup window here is approximately two minutes plus probe timing. Readiness and liveness endpoints should have different contracts: a temporarily overloaded instance may be unready, but restarting every instance during shared database trouble is often harmful.

## Common mistakes

- Using mutable `latest` tags and expecting identical deployed bits.
- Treating a declared container port as a firewall rule or proof that a process listens on it.
- Putting dependency checks in liveness and causing restart storms.
- Letting readiness report success before required local initialization is complete.
- Assuming environment variables update in place after changing a Secret or ConfigMap.
- Using `subPath` and expecting projected data to refresh like a normal projected directory.
- Forgetting that hooks consume shutdown time and that SIGKILL cannot be handled.
- Debugging only the current log after a restart; use `kubectl logs --previous` and Events.
- Putting unrelated services in one Pod merely to share localhost; this also couples failure, scaling and placement.

## Knowledge checks with answers

1. `A Pod is Running but receives no Service traffic. Why?` Running is not Ready; inspect conditions, readiness probe, Service selector and EndpointSlices.
2. `The app needs four minutes to start. Should liveness have a four-minute delay?` Prefer a startup probe sized for realistic startup and let it gate liveness/readiness, then keep liveness detection appropriate for a hung process.
3. `When is an init container preferable to a sidecar?` For work that must finish before app startup. Use a restartable init container for a helper that must remain alongside the app.
4. `What happens after the termination grace period?` Remaining processes may receive SIGKILL, which cannot run cleanup code. Make normal shutdown finish within the budget.
5. `Why might image pull fail despite a correct tag?` Credentials, registry access/rate limits, platform architecture, digest or node/runtime issues can prevent retrieval.
6. `Does changing a ConfigMap environment source update the running process?` No; environment is read at container start. Roll/restart or use a reloadable mounted-file design.
