# Kubernetes workloads configuration scheduling and networking — Exercises and worked solutions

Sources: [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), [Services](https://kubernetes.io/docs/concepts/services-networking/service/), [Probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/), [HPA](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/), [Pod disruptions](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/), and [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/).

## Goals

Practice translating an application requirement into workload objects, diagnosing each asynchronous boundary, and making a rollout safer. These exercises use built-in Kubernetes objects from the topic inventory. The manifests are illustrative, but syntactically valid for the stated API versions; replace the example image with an image and registry your cluster can access.

## Worked example

### Scenario

Run a stateless HTTP API in namespace `academy`. It should have three replicas, request 100 millicores and 128 MiB per Pod, listen on TCP 8080, and receive traffic only after the application is ready. A Service should provide stable in-cluster access. CPU autoscaling should keep average utilization near 65%, between three and twelve replicas. Planned maintenance should retain at least two available instances.

### Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalog-api
  namespace: academy
spec:
  replicas: 3
  selector:
    matchLabels:
      app.kubernetes.io/name: catalog-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app.kubernetes.io/name: catalog-api
    spec:
      containers:
        - name: api
          image: ghcr.io/example/catalog-api:1.0.0
          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
          startupProbe:
            httpGet:
              path: /startup
              port: http
            periodSeconds: 5
            failureThreshold: 24
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            periodSeconds: 5
            timeoutSeconds: 2
          livenessProbe:
            httpGet:
              path: /live
              port: http
            periodSeconds: 10
            timeoutSeconds: 2
            failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: catalog-api
  namespace: academy
spec:
  selector:
    app.kubernetes.io/name: catalog-api
  ports:
    - name: http
      port: 80
      targetPort: http
      protocol: TCP
  type: ClusterIP
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: catalog-api
  namespace: academy
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app.kubernetes.io/name: catalog-api
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: catalog-api
  namespace: academy
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: catalog-api
  minReplicas: 3
  maxReplicas: 12
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 65
```

The Deployment selector exactly matches its Pod template labels and the Service selector. The Service port 80 maps to the named Pod port `http` at 8080. Readiness—not liveness—controls whether an instance receives traffic. The HPA requires a functioning resource metrics pipeline and CPU requests. The PDB protects supported voluntary evictions, not involuntary node failure. `maxUnavailable: 0` means the rollout needs a surge Pod to become Ready before removing an old one; ensure quota and capacity permit that extra Pod.

### Observe each boundary

```sh
kubectl create namespace academy
kubectl apply -f catalog-api.yaml
kubectl rollout status deployment/catalog-api -n academy
kubectl get deployment,replicaset,pod,service -n academy -o wide
kubectl get endpointslices -n academy -l kubernetes.io/service-name=catalog-api
kubectl describe pod -n academy -l app.kubernetes.io/name=catalog-api
kubectl top pods -n academy
```

If `kubectl top` fails, check whether the Metrics API is installed before changing the HPA. The HPA may show unknown metrics until usage is available. Do not infer that all layers work from the Deployment becoming Available; make an in-cluster request to the Service and check application-level signals.

## Exercises

### Exercise 1 — Deployment applied, but zero endpoints

The Deployment shows three Pods, all in `Running` phase. The Service exists but its EndpointSlices have no ready addresses. Identify the most likely checks in order and state one concrete fix for each of two possible causes.

### Exercise 2 — Rollout stalls

You change the image to a new release. One new Pod is created but never becomes Ready, while the old Pods continue serving. Give a safe diagnosis sequence and explain when you would pause, roll back, or fix forward.

### Exercise 3 — Pending after adding node affinity

A workload was schedulable before a required node affinity rule was added. It now has `PodScheduled=False` and an unschedulable event. Explain the difference between required and preferred affinity and list at least four constraints to inspect before changing cluster capacity.

### Exercise 4 — Protect a recurring maintenance Job

A CronJob runs a report every hour. A run sometimes takes 75 minutes, and running two copies concurrently corrupts its output. Choose a concurrency policy and explain missed schedules, retries, idempotency and how much Job history to retain.

### Exercise 5 — Write a least-privilege network intent

An API Pod should accept TCP 8080 only from Pods labeled `role=frontend` in namespace `academy`, and it needs DNS plus TCP 5432 egress to a database. Describe the namespace labels/selectors and NetworkPolicy directions/rules you need. State the cluster prerequisite and a negative test.

### Exercise 6 — Diagnose scale-to-zero failure

An HPA has minimum zero and the worker has zero Pods, but the queue grows without triggering scale-up. Give a checklist that distinguishes HPA configuration, metric visibility, API maturity, and application cold-start/request buffering.

### Exercise 7 — Choose durable state and identity

A service stores customer records in a local file and expects the same Pod name/IP after a node failure. Recommend an application architecture and Kubernetes workload/storage/discovery boundaries. Explain which guarantees Kubernetes cannot supply by itself.

### Exercise 8 — Change storage performance and recover a multi-volume app

A database has two PVCs, one for data and one for its write-ahead log. The CSI driver supports mutable performance settings and group snapshots. Operations wants to raise IOPS without rebuilding the database and take a coordinated recovery point. Which storage APIs and checks are involved? What does a group snapshot guarantee, and what must still be tested?

## Progressive hints

1. Compare exact label key/value pairs, then Pod readiness, then target port and process listener.
2. Look at Events and current/previous container logs. A bad readiness result protects traffic; a bad liveness result can restart the app.
3. Required rules filter nodes; preferred rules influence score. Inspect labels, taints/tolerations, requests/allocatable, quota, PVC topology, topology spread and node conditions.
4. `Forbid` prevents overlap but does not queue every missed tick. Job retries make idempotency important.
5. NetworkPolicy is namespaced and additive. A CNI plugin must enforce it; allow DNS explicitly under default-deny egress.
6. Object/external metric must remain available at zero replicas; verify HPA events/status, API adapter, minReplicas, supported version and scale target.
7. Pod identity is replaceable. Durable records need a storage/database reliability model, backup and recovery, not just a stable Pod name.
8. Separate PVC provisioning class from mutable volume attributes. Check CSI `ModifyVolume`, driver parameters, claim status and group snapshot support/retention.

## Complete solutions

### Solution 1

Inspect Service `spec.selector` and Pod labels exactly, including punctuation/case. If they differ, align them without breaking the Deployment's immutable selector. If the labels match, inspect Pod Ready conditions and readiness-probe failures; fix the probe path/port or application readiness behavior. Then confirm `targetPort` points to the listener and inspect EndpointSlices. A running container that listens only on `127.0.0.1` cannot serve through the Pod IP, even if the port number is correct.

### Solution 2

Run `kubectl rollout status`, `kubectl describe deployment`, inspect ReplicaSets/Pods and Events, then read current and `--previous` logs. Check image pull, scheduling, quota/capacity, configuration mounts, startup/readiness/liveness probes and application errors. If the release is unsafe and a known-good revision exists, pause further change if useful and roll back while verifying service behavior; a rollback will not undo database migrations or external side effects. Fix forward when the failure is understood, data compatibility is preserved and a small correction is safer than restoring the old revision. Do not lower readiness standards simply to make the rollout green.

### Solution 3

Required affinity makes nonmatching nodes ineligible; preferred affinity only adds a score preference. Check: (1) whether nodes carry the required label, (2) taints and matching tolerations, (3) CPU/memory/extended-resource requests versus allocatable capacity, (4) ResourceQuota/LimitRange admission, (5) PVC and StorageClass topology/binding, (6) hard pod anti-affinity/topology spread, (7) node readiness and scheduler events. Add capacity only if constraints are correct and the intended nodes truly lack resources.

### Solution 4

Use `concurrencyPolicy: Forbid` when overlap is unacceptable. A scheduled tick during the active run is skipped rather than durably queued; use a separate queue if every interval must be processed. Set `startingDeadlineSeconds` according to acceptable lateness, retry/deadline fields according to recovery needs, and make output idempotent using a unique period key because a failed Pod may have already written output. Retain enough successful and failed Jobs to audit and diagnose, with external log/result retention if cleanup is needed.

### Solution 5

Use an ingress policy selecting the API Pods, with a `namespaceSelector` for the `academy` namespace and a `podSelector` for `role=frontend`, allowing TCP 8080. Use egress rules for DNS to the cluster DNS endpoints (commonly UDP/TCP 53) and TCP 5432 to a narrowly selected database Pod/namespace or approved CIDR. Set `policyTypes` to `Ingress` and `Egress` when both directions should be isolated. Confirm the CNI enforces NetworkPolicy; test that frontend-to-API/database paths work and an unselected source cannot reach API port 8080. Account for the cluster's DNS implementation/IPs and database service routing when choosing peers.

### Solution 6

Inspect HPA status, Events, target reference, `minReplicas`, metric type and behavior; confirm the cluster supports the v1.37 Beta scale-to-zero capability or relevant feature configuration. Verify the object/external metric API adapter returns a fresh value while no worker Pods exist; a per-Pod metric may disappear at zero. Confirm API authentication/network access to the metric source and that desired metric value is above the scale-up threshold. Finally check whether scale-up creates Pods that can schedule and become Ready. If demand arrives through HTTP, provide a queue/buffer or another front door because a Service with zero backends does not hold requests. Expect cold-start latency.

### Solution 7

Move customer records to a database or persistent storage design with a documented consistency, replication, backup and restore strategy. Use Deployment for interchangeable stateless API replicas, or StatefulSet only if each database member truly requires stable identity/storage association. Put data behind an appropriate PVC/StorageClass/CSI implementation when self-managing a stateful service; use a Service for stable discovery. Kubernetes does not guarantee exactly-once writes, database consistency, successful backups, cross-zone recovery, or permanent Pod names/IPs. Verify restore and failover behavior in the selected storage/database system.

### Solution 8

Use a `VolumeAttributesClass` whose `driverName` matches the CSI driver and whose parameters request the new performance settings. Update each PVC's `volumeAttributesClassName` and inspect modification status/events; support and values are driver/backend-specific, and this does not rebuild the database. Use the v1 `VolumeGroupSnapshot` API with a compatible `VolumeGroupSnapshotClass` to snapshot both PVCs as one crash-consistent group. Confirm both claims are captured, retention/deletion behavior is correct, then restore into test claims and run database recovery checks. Crash consistency is not the same as an application-quiesced transaction checkpoint.

## Tests and edge cases

- Deliberately change one Service selector label and predict the EndpointSlice result before correcting it.
- Break the readiness path while leaving liveness healthy: the Pod should remain Running but not Ready.
- Break the liveness endpoint after startup: observe restart count, prior logs and the failure threshold.
- Attempt a rollout with no spare quota/capacity while `maxUnavailable: 0`; explain why it cannot progress.
- Run two CronJob periods across a long execution and confirm `Forbid` skips overlap rather than queueing it.
- Apply a NetworkPolicy on a cluster without policy enforcement and compare actual behavior; document why API acceptance is not enforcement evidence.
- Test HPA metric visibility when the target has zero replicas and when the metric backend is unavailable.
- Change a PVC's `volumeAttributesClassName`, observe driver status, and restore a `VolumeGroupSnapshot` into test claims to prove recovery.
- Terminate a Pod during a write and verify application idempotency/recovery rather than assuming the controller preserves an in-flight transaction.

## Reflection questions

1. Which observed signal would you trust to confirm that a user request can succeed, beyond Deployment availability?
2. Which fields in your production manifests are owned by Git, Helm, an autoscaler or an operator? How will field ownership conflicts be handled?
3. What is the slowest boundary in your scale-up path: metric sampling, HPA reconciliation, node provisioning, image pull, startup or readiness?
4. Which failure should make the app unready, and which failure is actually recoverable by restarting the process?
5. How will you prove data recovery from a deleted Pod, lost node, or failed storage zone?
