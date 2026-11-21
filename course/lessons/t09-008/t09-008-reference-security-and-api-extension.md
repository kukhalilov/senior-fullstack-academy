# Kubernetes workloads configuration scheduling and networking — Reference: RBAC, security controls, API extension, and diagnosis

Sources: [Controlling access to the Kubernetes API](https://kubernetes.io/docs/concepts/security/controlling-access/), [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/), [ServiceAccounts](https://kubernetes.io/docs/concepts/security/service-accounts/), [Pod Security Standards](https://kubernetes.io/docs/concepts/policy/pod-security-standards/), [Pod Security Admission](https://kubernetes.io/docs/concepts/policy/pod-security-admission/), [Custom resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/), [Admission controllers](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/), [Admission webhooks](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/), and [API deprecation policy](https://kubernetes.io/docs/reference/using-api/deprecation-policy/).

## Scope and version

This guide covers workload identity, authorization, Pod hardening, extension APIs and diagnostic tools. The upstream release checked 2026-11-20 is Kubernetes v1.37.1. Authentication plugins, admission policies, audit configuration and security enforcement vary by cluster. Always check the active context and target API before running commands with access to production.

## How this group fits the mental model

Kubernetes request handling separates authentication (who is calling), authorization (whether the caller may do it), admission (whether/how the request is allowed), and controller/runtime behavior. A workload's ServiceAccount identity is independent of its Linux UID and network reachability. Pod security settings constrain processes, while RBAC and admission constrain API interactions. Custom APIs need a schema and usually a controller to provide behavior.

## Supplied names explained

### Workload identity and API access

- `ServiceAccount` — Namespaced identity for a Pod or automation accessing the API. Grant only the needed actions/resources and avoid broad default access.
- `default ServiceAccount` — Automatically available in each namespace. Do not assume its RBAC is harmless; disable token mounting for workloads that do not need the API.
- `Projected ServiceAccount token` — Token provided through a projected volume, with audience and expiration controls; applications should reload rotated tokens when required.
- `Bound ServiceAccount token` — Short-lived token bound to a Pod or other object context, reducing replay lifetime compared with legacy long-lived credentials.
- `TokenRequest API` — API for requesting a ServiceAccount token with audience/expiration/binding options; callers need authorization to request tokens.
- `Kubernetes RBAC` — Role-based authorization using verbs, API groups, resources, resource names, and namespace/cluster binding scope. Rules are additive; RBAC has no deny rule.
- `Role` — Namespaced set of permissions for namespaced resources in one namespace.
- `ClusterRole` — Reusable or cluster-scoped permission set; it can include namespaced resources when bound by a RoleBinding.
- `RoleBinding` — Binds a Role or ClusterRole to subjects within one namespace, limiting the grant to that namespace for namespaced resources.
- `ClusterRoleBinding` — Binds a ClusterRole to subjects cluster-wide; broad grants require careful review.
- `Kubernetes authentication` — Establishes caller identity through configured credentials/providers, such as certificates, tokens or external identity integrations.
- `Kubernetes authorization` — Evaluates whether an authenticated identity may perform a requested action; RBAC is common, but other authorizers can be configured.
- `Kubernetes admission` — Post-authentication/authorization processing that can validate, mutate or reject object writes. Admission is not an authorization substitute.
- `Kubernetes audit log` — Configured record of API requests and outcomes. Policy controls detail/retention; audit records help incident analysis but can contain sensitive metadata.

### Pod policy and process hardening

- `Pod Security Standards` — Three profiles describing increasing restrictions for Pod security contexts: Privileged, Baseline and Restricted.
- `Privileged Pod Security Standard` — Unrestricted profile for trusted system workloads; allowing it broadly weakens isolation.
- `Baseline Pod Security Standard` — Prevents known privilege escalations while permitting common workload patterns.
- `Restricted Pod Security Standard` — Strongest built-in profile, enforcing hardening such as non-root and restricted capabilities, with versioned details.
- `Pod Security Admission` — Built-in admission controller enforcing/auditing/warning on namespace Pod Security Standard levels and policy versions.
- `Pod securityContext` — Pod-level security settings inherited by containers where applicable, such as group, supplemental groups and sysctls.
- `Container securityContext` — Per-container identity, privilege and runtime security settings; container values may override applicable Pod values.
- `runAsUser` — Linux UID for the process. A numeric identity is not automatically non-root; UID 0 is root.
- `runAsGroup` — Primary Linux GID for the process.
- `runAsNonRoot` — Requires the runtime to verify the process will not run as UID 0; image metadata and explicit UID affect verification.
- `allowPrivilegeEscalation` — Controls whether a process can gain privileges (for example, setuid behavior); it is effectively true for privileged containers or those with capabilities unless constrained.
- `readOnlyRootFilesystem` — Mounts the container root filesystem read-only; applications needing writable state should use explicit writable volumes.
- `capabilities add` — Adds selected Linux capabilities; each addition increases the process's host-kernel authority and should be justified.
- `capabilities drop` — Removes Linux capabilities, commonly dropping `ALL` then adding a minimal required subset.
- `seccompProfile` — Configures syscall filtering profile such as RuntimeDefault or Localhost; runtime/kernel support matters.
- `AppArmor profile` — Linux mandatory access-control profile constraining process behavior; enforcement depends on node OS/runtime policy and supported profile configuration.
- `SELinux options` — Security labeling settings for process/volume isolation on SELinux-enabled nodes. Version 1.37 changes make CSI-driver opt-in and Pod policy important for mount behavior.
- `hostPID` — Shares the host PID namespace. This can expose host processes and should be restricted.
- `hostIPC` — Shares host IPC namespace, potentially exposing/interfering with host IPC objects.
- `hostNetwork` — Uses host network namespace, changing port/DNS behavior and increasing exposure; Pod IP/Service assumptions can differ.
- `privileged container` — Broadly disables many isolation restrictions and grants extensive host capabilities; avoid outside trusted system-level agents.

### Extensible APIs and policy hooks

- `CustomResourceDefinition scope` — Whether instances of a custom type are Namespaced or Cluster scoped; choose scope according to ownership and access model.
- `Namespaced CRD` — CRD whose instances belong to namespaces, supporting tenant/workload scoping but still requiring RBAC/policy.
- `Cluster-scoped CRD` — CRD whose instances are cluster-wide; use only when the resource truly represents cluster-level state.
- `CRD schema validation` — OpenAPI schema used by the API server to validate structural custom objects and constrain field types/ranges.
- `OpenAPI v3 schema` — Structural schema format used by CRDs and API discovery; schema controls pruning, defaulting and validation behavior.
- `CRD defaulting` — Schema defaults applied to omitted fields at API processing time; clients should inspect stored objects and version conversion behavior.
- `CRD pruning` — Removes unspecified fields outside the structural schema to prevent unvalidated data from persisting.
- `CRD conversion webhook` — External service translating objects between served/storage versions when schema changes cannot be represented by simple conversion.
- `CRD version served` — Version clients may read/write through the API. It can be disabled after migration but must be supported by consumers.
- `CRD version storage` — Single version used for persisted custom objects at a point in time; migration is needed when changing it.
- `CRD status subresource` — Separate status update path that lets controllers update observed state without claiming user-owned spec fields.
- `CRD scale subresource` — Exposes replica-like scale fields to generic scaling tools and autoscalers when configured.
- `Kubernetes operator` — Controller plus domain knowledge, often using CRDs, to automate management of a complex application.
- `Operator pattern` — Reconcile custom desired state into application lifecycle actions such as install, backup or upgrade; controller availability and safe retries matter.
- `MutatingWebhookConfiguration` — Cluster object registering mutating admission webhook rules, selectors, timeouts, reinvocation and failure policy.
- `ValidatingWebhookConfiguration` — Registers admission validation webhooks. A slow/down webhook can block API writes according to its failure behavior.
- `Webhook failurePolicy` — `Fail` rejects requests when the webhook call errors/times out; `Ignore` permits them. Security validation often prefers fail-closed only when availability is engineered.
- `Kubernetes feature gate` — Component configuration toggling an alpha/beta feature where allowed. Some gates are locked or removed at maturity.
- `Kubernetes alpha feature` — Experimental feature, often disabled by default and subject to incompatible changes/removal.
- `Kubernetes beta feature` — Feature generally enabled by default but still subject to API/behavior changes; check release-specific status.
- `Kubernetes stable feature` — Generally available API/behavior with compatibility guarantees, but component/provider support and deprecation lifecycle still apply.
- `Kubernetes deprecation policy` — Rules governing API removal and notice period; users should migrate before served versions are removed.
- `Deprecated API warning` — API-server response warning when using a deprecated API, useful during upgrades but not a complete static scan.
- `kubectl convert` — Optional plugin-oriented conversion tool for supported manifest API versions; it may not be installed or handle semantic migration automatically.

### Diagnosis commands and common symptom names

- `kubectl get events` — Lists recent namespace or cluster events. Events are short-lived best-effort signals, not an audit or durable log store.
- `kubectl logs` — Reads container stdout/stderr; specify container for multi-container Pods and follow with `-f` when useful.
- `kubectl logs --previous` — Reads the prior terminated container instance's log when kubelet retained it; essential for restart diagnosis.
- `kubectl exec` — Runs a process in a running container. It requires authorization and an executable in the image; it is not available for all minimal images.
- `kubectl port-forward` — Establishes a local tunnel to a Pod/Service for debugging. It is not a production ingress path or a general network-policy test from real clients.
- `kubectl top nodes` — Displays recent CPU/memory usage via resource metrics API; it is not historical monitoring.
- `kubectl top pods` — Displays recent Pod/container resource metrics; availability depends on metrics API/provider.
- `kubectl auth can-i` — Checks an authorization decision for the current or specified identity/verb/resource/namespace; it does not check admission, network or application authorization.
- `kubectl api-resources` — Lists API resources served by the current cluster and their scope/group/version discovery.
- `kubectl api-versions` — Lists API group/version pairs served by the current API server; not every kind under a group is necessarily enabled.
- `kubectl config get-contexts` — Lists configured contexts, clusters, users and current context markers; verify before applying changes.
- `kubectl config use-context` — Changes the current kubeconfig context and therefore the default cluster/user/namespace selection.
- `kubectl cluster-info` — Displays cluster control-plane endpoints and core service information; it does not prove every node/add-on is healthy.
- `Pod Pending diagnosis` — Inspect events, conditions, scheduler constraints, quota, PVC binding, image preparation and admission outcomes.
- `Unschedulable Pod condition` — Status indicating scheduler could not currently place the Pod. Events explain likely reasons; capacity/constraints may later change.
- `CrashLoopBackOff diagnosis` — Inspect previous logs, exit code, probes, entrypoint, config, dependencies, resource limits and termination reason.
- `Image pull failure diagnosis` — Check image reference/digest, node architecture, registry DNS/network, credentials, trust and pull limits.
- `OOMKilled diagnosis` — Compare container memory limit, usage trend, node pressure and workload peak; increasing memory may hide a leak.
- `Node NotReady condition` — Indicates node health/heartbeat problem. Check node conditions/events and cluster/node monitoring, not only the affected Pod.
- `Service endpoint diagnosis` — Compare Service selector/port with Pod labels/readiness and EndpointSlices, then test data-plane routing.
- `DNS resolution diagnosis` — Test from a Pod, inspect resolver config and CoreDNS health/configuration, search suffixes, egress policy and upstream DNS.

## Cross-item comparison

| Layer | Identity/decision | Example diagnostic |
|---|---|---|
| Authentication | Who made the API call? | Inspect kubeconfig, token/identity-provider setup, audit record |
| Authorization | May this identity perform this verb on this resource? | `kubectl auth can-i` |
| Admission | Is the object accepted or mutated under policy? | API error/warning, webhook/policy logs, namespace labels |
| Runtime security | What can the container process access? | Pod/container security context, runtime profile, node configuration |
| Network | Can packets reach the workload? | EndpointSlice, DNS, routes, CNI policy, listener |

## Examples

Check permissions in an explicit namespace and resource context:

```sh
kubectl auth can-i patch deployments.apps -n production
kubectl auth can-i get secrets -n production --as=system:serviceaccount:production:api
kubectl api-resources
kubectl get events -n production --sort-by=.lastTimestamp
kubectl describe pod api-7c9f -n production
kubectl logs api-7c9f -n production -c api --previous
```

A hardened application container typically starts with a non-root UID, read-only root filesystem, dropped capabilities, and a runtime-default seccomp profile. Add only required writable mounts or capabilities. A policy may reject the Pod before scheduling; inspect admission errors rather than misdiagnosing it as a node problem.

## Common mistakes

- Granting `cluster-admin` to application ServiceAccounts for convenience.
- Assuming a namespace boundary alone isolates tenants.
- Confusing ServiceAccount API identity with Linux `runAsUser`.
- Mounting API tokens into workloads that do not need them.
- Using privileged mode or host namespaces to solve an ordinary file permission problem.
- Assuming a webhook is harmless if it is external; fail-closed outages can block writes cluster-wide.
- Adding a CRD without deploying/versioning its controller and conversion webhooks.
- Treating audit logs or Events as indefinite storage without a retention pipeline.
- Using `kubectl port-forward` as proof that normal client traffic is allowed.
- Assuming `kubectl auth can-i` covers admission or application-level authorization.
- Treating `kubectl convert` as a complete API migration plan.
- Ignoring API warnings until an upgrade removes the old served version.

## Knowledge checks with answers

1. `What is the difference between authentication and authorization?` Authentication establishes the caller identity; authorization decides whether that identity may perform the requested action.
2. `Does a RoleBinding to a ClusterRole grant cluster-wide resource access?` No, the RoleBinding scopes the grant to its namespace for namespaced resources; a ClusterRoleBinding is cluster-wide.
3. `What if a CRD exists but the operator is down?` Objects may still validate/store, but reconciliation stops; status becomes stale and desired behavior is not realized.
4. `Why use projected, bound ServiceAccount tokens?` They support shorter lifetime/audience binding and reduce risk versus long-lived static credentials; applications must handle rotation.
5. `When might webhook `failurePolicy: Fail` be dangerous?` If the webhook is unavailable and broadly matches API writes, requests can be blocked; engineer redundancy and narrow rules.
6. `What does `kubectl auth can-i` not prove?` It does not prove admission acceptance, network reachability or application-level authorization.
