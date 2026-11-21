# system design foundations and infrastructure building blocks — Reference: Google Cloud Storage (GCS)

Sources: [Google Cloud Storage documentation](https://cloud.google.com/storage/docs), [Consistency](https://docs.cloud.google.com/storage/docs/consistency), [Object metadata](https://docs.cloud.google.com/storage/docs/metadata), [Request preconditions](https://docs.cloud.google.com/storage/docs/request-preconditions), [Resumable uploads](https://docs.cloud.google.com/storage/docs/resumable-uploads), [Signed URLs](https://docs.cloud.google.com/storage/docs/access-control/signed-urls), [Soft delete](https://docs.cloud.google.com/storage/docs/soft-delete), [Object Versioning](https://docs.cloud.google.com/storage/docs/object-versioning), [Lifecycle Management](https://docs.cloud.google.com/storage/docs/lifecycle), [Object Retention Lock](https://docs.cloud.google.com/storage/docs/object-lock), [Uniform bucket-level access](https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access), [Public access prevention](https://docs.cloud.google.com/storage/docs/public-access-prevention), [Hierarchical namespace](https://docs.cloud.google.com/storage/docs/hns-overview), [HNS folder operations](https://docs.cloud.google.com/storage/docs/rename-hns-folders), [Cloud Storage folder types](https://docs.cloud.google.com/storage/docs/folder-types).

## Scope and version

This lesson explains the core design model and common application patterns for Google Cloud Storage. Product behavior, defaults, supported combinations, and prices can change; verify configuration details against current documentation before deployment. Cloud Storage is object storage, not a POSIX filesystem or transactional database.

## How this group fits the mental model

Suppose users upload photos and later view them. The application stores each byte sequence as an object, keeps searchable business facts such as owner and moderation state in a database, and serves bytes from Cloud Storage or a CDN. This separates large durable blobs from records that need queries and transactions. The application must still decide who may upload or read each object, how retries avoid overwriting newer content, and how accidental deletion is recovered.

An object is addressed by a bucket and object name. Cloud Storage offers two namespace modes. In a **flat-namespace bucket**, `/` is part of an object name; console/CLI tools can display prefixes as simulated folders, but moving or renaming a folder-like prefix requires object operations rather than a directory rename. A bucket created with **hierarchical namespace (HNS)** enabled has real folder resources and supports atomic folder rename/move. HNS must be selected when creating the bucket and cannot later be switched on or off; it also requires uniform bucket-level access and excludes some data-protection and replication features, including Object Versioning, Object Retention Lock, object holds, and cross-bucket replication. Choose the mode from the workload and protection requirements before creation. Managed folders are separate IAM resources and are not the same thing as simulated folders or HNS folder resources.

Objects have data and metadata. A replacement object gets a new `generation`; edits to metadata advance its `metageneration`. These numbers let clients identify which data and metadata they observed.

Cloud Storage documents strong global consistency for object reads after writes, metadata updates, deletion, and object listing. Once a successful write response arrives, a later read or listing can observe that write. This does not create an atomic transaction across multiple objects, make a multi-step application workflow atomic, or guarantee that a cache or external CDN has discarded its copy.

## Supplied names explained

- `Google Cloud Storage (GCS)` — Google Cloud's managed object-storage service. It stores named objects in buckets and exposes APIs and client libraries for reading, writing, listing, and managing them. Choose it for durable blobs, media, backups, exports, and data-lake files; use a database for indexed records and transactions, and a filesystem or block volume when software needs mounted file semantics or random block updates.
- `Flat namespace bucket` — The standard bucket model where `/` is part of an object name; a displayed folder is a prefix view rather than a directory resource.
- `Hierarchical namespace (HNS) bucket` — A bucket created with real folder resources and atomic folder operations; HNS is a creation-time choice with a different supported-feature set.
- `Simulated folders` — Prefix-based folder views over object names in flat-namespace buckets.
- `Atomic folder rename and move` — An HNS operation that renames or moves a folder as one atomic folder-level operation, rather than copying and deleting every object under a prefix.
- `Managed folders` — Separate Cloud Storage resources used to apply IAM permissions to groups of objects; they are distinct from simulated folders and HNS folder resources.

## Cross-item comparison

| Need | Cloud Storage pattern | Boundary or alternative |
| --- | --- | --- |
| Store a new upload | Create an object under a stable key; keep business ownership and workflow state in the application database | A database BLOB may suit small data that must share a database transaction, at the cost of coupling blob traffic and database capacity |
| Prevent a retry or concurrent writer from replacing unexpected data | Use generation preconditions, such as `ifGenerationMatch=0` for create-only behavior or a known generation for conditional replacement | A plain overwrite can silently replace a newer object; application-level locks alone can expire or be bypassed |
| Change object metadata safely | Pair a metadata update with the observed generation and metageneration | Metadata state is per object generation; metageneration alone does not identify which data version was observed |
| Upload over an unreliable network | Use resumable upload and persist enough application state to reconcile completion | The upload session URI is a bearer credential; treat it as secret. A successful object write and the database row describing it are still separate operations |
| Give a browser temporary direct access | Issue a narrowly scoped, short-lived signed URL for a specific operation and object | The URL grants its bearer access until expiry; do not log or expose it as if it were an ordinary public URL |
| Recover from deletion or overwrite | Choose soft delete, object versioning, retention, or a combination based on recovery goals | These mechanisms have distinct restore and permanent-deletion behavior and can add storage cost. Test restoration; a backup is not proven until restored |
| Publish read-heavy content | Serve through a CDN with deliberate cache headers and invalidation/versioned names | Strong consistency at Cloud Storage does not purge a browser or CDN cache that is allowed to serve an older response |
| Choose folder semantics | Use a flat namespace for broad feature compatibility or create an HNS bucket for real folders and atomic folder rename | HNS is a create-time choice, requires uniform bucket-level access, and is incompatible with some versioning, retention, holds, and replication features |

## Examples

### Browser upload without routing file bytes through the API

1. The authenticated application asks the server to create an upload intent. The server checks user, quota, allowed media type/size policy, and destination naming; it does not trust a browser-supplied object path.
2. The server creates a short-lived signed upload URL or initiates a resumable session, then returns only the scoped upload capability. A resumable session URI is sensitive because possession can authorize subsequent upload requests.
3. The browser uploads directly. For large or interruption-prone uploads, resumable transfer allows continuation after network failure; the client should retain and protect session state only as long as needed.
4. The application verifies the completed object's expected key, size, generation, and relevant metadata before marking the upload usable. A database update and object write are separate effects, so retries and reconciliation must handle either side succeeding first.
5. The application serves the object through authorized reads or a CDN. Use versioned object names or explicit cache policy when immediate replacement visibility matters.

### Create-if-absent and compare-and-swap style updates

For a create-only upload, use a generation-match precondition of `0`; the write fails if a live object with that name already exists. For replacing data based on a prior read, send the generation that was read. If another writer changed the object, Cloud Storage rejects the stale update with a precondition failure, and the application can re-read and decide whether to merge, retry, or report a conflict. For metadata-only changes, use the observed generation together with metageneration so a request cannot accidentally modify metadata belonging to another data generation.

Treat a precondition failure as a concurrency signal, not a transient network error to retry unchanged forever. On an uncertain network outcome, first determine whether the intended generation was created before replaying the operation.

### Design the deletion and retention policy

Decide how long users or operators may restore accidentally deleted or replaced content, what must be retained for compliance, and when bytes must become permanently unrecoverable under the organization's rules. Soft delete provides a recovery window for supported configurations; Object Versioning retains noncurrent versions; retention policies and holds can prevent deletion until their conditions are satisfied. Lifecycle rules can transition or delete eligible objects, but they do not override active holds or unmet retention. These features are not interchangeable. Test a restore and permanent-deletion path, and account for retained copies in storage-cost estimates.

## Common mistakes

- Treating object names with slashes as proof that Cloud Storage has filesystem directories or POSIX rename semantics.
- Applying the flat-namespace explanation to every bucket; HNS buckets have real folder resources and atomic folder operations, with their own feature restrictions.
- Assuming strong consistency gives a transaction across object storage and a SQL database, or invalidates downstream caches.
- Retrying an overwrite blindly after a timeout; the first request may have succeeded and a newer writer may have since replaced it. Use generations and inspect current state.
- Treating a signed URL or resumable session URI as harmless text. Anyone who obtains a valid bearer capability may use its granted access.
- Assuming versioning, soft delete, retention, and backups provide the same recovery guarantee. Define the recovery point and recovery time, then perform restore drills.
- Making a bucket public to simplify one upload flow. Prefer narrow IAM and scoped temporary access; apply public-access prevention where public objects are not intended.
- Storing sensitive business state only in custom object metadata. Put queryable, transactional, access-controlled application state in the system designed to own it.
- Ignoring lifecycle, version, soft-delete, and incomplete-upload storage when estimating cost.

## Knowledge checks with answers

1. **A client times out after uploading. Is it safe to retry an unconditional overwrite?** Not automatically. The original request may have completed. Check the object's generation/state and use a create-only or observed-generation precondition so a retry cannot overwrite a concurrent update.
2. **Does strong consistency make a write to Cloud Storage and an insert into PostgreSQL atomic?** No. They are independent systems. Use an explicit workflow such as an upload-intent/outbox state machine, idempotent steps, and reconciliation for partial success.
3. **When is object versioning enough for compliance retention?** It may not be. Versioning keeps noncurrent copies according to its configuration, while retention/holds enforce deletion constraints. Confirm the required immutability and retention semantics against the current product documentation and applicable policy.
4. **Can a signed URL be placed in application logs?** Avoid it. It is a bearer capability and may grant access until expiration; redact it and use short, purpose-specific lifetimes.
5. **What does a generation identify, and what does a metageneration identify?** Generation identifies a particular object data version; metageneration identifies metadata revisions within that generation. Use both where a metadata mutation must target exactly the object version read.

## Practice

Design a photo upload flow for mobile clients on unstable networks. State the bucket/object naming scheme, authorization boundary, create/retry preconditions, database state transitions, content validation, cache strategy, deletion recovery window, retention rules, observability, and how you reconcile a crash after the object upload but before the database commit. Compare a direct database BLOB design and explain what workload or transaction requirement would make you choose it.
