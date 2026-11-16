# Kubernetes workloads configuration scheduling and networking — Reference: Config, secrets, volumes, CPU and memory allocation

Sources: [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/), [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/), [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), [Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/), [Resource management for Pods and containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/), [Volume Attributes Classes](https://kubernetes.io/docs/concepts/storage/volume-attributes-classes/), [Volume Snapshots](https://kubernetes.io/docs/concepts/storage/volume-snapshots/), [Volumes](https://kubernetes.io/docs/concepts/storage/volumes/), [Kubernetes v1.36 release highlights](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/), and [Volume group snapshots in v1.36](https://kubernetes.io/blog/2026/05/08/kubernetes-v1-36-volume-group-snapshot-ga/).

## Scope and version

This lesson distinguishes configuration delivery, ephemeral and persistent storage, resource accounting, and runtime enforcement. Kubernetes APIs provide contracts; CSI drivers, cloud storage, kubelet, runtime and admission settings determine effective behavior. Check API maturity and driver capabilities on the cluster version. In-place CPU/memory Pod resize has been Stable since Kubernetes v1.35.

## How this group fits the mental model

Configuration is input to a process; storage is data attached to a Pod or claim; resource requests/limits influence scheduling and runtime behavior. These lifecycles differ. A Pod can be replaced without losing PVC data, while an `emptyDir` is tied to the Pod. A Secret can be mounted but is not automatically encrypted at rest. A resource request can affect placement without representing a hard runtime cap.

## Supplied names explained

### ConfigMaps and Secrets

- `ConfigMap` — Namespaced object holding non-confidential configuration for Pods. Avoid using it as a large binary store or secret vault.
- `ConfigMap key-value data` — UTF-8 string entries under `data`, addressable as environment values or files.
- `ConfigMap binaryData` — Base64-encoded binary entries; it remains subject to object size and API storage constraints.
- `ConfigMap volume projection` — Presents keys as files. Updates propagate eventually through projected-volume mechanisms, but application reload is still your responsibility.
- `Secret` — API object intended for sensitive values. Access is governed by RBAC and storage encryption configuration; its type does not encrypt bytes by itself.
- `Kubernetes Secret type` — Type tag and optional required keys that communicate intended use. It is not a guarantee of validation by every consumer.
- `Opaque Secret` — Generic key/value Secret type, suitable only when no more specific built-in type applies.
- `kubernetes.io/tls Secret` — Conventional `tls.crt`/`tls.key` data shape for TLS consumers; certificate validity and rotation remain separate concerns.
- `kubernetes.io/dockerconfigjson Secret` — Registry credential format used for private image pulls; treat it as a credential and restrict exposure.
- `Secret volume projection` — Mounts Secret keys as files. Kubelet updates projected files eventually when supported, except special mount patterns such as `subPath`.
- `Secret environment variable` — Copies a Secret key into a process environment at container start. It does not refresh within the process and may leak through diagnostics.
- `Secret encryption at rest` — API storage encryption configured for the cluster's datastore. Verify provider/key rotation/backup and which resources are covered; Secret object type alone is insufficient.

### Persistent storage and volume behavior

- `PersistentVolume (PV)` — Cluster storage resource representing provisioned capacity and reclaim/access behavior. It can be statically created or dynamically provisioned.
- `PersistentVolumeClaim (PVC)` — Namespaced request for storage attributes/capacity. The workload mounts a claim; binding depends on class, capacity, access mode and topology.
- `PersistentVolumeClaim access mode` — Declared access capability such as single-node read/write or multi-node access. It is not a file-locking or application-consistency protocol.
- `ReadWriteOnce access mode` — Volume may be mounted read/write by one node; multiple Pods on that same node can use it, subject to driver semantics.
- `ReadOnlyMany access mode` — Volume may be mounted read-only by multiple nodes if the driver supports it.
- `ReadWriteMany access mode` — Volume may be mounted read/write by multiple nodes if the storage system/driver supports it; concurrent-write correctness remains application-specific.
- `ReadWriteOncePod access mode` — Restricts read/write mounting to one Pod across the cluster; requires supporting CSI infrastructure.
- `PersistentVolume reclaim policy` — Defines what happens to underlying storage after claim release: retain or delete in current common use.
- `Retain reclaim policy` — Keeps the PV/storage for deliberate recovery or manual cleanup after PVC release; data can remain sensitive.
- `Delete reclaim policy` — Deletes the PV and usually its backing storage after claim release, depending on provisioner behavior.
- `Recycle reclaim policy (deprecated)` — Legacy basic scrubbing/claim reuse policy, deprecated and unsuitable for new designs; use explicit storage lifecycle/provisioning.
- `StorageClass` — Names provisioning parameters and policy for dynamic PV creation; provisioner and parameters are driver-specific.
- `Dynamic volume provisioning` — Automatically creates storage when a PVC requests a StorageClass; creation may wait for scheduling/topology.
- `VolumeBindingMode` — Determines when dynamic provisioning/binding occurs: immediately or with consumer scheduling.
- `WaitForFirstConsumer` — Delays binding/provisioning until a Pod is scheduled so storage topology can match node placement.
- `Immediate volume binding` — Binds/provisions before a consuming Pod is scheduled; may produce topology mismatch in zonal storage systems.
- `Volume expansion` — Increases a supported PVC/PV capacity, often with CSI/storage and filesystem expansion steps; shrinking is generally not supported.
- `VolumeSnapshot` — Namespaced request for point-in-time snapshot via the external snapshot API/controller and CSI driver. Application consistency may require quiescing.
- `VolumeSnapshotClass` — Driver-specific snapshot parameters and deletion policy for creating snapshots.
- `VolumeSnapshotContent` — Cluster-scoped representation of actual snapshot data and binding; backup/restore processes need retention and consistency planning.
- `VolumeGroupSnapshot` — Namespaced request for a coordinated snapshot of multiple PVCs through the group snapshot API. Support became Stable in v1.36, but the CSI group-snapshot driver/controller and backend must support it; the result is crash-consistent, not automatically application-consistent.
- `VolumeGroupSnapshotClass` — Cluster-scoped group snapshot parameters and deletion policy for a group snapshot driver.
- `VolumeGroupSnapshotContent` — Cluster-scoped binding to the actual group snapshot data and source volumes, used by the group snapshot controller/driver lifecycle.
- `CSI driver` — Implementation connecting Kubernetes storage APIs to a storage backend.
- `Container Storage Interface (CSI)` — Standard interface for storage provisioning, attach, mount, snapshot and other operations implemented by CSI drivers.
- `VolumeAttributesClass` — Cluster-scoped class of mutable storage attributes, such as performance settings. The API became GA in v1.34; its feature gate was locked in v1.36. Changing a PVC's class asks the CSI driver to modify an existing volume only when the driver supports it.
- `volumeAttributesClassName` — PVC field selecting the desired VolumeAttributesClass. The requested class name can change, while an existing class's parameters are immutable; inspect modification status and driver errors.
- `CSI ModifyVolume API` — CSI operation a driver uses to change supported attributes on an existing volume. Kubernetes cannot change provider storage properties if the driver/backend does not implement this operation.
- `VolumeAttributesClass driverName` — Driver identity that provisions/modifies volumes using the class; it must correspond to the relevant CSI driver.
- `VolumeAttributesClass parameters` — Driver-specific attribute map. Values and defaults are not portable across CSI drivers; do not assume a parameter such as IOPS means the same thing everywhere.
- `emptyDir volume` — Scratch storage created for a Pod and removed with it. It can use node storage or memory (`medium: Memory`) and is not durable across Pod replacement.
- `hostPath volume` — Direct node filesystem path mount. It couples a Pod to node state and is high risk for isolation, portability and scheduling.
- `Projected volume` — Combines multiple sources such as ConfigMap, Secret, Downward API and ServiceAccount token into one directory.
- `OCI image volume source` — Stable since v1.36, lets kubelet pull and mount an OCI image/artifact as read-only volume data. It is useful for large static assets/models, but registry access, credentials, digest immutability and node/runtime support matter.
- `Image volume` — Pod volume type backed by an OCI image reference; content is intended as read-only files, distinct from the writable container layer.
- `Pod spec volumes[].image` — API path for declaring an image volume source in a Pod's volumes list. Use an immutable reference where reproducibility matters and verify the target cluster supports the field.
- `ImageVolumeSource reference` — OCI image reference used as the volume content. A mutable tag can change the data fetched by different nodes or at later starts.
- `ImageVolumeSource pullPolicy` — Accepts `Always`, `Never`, or `IfNotPresent` for OCI volume retrieval/caching; it is separate from a container's `imagePullPolicy`. Its default follows the image reference tag rules, so immutable digests make behavior reproducible.
- `SubPath volume mount` — Mounts a selected path within a volume into a container. A file projected through `subPath` does not receive normal projected-volume updates.
- `Persistent volume mount` — Container mount of a PVC-backed volume. Mount path and read/write mode do not establish application-level consistency.

### Resource accounting and resizing

- `Container resource request` — Amount used by scheduling and resource accounting. It is not necessarily the amount continuously consumed or a hard cap.
- `Container resource limit` — Upper bound for supported resources enforced by the runtime/kernel; CPU may be throttled, and memory may cause OOM termination.
- `CPU request` — Scheduling/accounting reservation for CPU in millicores or cores. CPU is compressible and may be shared when actual usage differs.
- `CPU limit` — CPU quota cap enforced over time; tight limits can throttle latency-sensitive work.
- `Memory request` — Scheduling/accounting amount for memory. Memory is not generally compressible; actual use above available capacity can lead to OOM/eviction.
- `Memory limit` — Cgroup/runtime memory ceiling; exceeding it can result in the container being killed as OOMKilled.
- `Extended resource request` — Requests a named scalar resource such as a GPU. A device plugin or supported DRA driver must advertise/allocate it.
- `allocatedResourcesStatus` — Pod status field that reports health information for allocated specialized resources; it advanced to Beta in v1.36 ([release notes](https://kubernetes.io/blog/2026/04/22/kubernetes-v1-36-release/)). It is diagnostic status, not a replacement for application health probes.
- `Container resource QoS class` — Derived Pod quality-of-service classification influencing node-pressure eviction preference, not a service-level guarantee.
- `Guaranteed QoS class` — Typically requires CPU and memory requests equal limits for every relevant container; receives strongest QoS protection in eviction ordering but can still fail.
- `Burstable QoS class` — Pod with at least one request/limit and not meeting Guaranteed criteria; resource use and node pressure still matter.
- `BestEffort QoS class` — No CPU or memory requests/limits; easiest to evict under pressure and often unsuitable for production critical work.
- `OOMKilled` — Container termination reason indicating out-of-memory kill. Compare cgroup limit, actual usage, node memory pressure and container exit/previous logs.
- `Ephemeral storage request` — Scheduling/accounting request for local writable layers, logs and `emptyDir` storage.
- `Ephemeral storage limit` — Threshold for local ephemeral storage consumption; kubelet can evict Pods when usage exceeds limits or node pressure conditions.
- `In-place Pod vertical scaling` — Stable since v1.35; changes a running Pod's container CPU/memory request/limit without replacing its Pod when supported by node/runtime conditions.
- `Pod resize subresource` — `/resize` API subresource for requesting in-place resource changes separately from ordinary Pod update semantics.
- `Container resizePolicy` — Per-container policy indicating whether a resource change can be applied without restarting that container or requires restart.
- `Deferred Pod resize` — A resize request that cannot yet be realized, often for lack of node capacity. Inspect Pod resize status and scheduler/resource behavior; a deferred update is not a successful capacity increase.
- `Vertical Pod Autoscaler (VPA)` — Add-on that recommends or applies resource requests/limits from observed use. It has modes and interactions with restarts and HPA; avoid competing owners of the same values.

## Cross-item comparison

| Choice | Lifecycle | Main tradeoff |
|---|---|---|
| ConfigMap/Secret environment | Captured when container starts | Simple reads; requires process restart/rollout for changes |
| ConfigMap/Secret projected file | Kubelet projection can refresh eventually | Supports file-based reload; app must detect and reload safely |
| `emptyDir` | Pod lifetime | Fast scratch space; lost when Pod is removed |
| PVC + PV | Claim/storage lifecycle | Durable beyond Pod replacement; depends on provisioner, topology, access and backup |
| CPU request vs limit | Scheduling/accounting vs runtime cap | Set requests for realistic placement; limits can constrain burst performance |
| In-place resize vs template update | Modify existing Pod vs replace Pods through controller | Resize avoids replacement but can defer/restart container; rollout is coordinated and consumes surge capacity |

## Examples

For an API that stores only cache, use `emptyDir` if losing cache on Pod replacement is acceptable; do not use `hostPath` merely to make data “persist.” For user records, use a supported database/service or a PVC-backed database with tested backup and recovery. Choose a StorageClass and access mode based on the driver and topology; verify restore, not only snapshot creation. For the API Pod, begin with measured CPU/memory requests, monitor throttling/OOM/evictions, then adjust. A `kubectl set resources`/resize action affects a live Pod only through supported resize behavior; changing a controller template follows rollout logic.

## Common mistakes

- Treating Secret object data as encrypted or safe to expose to broad RBAC.
- Assuming ConfigMap/Secret environment variables update in a running process.
- Treating projected volume refresh as instantaneous or expecting `subPath` refresh.
- Using `hostPath` as a portable persistent database volume.
- Assuming RWO means only one Pod can mount the volume, regardless of node.
- Assuming RWX means safe concurrent writes or database consistency.
- Believing snapshots are automatically application-consistent or a complete backup strategy.
- Setting requests far below ordinary use and causing overpacked nodes, or limits below real peaks.
- Treating QoS class as a guarantee that a Pod cannot be evicted.
- Expecting VPA, HPA and manually managed manifests to safely change the same control field at once.
- Treating a deferred resize as applied capacity.

## Knowledge checks with answers

1. `Will a ConfigMap change update an environment variable in a running process?` No. Roll/restart the process or consume a mounted file with an explicit reload mechanism.
2. `Does ReadWriteOnce mean one Pod?` It means read/write mount by one node; multiple Pods on that node may mount it, depending on driver details.
3. `Does a PVC guarantee data survives?` It provides a storage claim and binding contract; provisioner lifecycle, reclaim policy, backend reliability and tested backup/restore still matter.
4. `What is the practical difference between CPU and memory limits?` CPU can be throttled; memory over-limit commonly causes OOM termination because memory cannot be time-shared like CPU.
5. `What does in-place resize avoid?` Replacing the Pod for eligible resource changes; the request can still require a container restart or be deferred for capacity.
6. `What should be checked after creating a VolumeSnapshot?` Snapshot readiness/driver support, consistency requirements, retention and a real restore test.
