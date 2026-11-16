# Kubernetes workloads configuration scheduling and networking — Reference: API objects, metadata, declarative apply, selectors, and controllers

Sources: [Objects in Kubernetes](https://kubernetes.io/docs/concepts/overview/working-with-objects/), [Controllers](https://kubernetes.io/docs/concepts/architecture/controller/), [Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/), and [kubectl](https://kubernetes.io/docs/reference/kubectl/).

## Scope and version

This guide explains the Kubernetes API and common object-management tools used by workload authors. The API evolves: check the target cluster's discovery and versioned documentation before relying on fields, API groups, or client behavior. Helm and Kustomize are packaging/rendering tools that produce Kubernetes objects; they are not built-in controllers that make arbitrary application state healthy.

## How this group fits the mental model

The API server is the authenticated, validated entry point for durable desired state. Metadata identifies objects and lets clients/controllers relate them. Controllers observe state and reconcile dependencies. `kubectl` serializes requests but does not itself guarantee that asynchronous reconciliation succeeds. Declarative workflows keep the intended state reviewable and make drift visible.

## Supplied names explained

### API identity and object structure

- `Kubernetes` — Open-source platform and API ecosystem for orchestrating containerized workloads; a cluster combines control-plane components, nodes, and integrations.
- `Kubernetes API server` — Validates, authorizes, admits, and serves API requests; it is the control-plane front door, not the process that runs application containers.
- `Kubernetes API object` — A typed record with identity, desired specification and observed status, persisted through the API.
- `Kubernetes resource` — The API kind/collection that can be discovered and addressed, such as Pods or Deployments; resource names and kinds are related but not interchangeable.
- `apiVersion` — API group and version used to encode an object's schema, for example `apps/v1`; choose a version served by the target cluster.
- `kind` — The object type, such as `Deployment`; plural REST resource names may differ from kind names.
- `metadata` — Common identity and relationship fields shared across object kinds.
- `metadata.name` — Object name within its scope; most objects are addressed by namespace plus name.
- `metadata.namespace` — Scope for namespaced objects. Cluster-scoped resources have no namespace; namespaces are not, by themselves, hard security boundaries.
- `metadata.labels` — Key/value identifiers intended for efficient selection and organization. Label keys can be constrained by prefixes and syntax.
- `metadata.annotations` — Non-selector metadata often used by tools and controllers; avoid secrets and excessively large payloads.
- `metadata.ownerReferences` — Links a dependent to an owner for controller relationships and garbage collection; owner reference does not mean the dependent is healthy.
- `metadata.finalizers` — Deletion barriers that let a responsible controller perform cleanup before the API removes an object. A broken finalizer can leave an object terminating.
- `spec` — Desired or requested state of an object. Some fields are immutable or are interpreted by a controller rather than directly by the API server.
- `status` — Observed state and conditions maintained by the API server or controllers. It can lag behind a requested change.
- `Kubernetes control plane` — API server, controller managers, scheduler, and related services that manage the cluster; managed distributions may hide their implementation.
- `Kubernetes controller` — A reconciliation process that watches inputs, compares actual with desired state and makes incremental API or external changes.
- `Reconciliation loop` — Repeated observation and corrective action. It is asynchronous and should be safe to retry after partial progress.
- `Desired state` — State requested in object specifications or configuration.
- `Actual state` — What controllers and nodes currently observe; it may diverge due to failures, capacity, policy, or external dependencies.
- `Kubernetes watch` — Streaming API mechanism that reports object changes after a resource version. Clients must handle reconnects, expired versions and relisting.
- `Kubernetes resource version` — Opaque token for concurrency and watch continuity. Do not parse it as a timestamp or compare it numerically.
- `Kubernetes field selector` — Server-side filter for a limited set of fields supported by a resource; it is not a general query language.
- `Kubernetes label selector` — Filter over labels. Use equality requirements or set/existence expressions; a selector only matches what its requirements describe.
- `Equality-based selector` — Requirements such as `app=api` and `tier!=frontend`; multiple requirements are ANDed.
- `Set-based selector` — Requirements such as `env in (prod,stage)`, `tier notin (cache)`, `exists`, or `doesNotExist`; multiple requirements are also ANDed.

### kubectl and declarative object management

- `kubectl` — Kubernetes CLI that sends API requests using the active kubeconfig context, identity and namespace. Check context before mutation.
- `kubectl get` — Lists objects and selected fields; `-o yaml/json/wide` changes presentation, not stored state.
- `kubectl describe` — Shows selected object details and recent events, which are often useful for current troubleshooting but are not a durable audit log.
- `kubectl explain` — Reads schema documentation exposed for the selected API type/version; it may not include every behavioral constraint of a controller.
- `kubectl apply` — Applies declarative configuration to API objects. Repeating the same desired configuration should converge, but external side effects may not be idempotent.
- `kubectl apply --server-side` — Asks the API server to merge field ownership using server-side apply; it records field managers and can report conflicts.
- `Server-side apply` — Declarative field management. Separate managers can own different fields; conflicts should be understood, and force ownership can take fields away from another manager.
- `Field manager` — Name identifying a manager's field ownership in managed fields. Use stable manager names for repeatable automation.
- `Managed fields` — API metadata tracking which manager owns which fields and operation; it supports merge/conflict logic but may be verbose.
- `kubectl diff` — Displays differences between configuration and live state when supported. It is a preview, not an atomic dry-run of the entire deployment graph.
- `kubectl delete` — Requests deletion. Finalizers and graceful deletion can delay completion; deleting an owner can garbage-collect dependents according to ownership policy.
- `Kubernetes manifest` — YAML or JSON representation of API objects. Validate schema, selectors, security and operational behavior, not just syntax.
- `KYAML` — A safer, less ambiguous YAML subset designed for Kubernetes. It remains valid YAML, so it is an optional representation, not a replacement Kubernetes API format.
- `kubectl get -o kyaml` — Prints supported objects using KYAML output. Use it as a readability aid; clients and APIs still operate on Kubernetes objects.

### Packaging, namespaces, and policy

- `Kustomize` — Declarative customization of Kubernetes manifests using bases and overlays; it renders objects without introducing a required runtime controller.
- `Kustomization` — Kustomize configuration listing resources and transformations for a rendered result.
- `Kustomize base` — Reusable common resource set, intended to be customized by overlays.
- `Kustomize overlay` — Environment or variant layer that composes a base with controlled patches and additions.
- `Helm` — Kubernetes package manager and template/release workflow; chart values and rendered output should be reviewed as code.
- `Helm chart` — Versioned package containing templates, defaults and metadata for Kubernetes resources.
- `Helm release` — An installed instance of a chart with a name and revision history; Helm release state does not prove deployed resources are healthy.
- `Helm values` — Configuration inputs to chart templates. Values can be renamed or interpreted differently across chart versions.
- `Helm template` — Template rendered into Kubernetes manifests. Inspect output to catch generated names, selectors, RBAC and defaults.
- `CustomResourceDefinition (CRD)` — Cluster-scoped API schema that registers a custom resource type; usually paired with a controller for behavior.
- `Custom resource (CR)` — Instance of a CRD-defined type. Storing a CR does not create behavior unless a controller acts on it.
- `Admission controller` — API-server stage that can validate or mutate requests after authentication/authorization and schema decoding.
- `Mutating admission webhook` — External admission service that can change an object before persistence. Make mutation deterministic and resilient to reinvocation.
- `Validating admission webhook` — External admission service that accepts or rejects an object without changing it; availability and timeout/failure policy affect writes.
- `ValidatingAdmissionPolicy` — In-process declarative API policy using CEL expressions for validation, avoiding a webhook service for supported policy needs.
- `Kubernetes API deprecation` — Published lifecycle for retiring API versions or behavior. Plan migrations before a version disappears from a cluster.
- `Kubernetes API version` — Version within an API group such as `v1` or `v1beta1`; maturity and served status are API-specific.
- `Kubernetes namespace` — Logical scope used for names, quotas, policy and access. Network isolation and trust boundaries require additional controls.
- `Kubernetes default namespace` — Namespace selected when no namespace is set in the request/context; production automation should use an explicit context or namespace.
- `ResourceQuota` — Namespace policy limiting aggregate object counts or resource requests/limits; quota may reject object creation when limits are exceeded.
- `LimitRange` — Namespace policy that can enforce min/max resource values or defaults on individual containers/Pods/PVCs; understand defaults before diagnosing scheduling.

## Cross-item comparison

| Choice | Best fit | Operational caution |
|---|---|---|
| `kubectl apply` | Small declarative changes and local learning | A CLI command alone does not provide review, audit or ownership conventions |
| Server-side apply | Multiple declarative managers with explicit field ownership | Conflicts expose shared ownership; blindly forcing ownership can overwrite intent |
| Kustomize | Compose and patch plain manifests | Excessive patch layers can obscure final state; inspect rendered output |
| Helm | Versioned packages with configurable templates and release history | Chart upgrades can change names/defaults/API fields; inspect rendered diff |
| CRD + controller | Domain-specific API with ongoing reconciliation | Schema registration without an available controller only stores data |

## Examples

Inspect the target before changing anything:

```sh
kubectl config get-contexts
kubectl config current-context
kubectl get deployment -n production api -o yaml
kubectl explain deployment.spec.strategy
kubectl diff -f deployment.yaml
kubectl apply --server-side --field-manager=academy -f deployment.yaml
kubectl rollout status deployment/api -n production
```

A selector relationship should be checked in both objects:

```yaml
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: api
  template:
    metadata:
      labels:
        app.kubernetes.io/name: api
```

If changing labels, verify controller immutable selectors and Service selection before applying. A manifest that is syntactically valid can still produce zero endpoints.

## Common mistakes

- Treating API acceptance as proof that controllers, nodes and application are healthy.
- Running a command in the wrong kubeconfig context or namespace.
- Assuming resource version is a clock or field selectors can query arbitrary nested properties.
- Editing a live object manually while a GitOps controller immediately restores its declared configuration.
- Using `--force-conflicts` without identifying the current field manager.
- Assuming labels are descriptive only; selectors determine controller ownership and traffic membership.
- Assuming a CRD itself runs the custom behavior.
- Putting secrets in annotations, labels, shell history or rendered chart output.
- Treating `kubectl diff` as a transaction across multiple resources.
- Upgrading a chart without reviewing the rendered objects and the chart's compatibility notes.

## Knowledge checks with answers

1. `What does a successful apply prove?` The API accepted the requested change. Reconciliation and runtime health need separate observation.
2. `Why are resource versions opaque?` They support API concurrency and watch continuity; clients must not assign timestamp or numeric-order semantics to them.
3. `How do Kustomize and Helm differ?` Kustomize transforms/composes manifests; Helm renders a chart package with values and tracks installed releases. Both ultimately produce API objects.
4. `What happens if a CRD has no controller?` The API can store and validate custom resources, but no custom reconciliation behavior occurs.
5. `Why can server-side apply conflict?` Another field manager owns a field changed by this apply. Resolve desired ownership before taking the field.
6. `Are namespaces a security boundary?` They provide useful scoping for names and policy, but require RBAC, network policy, admission and cluster configuration for stronger isolation.
