# end-to-end system design case studies — Reference: Hitless configuration reload

Sources: [HLD Handbook](https://hld.handbook.academy/), [NGINX graceful reload](https://nginx.org/en/docs/beginners_guide.html), [NGINX control and signals](https://nginx.org/en/docs/control.html), [NGINX Control API announcement](https://blog.nginx.org/blog/nginx-control-api-view-in-memory-configuration-and-reload-via-http-requests), [Envoy hot restart](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/operations/hot_restart), [Kubernetes ConfigMap updates](https://kubernetes.io/docs/concepts/configuration/configmap/).

## Scope and version

This case study covers changing service configuration while preserving availability. “Hitless” is an operational goal, not a universal guarantee: a reload may preserve established connections but still change behavior, reject new connections, lose in-flight work, or fail to apply on some replicas. Product-specific details vary by version and operating system. The linked NGINX, Envoy, and Kubernetes documentation was checked on 2026-11-17.

Recent change: NGINX announced the Control API in version 1.31.5 (September 2026) for reading in-memory configuration and triggering reloads over HTTP. Existing signal-based graceful reload remains a separate control path. Keep API availability, security, and exact operations tied to the deployed NGINX version; do not expose an administrative reload endpoint publicly.

## How this group fits the mental model

Configuration controls runtime behavior: listeners, routes, limits, upstreams, certificates, feature policy, and timeouts. Replacing a process to apply every change can interrupt traffic. A reload mechanism attempts to prepare the new configuration and transition live work while the old configuration still serves existing requests.

The safe mental model is **prepare → validate → activate → drain → verify**. Keep a known-good active version while preparing the candidate. Reject invalid or incompatible configuration before activation. Switch to the new version in a controlled way, let old work finish within a bounded drain period, and verify that every replica converged. Rollback must be possible when the new version causes harm. Different systems implement these steps differently; “reload succeeded” must have a defined meaning.

## Supplied names explained

- `Hitless configuration reload` — Applying a new runtime configuration with a transition intended to avoid service interruption. It requires validation, a safe activation method, compatible state and connections, draining, observability, and rollback; it cannot promise that every change is behaviorally invisible.

### Design the update protocol

1. **Version and distribute immutable input.** Store configuration with a version/hash, owner, reason, and rollout identity. Avoid editing a shared file in place while processes may read it; a reader could observe partial content. Publish a complete candidate atomically or through a control plane with explicit versioning.
2. **Validate before rollout.** Parse and type-check, verify referenced files and certificates, check cross-field constraints, and run policy checks. Use the target binary/version to validate when possible; schema-valid configuration can still be semantically invalid for a particular listener or upstream.
3. **Stage a candidate.** Load the candidate into a separate process or inactive configuration object. Initialize required resources and dependencies, perform health checks, and expose readiness only after the candidate can safely serve. Do not make it active before resources are ready.
4. **Activate deliberately.** Switch new work to the new configuration using a supported mechanism: new workers, a versioned immutable object plus atomic pointer swap, or a control-plane update. Define whether existing connections remain bound to old settings or begin using new ones. Never assume all fields can be changed dynamically.
5. **Drain old work.** Stop assigning new requests to the old worker/configuration while allowing existing connections or requests to complete. Set a drain timeout and define what happens at its deadline—close, cancel, or transfer only if the protocol supports it. Long-lived connections, WebSockets, streaming responses, and background tasks need explicit treatment.
6. **Observe fleet convergence.** Track desired versus active version, reload duration, validation and activation errors, old-worker count, connection drain, and service SLOs. A control plane acknowledging a push does not prove every instance applied it.
7. **Rollback or complete.** Roll back by reactivating the last known-good version if it remains compatible with current data and state. Keep schema and protocol changes backward-compatible across the transition. After confidence windows pass, remove old workers/configurations and record the outcome.

## Cross-item comparison

This assigned group contains one named pattern, so no within-group comparison applies. NGINX graceful reload starts workers with new configuration and asks old workers to shut down gracefully; its documentation describes rejecting invalid configuration and continuing with old workers. Envoy hot restart uses overlapping processes and transfers supported listening sockets while the old process drains, with product-specific limitations. Kubernetes ConfigMap volume projection is only a file-distribution mechanism: projected files may update eventually, but an application must watch/reload them, environment-variable consumers need a restart, and `subPath` mounts do not receive updates. These mechanisms solve different layers and do not automatically combine into fleet-wide atomic rollout.

NGINX 1.31.5's Control API provides an HTTP management interface for configuration inspection/reload, while traditional signals remain available. An HTTP API changes how operators invoke control; it does not replace candidate validation, authorization, rollout, or rollback design. Protect the management plane with network restriction, authentication, authorization, audit logging, and a safe binding address.

## Examples

### Update an upstream pool

The controller publishes version 42 with a new upstream endpoint. Each instance fetches the complete version, validates DNS/TLS settings and health checks, then activates it. New requests use version 42; existing requests can finish on version 41 until the drain deadline. If health checks fail, the instance remains on version 41 and reports a failed acknowledgement. The fleet controller pauses promotion when too many instances fail or latency/error guardrails regress.

### Certificate rotation

Install the new certificate and key as an immutable secret version, validate that the pair matches and the chain is usable, then reload listeners. Test new handshakes, SNI names, expiry, and clients with existing keep-alive or TLS sessions. Retain the previous certificate through the rollback window. Avoid removing the old key while any worker or delayed replica may still reference it.

### Partial fleet rollout

Out of 100 replicas, 96 report the new configuration; four remain old because their control-plane connection is broken. The service is in a mixed-version state, not “reloaded.” Determine whether old and new behavior are compatible, block further incompatible changes, alert on version skew, and either repair those instances or roll back the rest. For a protocol-breaking update, use a coordinated staged migration rather than assuming a single atomic command reaches the fleet.

## Common mistakes

- Assuming reload means every setting is hot-updatable or that no connection can fail.
- Writing a configuration file in place while a process may read it.
- Activating a candidate before opening files, sockets, or other required resources.
- Confusing projected-file update with application reload or fleet convergence.
- Draining forever because long-lived connections have no deadline or migration strategy.
- Killing old workers immediately and dropping in-flight requests.
- Rolling out new configuration that is incompatible with old application code or stored data.
- Treating a control-plane success response as proof that all replicas are on the new version.
- Leaving an administrative reload endpoint unauthenticated or publicly reachable.
- Deleting the previous config, certificate, or secret before rollback is no longer needed.

## Knowledge checks with answers

1. **What does a safe reload sequence do?** It prepares and validates a candidate, activates it deliberately, drains old work, verifies convergence, and retains a rollback path.
2. **Does an updated Kubernetes ConfigMap mean the app uses the new value?** Not necessarily. A volume may update eventually, but the application must watch/reload it; environment variables and `subPath` have additional update limitations.
3. **Why might old and new workers overlap?** The new worker can become ready before the old one stops accepting work, then the old one drains existing connections to reduce interruption.
4. **What is the hard part of rollback?** The new configuration or code may already have changed data or protocol state. Keep transitions backward-compatible or design explicit compensation.
5. **Can “hitless” be guaranteed for every request?** No general guarantee exists. It depends on the implementation, protocol, long-lived work, resource changes, and failure behavior; define and measure the service objective.

## Practice

Design a zero-downtime route and certificate update for a service with HTTP keep-alive, WebSockets, and 100 replicas. Specify candidate validation, activation, drain timeout, mixed-version compatibility, health gates, version reporting, admin-plane security, and rollback. Explain what happens if four instances cannot fetch the candidate and why “reload command returned success” is insufficient evidence.
