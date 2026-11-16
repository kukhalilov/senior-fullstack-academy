# Kubernetes workloads configuration scheduling and networking — Reference: Stable service addresses, endpoints, ingress, and Gateway API

Sources: [Services](https://kubernetes.io/docs/concepts/services-networking/service/), [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/), [Gateway API](https://kubernetes.io/docs/concepts/services-networking/gateway/), [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/), and [Services and networking concepts](https://kubernetes.io/docs/concepts/services-networking/).

## Scope and version

This lesson covers built-in service discovery, traffic APIs and network policy. These are API contracts; a controller, proxy, cloud integration or CNI must implement many behaviors. Ingress remains stable but frozen for new feature development. Gateway API has Standard and Experimental channels and is the recommended direction for new capabilities. Check the actual implementation's supported API versions and conformance before deployment.

## How this group fits the mental model

Pods are replaced, so applications should not use Pod IPs as durable addresses. A Service offers a stable virtual address or DNS identity; its controller publishes backend endpoints, and a data plane routes packets. For ingress traffic, an additional controller configures external listeners and route rules. NetworkPolicy expresses allowed traffic intent but requires enforcement by the cluster network implementation.

## Supplied names explained

### Service types and endpoint discovery

- `Service` — Stable abstraction for a set of endpoints, commonly selected by labels. Service discovery does not start a process or guarantee a healthy backend.
- `Service selector` — Label requirements selecting Pods for a selector-based Service. An empty or incorrect match commonly results in no endpoints.
- `Service port` — Client-facing Service port and protocol; maps to a backend port through `targetPort`.
- `Service targetPort` — Port on the selected endpoint. It can be a number or named container port; the application must actually listen there.
- `Service protocol` — Transport protocol for a port (`TCP`, `UDP`, and supported `SCTP` cases). Client, Service and implementation must agree.
- `Service ClusterIP type` — Default in-cluster virtual IP type. It is reachable only through the cluster network and applicable policy/routes.
- `Headless Service` — Service with `clusterIP: None`; DNS can return endpoint addresses directly, useful with StatefulSet identity.
- `Service NodePort type` — Allocates a port on eligible nodes in addition to the cluster service behavior. Firewall/routing exposure and port-range policy remain operational concerns.
- `Service LoadBalancer type` — Requests an external load balancer from a controller/provider integration. Provisioning, health checks, IP allocation and annotations vary by implementation.
- `ExternalName Service` — DNS alias (`CNAME`) to an external name; it does not proxy packets, create endpoints, or provide TLS/HTTP routing.
- `EndpointSlice` — Scalable API for endpoint addresses, ports, readiness/serving/terminating conditions and topology, partitioned by service.
- `EndpointSlice controller` — Maintains slices for selector-based Services. Manually managed selectorless Services need their endpoints supplied by another trusted process.
- `kube-proxy` — Common node component implementing Service virtual IP forwarding through a supported proxy mode. Some distributions replace it with another data plane.
- `Service virtual IP` — Stable address allocated to a Service and implemented by the cluster data plane; it is not necessarily an address bound to a normal host interface.

### DNS resolution

- `Cluster DNS` — In-cluster DNS service convention for resolving Service names and, depending on configuration, Pod names.
- `CoreDNS` — Common Kubernetes DNS implementation. It is an add-on, and its health/configuration can affect service discovery.
- `Pod DNS policy` — `ClusterFirst`, `Default`, `ClusterFirstWithHostNet`, or `None` behavior governing a Pod's resolver configuration, with host-network interactions to consider.
- `Pod DNS config` — Per-Pod nameservers, searches and options. Excessive search domains can cause delays and DNS query amplification.

### HTTP routing and Gateway API

- `Ingress` — Stable HTTP(S) routing API for host/path rules and TLS. It needs an Ingress controller; the API is frozen for new feature development.
- `IngressClass` — Names the controller/configuration intended to implement an Ingress. Default class behavior should be explicit in multi-controller clusters.
- `Ingress controller` — Implementation that watches Ingress resources and configures a proxy/load balancer. Different controllers support different annotations and semantics.
- `Ingress backend` — Service name and port to receive matching requests; a Service can exist but have no ready endpoints.
- `Ingress path type` — Match mode for a path, with matching behavior defined by Kubernetes for Exact/Prefix and implementation-specific for the third form.
- `Ingress Exact path type` — Matches the URL path exactly, subject to API path normalization rules.
- `Ingress Prefix path type` — Element-wise path prefix matching; `/foo` and `/foobar` do not match as a raw string prefix relationship would imply.
- `Ingress ImplementationSpecific path type` — Leaves matching details to the IngressClass implementation; it reduces portability.
- `Ingress TLS` — Associates TLS hosts and a Secret (commonly a TLS Secret) for termination behavior implemented by the controller; certificate lifecycle remains operational work.
- `Ingress rule` — Host and path routing rule. The default backend is used when no rule matches if configured.
- `Ingress defaultBackend` — Fallback backend for requests that do not match a rule. Controller behavior and health must be verified.
- `Gateway API` — Extensible role-oriented networking API family separating infrastructure provider, cluster operator and application routing concerns.
- `Gateway API Standard channel` — Stable/conformance-focused API channel; fields still need implementation support and correct version.
- `Gateway API Experimental channel` — API channel for features that may change; avoid assuming cross-version or cross-implementation portability.
- `GatewayClass` — Cluster-scoped declaration of a Gateway implementation/controller class.
- `Gateway` — Deployed listener configuration derived from a GatewayClass. Its status communicates acceptance/programming progress.
- `Gateway listener` — Port, protocol, hostname and route-attachment policy on a Gateway. Multiple listeners can have distinct trust boundaries.
- `HTTPRoute` — Host/path/header and related HTTP routing rules to backend references, with filters according to supported API version.
- `GRPCRoute` — gRPC method/service routing API. Protocol compatibility, TLS and implementation support must line up.
- `TLSRoute` — TLS routing API, typically routing based on SNI without terminating application TLS at the route layer; support is channel/version dependent.
- `TCPRoute` — Layer 4 TCP routing API. It does not inspect HTTP semantics.
- `UDPRoute` — Layer 4 UDP routing API; availability and features depend on Gateway implementation/API maturity.
- `ReferenceGrant` — Explicit permission allowing selected cross-namespace object references, preventing implicit cross-namespace trust.
- `BackendTLSPolicy` — Gateway API policy configuring TLS from a Gateway implementation to a backend where supported; validate backend certificate trust and conformance.
- `Gateway API parentRef` — Route reference to a Gateway or other supported parent. Listener route-attachment rules and namespace policy still determine acceptance.
- `Gateway API attachment` — Binding of a route to one or more eligible parent listeners; inspect status conditions rather than assuming a matching name means attachment.
- `Gateway API conformance` — Test suite/certification scope for specified API behavior. Conformance is versioned and does not cover every implementation extension.

### Network policy and cluster networking

- `NetworkPolicy` — Namespaced L3/L4 allow policy selecting Pods and defining ingress/egress rules. It is isolation policy, not an HTTP firewall or encryption feature.
- `NetworkPolicy ingress rule` — Permits inbound flows from selected peers/namespaces/IP blocks and ports for selected Pods.
- `NetworkPolicy egress rule` — Permits outbound flows to selected peers/namespaces/IP blocks and ports for selected Pods; DNS must remain allowed if needed.
- `NetworkPolicy policyTypes` — Indicates ingress and/or egress isolation directions. Defaults depend on rule presence; set explicitly for readability and safety.
- `NetworkPolicy podSelector` — Selects Pods in the policy's namespace; an empty selector selects all Pods in that namespace.
- `NetworkPolicy namespaceSelector` — Selects peer namespaces by labels. Cross-namespace semantics should be explicit and tested.
- `NetworkPolicy ipBlock` — CIDR peer with optional exceptions. Service NAT and provider/network behavior can affect which address the policy sees.
- `NetworkPolicy additive allow semantics` — For an isolated Pod, the union of matching policies grants allowed traffic; adding an allow policy cannot revoke a flow granted elsewhere.
- `CNI plugin` — Container Network Interface integration that configures Pod networking. It may provide additional policy, routing, encryption and observability features.
- `Container Network Interface (CNI)` — Plugin specification and integration point used by runtimes/kubelet for container network setup; CNI is not a single implementation.
- `Pod network model` — Each Pod receives a cluster-reachable IP under the cluster's networking design; containers in the Pod share that Pod network namespace.
- `NetworkPolicy implementation dependency` — Kubernetes API objects do not enforce themselves; confirm the CNI supports policy and test the real path.

## Cross-item comparison

| API | Identity/routing behavior | Needs an implementation? | Typical exposure |
|---|---|---:|---|
| ClusterIP Service | Stable virtual service address over selected endpoints | Data plane | In-cluster |
| NodePort Service | Node address plus allocated port | Data plane and network access | Nodes |
| LoadBalancer Service | Provider/controller-provisioned external endpoint | Provider/controller | External |
| ExternalName Service | DNS alias only | DNS | External name resolution |
| Ingress | HTTP(S) host/path configuration | Ingress controller | Usually external HTTP(S) |
| Gateway API | Listener and protocol-specific routes with role separation | Gateway controller | Depends on GatewayClass/listener |

## Examples

```sh
kubectl get svc api -n production -o yaml
kubectl get pods -n production --show-labels
kubectl get endpointslices -n production -l kubernetes.io/service-name=api -o yaml
kubectl describe svc api -n production
```

Compare selector keys/values exactly, then inspect Pod readiness and target ports. If endpoints exist but requests fail, test DNS, Pod listening address, CNI routes/policies and Service data-plane behavior independently. For Gateway traffic, inspect Gateway/HTTPRoute status and controller events before debugging application paths.

## Common mistakes

- Treating a Pod IP as stable or exposing it directly to clients.
- Confusing Service `port` with `targetPort` or the process's listening address.
- Assuming a LoadBalancer Service has an external IP immediately or uses the same annotations everywhere.
- Expecting ExternalName to proxy, encrypt or perform HTTP host rewriting.
- Assuming `kubectl apply -f ingress.yaml` installs an Ingress controller.
- Treating Gateway API's Experimental resources as portable or universally implemented.
- Expecting NetworkPolicy to work with an unsupported CNI or to provide encryption.
- Omitting DNS in default-deny egress policies.
- Assuming policy is a deny-list; Kubernetes NetworkPolicy allow rules are additive.
- Using broad `ImplementationSpecific` path behavior and expecting portability.
- Forgetting route/listener namespace attachment and cross-namespace reference permissions.

## Knowledge checks with answers

1. `Service exists but has no endpoints. What should you compare?` Service selector against Pod labels, then Pod readiness and endpoint slice controller status.
2. `Does a toleration, Gateway or NetworkPolicy produce traffic by itself?` No. Scheduling/route/policy APIs express intent and need controllers/data-plane implementations.
3. `When use ExternalName?` For DNS aliasing to an external hostname when clients can resolve/use that name; it is not a reverse proxy.
4. `Why choose Gateway API over a new Ingress deployment?` It has role-oriented, extensible APIs and current feature development; verify controller conformance and support.
5. `What happens when two NetworkPolicies select a Pod?` Allowed flows are combined additively for each isolated direction; an additional policy does not revoke a grant.
6. `How do you debug external HTTP routing?` Inspect class/controller, Gateway/listener or Ingress status, route attachment and backend, then Service endpoints, network policy and application behavior.
