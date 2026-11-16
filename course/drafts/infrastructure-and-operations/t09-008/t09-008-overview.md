# Kubernetes workloads configuration scheduling and networking — Big-picture orientation and mental model

Sources: [Kubernetes releases](https://kubernetes.io/releases/), [Objects in Kubernetes](https://kubernetes.io/docs/concepts/overview/working-with-objects/), [Pods](https://kubernetes.io/docs/concepts/workloads/pods/), [Workload management](https://kubernetes.io/docs/concepts/workloads/controllers/), [Services, load balancing, and networking](https://kubernetes.io/docs/concepts/services-networking/), [Gateway API](https://kubernetes.io/docs/concepts/services-networking/gateway/), [Resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/), and the [Kubernetes v1.37 release announcement](https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/).

## Problem and purpose

Kubernetes is a control system for running containerized workloads across a cluster. It gives teams a common API for declaring desired workload state, assigning Pods to nodes, maintaining replicas, exposing stable network identities, and connecting workloads to configuration, storage, and security controls. Kubernetes does not itself build the application, guarantee that every API has an implementation, or make an unsafe workload safe. A cluster also depends on a container runtime, network and storage integrations, and operators who set sound policies and observe failures.

The useful starting question is not “Which YAML field do I use?” It is “What should exist, what is allowed to change, what failure should be repaired, and what evidence proves the application is healthy?” YAML is only one way to submit API objects. The important behavior comes from API validation, admission, controllers, scheduling, kubelet/runtime actions, network and storage plugins, and the application itself.

## Plain-language mental model

Treat a Kubernetes cluster as a continuously reconciled system. A client submits an object to the API server. The API server authenticates and authorizes the request, validates the object, runs applicable admission, and stores accepted state. Controllers observe state and create or update dependent objects. The scheduler assigns eligible Pods to nodes. A kubelet on each selected node asks its container runtime to realize the Pod, while network and storage integrations provide the capabilities the Pod needs. Status flows back through the API so people and controllers can see progress.

```text
manifest / API client
        |
        v
API server -> authentication -> authorization -> admission -> persistent API state
                                                    |
             +--------------------------------------+------------------+
             v                                      v                  v
       controllers                              scheduler       policy/controllers
             |                                      |
             +----------- desired Pod -------------+
                                                    v
                                       kubelet -> CRI runtime -> containers
                                          |          |              |
                                        CNI        CSI        application
                                          +---- status/health/traffic ---+
```

This is a mental model, not a promise that every operation is synchronous or that the arrows are a single transaction. Controllers reconcile independently; status can lag. A stored Pod object can remain Pending because it has no feasible node, be scheduled while image pulling fails, or be Running without being Ready. A successful `kubectl apply` proves that the API accepted a change, not that users can reach a healthy service.

## How the parts fit together

| Concern | Main question | Typical Kubernetes building blocks |
|---|---|---|
| Desired state | What should exist and who owns it? | API objects, labels/selectors, controllers, declarative apply |
| Process lifecycle | How does an instance start, become healthy, and stop? | Pod, containers, init/sidecars, lifecycle hooks, probes |
| Replication and work | How many instances or finite tasks should run? | Deployment, StatefulSet, DaemonSet, Job, CronJob |
| Configuration and data | What can change independently of the image, and what must persist? | ConfigMap, Secret, volumes, PV/PVC, StorageClass |
| Placement and capacity | Which node can run the workload and can it fit? | requests/limits, scheduler, affinity, taints, topology, autoscaling |
| Traffic | How does a client find the current healthy backends? | Service, EndpointSlice, DNS, Ingress or Gateway API |
| Trust and policy | Who can act, and what may a container do? | ServiceAccount, RBAC, admission, Pod Security, security context |
| Extensions | How does a platform encode domain-specific resources? | CRD, custom resource, controller/operator, admission webhook |
| Operations | How can the team diagnose and safely change behavior? | events, logs, metrics, rollout status, debug containers, version policy |

An object usually has identity and metadata, desired fields in `spec`, and observed fields in `status`. A label selector is a relationship, not a live pointer: if labels do not match, controllers or Services do not find the Pods the author intended. Ownership references support garbage collection and controller relationships, but do not replace application-level data recovery.

## Concept map

```text
Namespace / policy boundary
  └── Deployment or another workload controller
       └── ReplicaSet / Job / StatefulSet controller
            └── Pod template -> Pod -> containers and shared Pod network
                 ├── ConfigMap / Secret -> environment or projected files
                 ├── PVC -> PV / StorageClass / CSI implementation
                 ├── requests, limits, affinity, topology, tolerations
                 └── probes + security context + ServiceAccount

Service -> label selector -> EndpointSlice -> ready Pod IPs -> cluster data plane
                                      └── DNS name
Ingress or Gateway/Route -> implementation/controller -> Service backend

API server state -> controllers reconcile -> scheduler assigns -> kubelet realizes
       ^                                                        |
       +---------------------- status and events ---------------+
```

The diagram separates desired-state APIs from implementations. A NetworkPolicy object only has effect if the cluster network implementation enforces it. Gateway API objects need a Gateway controller. A PVC may wait for a provisioner or a schedulable topology. `kubectl top` depends on a working metrics pipeline. Always ask which controller, plugin, version, permission, and configuration make an API effective in the specific cluster.

## End-to-end walkthrough

Consider deploying a stateless HTTP API. Build an immutable image and define a Deployment with a stable selector, a matching Pod template, a realistic replica count, resource requests, a startup probe for slow initialization, a readiness probe for traffic eligibility, and a liveness probe only for a failure the process cannot recover from. Put non-secret configuration in a ConfigMap and credentials in a Secret backed by appropriate encryption and access controls. Grant a dedicated ServiceAccount only the API permissions the process requires.

Submit the manifest through review and declarative apply. The API server validates it. The Deployment controller creates a ReplicaSet and Pods. The scheduler finds nodes with enough allocatable CPU/memory and satisfying constraints. Kubelets pull the image, mount configuration, start containers, and report conditions. The readiness probe succeeds; a Service's selector matches the Pod labels, and EndpointSlices publish usable endpoints. Cluster DNS gives clients a stable name. For external HTTP traffic, a compatible Gateway implementation can attach an HTTPRoute and send traffic to that Service.

During an update, change the image or template. The Deployment creates replacement Pods according to its rollout strategy. Observe `kubectl rollout status`, Events, readiness, endpoint membership, and application-level error/latency metrics. If the new version is unhealthy, halt or roll back deliberately; a successful rollout status is useful evidence but does not replace user-facing health signals. For a recurring batch task, use a Job or CronJob with explicit retries, deadlines, concurrency and idempotency, not a long-running Deployment that loops invisibly.

## When to use it and tradeoffs

Kubernetes is useful when a team needs a programmable orchestration API, repeated workload patterns, automated recovery, scheduling across a pool of machines, and a mature ecosystem of controllers and integrations. Its benefits come with a meaningful operational surface: API and component version skew, identity and policy, networking, persistent storage, upgrades, resource planning, observability, and incident response. A managed control plane reduces some cluster maintenance but does not remove application, workload, access, data, or cost responsibilities.

Kubernetes should not be selected merely because an application uses containers. A single service on one machine may be simpler to run with a managed application platform or container service. The right choice depends on deployment frequency, scale and failure needs, team expertise, portability requirements, and the cost of operating the platform. Kubernetes adds abstractions that pay off when the team uses them consistently and understands their failure behavior.

## Version and implementation notes

As checked against the [official release page](https://kubernetes.io/releases/) on 2026-11-16, Kubernetes v1.37.1 (released 2026-09-15) is the latest listed release. Among recent changes, Pod-level resource budgets became Beta in v1.34 and in-place CPU and memory resize became stable in v1.35 ([resource management documentation](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)); Pod user namespaces became stable in v1.36 ([v1.36 announcement](https://kubernetes.io/blog/2026/04/23/kubernetes-v1-36-userns-ga/)); and in v1.37 the metrics API graduates to `metrics.k8s.io/v1`, HPA scaling to zero for suitable object/external metrics becomes Beta and enabled by default, gang scheduling advances to Beta, and DRA gains stable extensions ([v1.37 release notes](https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/), [HPA change](https://kubernetes.io/blog/2026/09/02/kubernetes-v1-37-hpa-scale-to-zero-beta/), [DRA changes](https://kubernetes.io/blog/2026/09/03/kubernetes-v1-37-dra-updates/)). These statuses describe upstream Kubernetes, not necessarily a vendor cluster’s enabled configuration or add-on compatibility.

Ingress remains a stable API, but Kubernetes has frozen it and directs new feature development to Gateway API. Existing Ingress deployments remain valid when backed by a controller. Gateway API is a separate project with Standard and Experimental channels; a field’s existence in an API version does not mean every implementation supports it. Check conformance and controller support before adoption.

## What later lessons cover

The concepts lesson explains reconciliation, the object model, lifecycle and health, controller choices, traffic, data, resource accounting, placement, access control, and cluster integrations. Seven reference lessons explain every term supplied in the fixed manifest inventory. The practice lesson walks through deploy, expose, debug, and safely update workloads; the interview lesson develops system reasoning and common Kubernetes scenarios. Provider-specific managed cluster provisioning is covered in separate cloud-provider topics, while this topic focuses on Kubernetes workload and application-operations behavior.
