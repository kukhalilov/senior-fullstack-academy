# system design technology landscape and selection — Reference: Object storage

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [Amazon S3 overview and consistency](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html), [S3 object upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html), [S3 multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html), [S3 presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html), [S3 versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/AddingObjectstoVersioningEnabledBuckets.html), [S3 lifecycle configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intro-lifecycle-rules.html).

## Scope and version

This lesson focuses on Amazon S3 as the named object-storage service, then compares the object-storage model to databases and file systems. S3 features, storage classes, limits, and security options vary by region and evolve; consult current AWS documentation before implementing.

## How this group fits the mental model

Object storage persists whole objects addressed by a bucket and key, with metadata and optional versions. It is suited to large files, media, backups, exports, logs, static assets, and data-lake inputs. It is not a POSIX file system and does not provide arbitrary in-place byte updates or a relational query/transaction model. Applications usually store a reference to an object in a database and use object APIs to read/write the bytes.

An object workflow has separate concerns: who may write/read, how upload is transferred, how integrity is checked, whether overwrites are allowed, how versions and deletes work, how long data is retained, and how a download is authorized. Strong read-after-write consistency for S3 object PUT/DELETE means subsequent reads and listings observe successful operations, but it does not create a transaction spanning multiple keys or a database plus S3.

## Supplied names explained

- **Amazon S3** — A regional object-storage service organized into buckets and object keys. Objects have data and metadata; a slash in a key is a naming convention/prefix, not a real directory hierarchy. S3 supports multipart upload for large objects, versioning for retaining object versions, lifecycle rules for transitions/expiration/cleanup, and time-limited presigned URLs that delegate a specific operation to a holder. Features such as Object Lock, replication, access points, storage classes, and encryption modes have separate configuration and constraints.

### Upload and access mechanics

- **Direct server upload:** backend receives file bytes and writes to S3; simple authorization flow, but API servers carry bandwidth and memory/connection load.
- **Presigned upload/download:** backend authorizes and signs a limited operation; client transfers directly to S3. The URL is a bearer credential until expiry and can be reused during its validity. Restrict method, key, headers/checksum, content type/size where supported, expiry, and permissions; do not log or expose it unnecessarily.
- **Multipart upload:** split a large object into independently uploaded parts and complete them into one object. This allows parallel/resumable transfers, but incomplete uploads consume storage until aborted or cleaned by lifecycle configuration. Validate full-object checksum behavior for the selected API and algorithm.
- **Versioning:** overwrites create a new version; deletes commonly create a delete marker rather than erase all prior versions. Lifecycle must cover noncurrent versions and expired markers if permanent cleanup is desired. Versioning is recovery support, not a backup strategy by itself.
- **Lifecycle:** transition or expiration rules can lower storage cost or enforce retention. Check minimum storage duration, retrieval fees, and lifecycle behavior for versioned objects.

## Cross-item comparison

| Storage model | Best for | Important limitation |
|---|---|---|
| Object storage (S3) | Large immutable or versioned blobs, durable archival, static/media assets | Whole-object API model, network access latency, eventual application workflows across multiple objects/services |
| File storage | Shared filesystem paths, directory operations, file locking/semantics | Mount and concurrency behavior; cost/performance differ from object APIs |
| Block storage | Low-level disk volumes attached to compute/database nodes | Capacity and filesystem/database management are the application’s concern |
| Relational database | Structured records, constraints, indexed queries, transactions | Poor fit for large binary payloads and streaming huge files through database storage |

These services can be combined: keep metadata, authorization, and lifecycle state in a relational database; keep large bytes in object storage; use a CDN for public/cacheable delivery.

## Examples

### Large user upload

The application creates a pending upload row with an opaque object key and owner. After checking authorization and quota, it issues a short-lived presigned multipart upload scoped to that key. The browser uploads parts directly and submits completion. The backend verifies the completed object’s expected size/checksum and scans it before marking the row available. A lifecycle rule aborts incomplete uploads. Downloads use an authorization check followed by a short-lived presigned GET or a CDN signed request. The object key is never accepted as proof that the caller owns the file.

### Immutable application release assets

Build artifacts use content-hashed keys and long cache lifetimes. A release manifest in the application database points to the exact asset version. Rollback changes the manifest rather than trying to rewrite an object in place. Lifecycle keeps prior versions for a defined recovery period and removes them after retention expires.

## Security, reliability, and cost checklist

- Block unintended public access; use IAM roles/policies with least privilege, encryption, and audit logging appropriate to data sensitivity.
- Treat presigned URLs as bearer secrets; constrain scope and lifetime and avoid placing them in logs, analytics, or referrer-bearing pages.
- Validate content type and size on the server; do not trust a browser filename or MIME declaration.
- Use checksums and verify uploads; multipart completion order and retries need correct part identifiers.
- Define bucket versioning, lifecycle, replication, backup, legal retention, and deletion semantics together.
- Protect against accidental cross-tenant access by deriving object keys and permissions server-side.
- Include request, storage, retrieval, transition, replication, and egress charges in cost estimates.

## Common mistakes

- Treating S3 keys as real directories or expecting filesystem rename/append semantics.
- Assuming strong consistency means an atomic transaction across keys or services.
- Assuming a presigned URL is one-time-use; it can be reused until it expires, subject to its signed permissions.
- Enabling versioning but forgetting the cost of old versions and delete markers.
- Leaving incomplete multipart uploads indefinitely.
- Making uploads public or trusting a client-provided object key without authorization checks.
- Storing large binary payloads in a relational database when object storage better matches the access pattern, or storing all metadata in object tags where transactional queries are needed.

## Knowledge checks with answers

1. **Does a slash in an S3 key create a directory?** No. It is part of the key; consoles may present prefixes in a folder-like view.
2. **Does strong read-after-write consistency make a multi-object update atomic?** No. It describes visibility of successful object operations, not a transaction across keys or services.
3. **What security property does a presigned URL have?** It is a time-limited bearer capability for the signed operation; anyone who obtains it may use it within its validity and scope.
4. **What cleanup is needed for versioned buckets?** Lifecycle policies may need to expire noncurrent versions and expired delete markers in addition to current objects.
