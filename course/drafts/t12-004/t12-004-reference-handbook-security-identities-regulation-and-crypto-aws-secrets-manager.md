# architecture patterns multi-region tenancy and reliability — Reference: AWS Secrets Manager

Sources: [Secrets Manager User Guide](https://docs.aws.amazon.com/secretsmanager/latest/userguide/), [secret versions and staging labels](https://docs.aws.amazon.com/secretsmanager/latest/userguide/whats-in-a-secret.html), [rotation overview](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html), [Lambda rotation functions](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotate-secrets_lambda-functions.html), [rotation strategies](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotation-strategy.html), [replication across Regions](https://docs.aws.amazon.com/secretsmanager/latest/userguide/replicate-secrets.html), [AWS Lambda extension/caching](https://docs.aws.amazon.com/lambda/latest/dg/with-secrets-manager.html), [IAM policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html).

## Scope and version

This lesson describes AWS Secrets Manager as documented on 2026-11-20. Features and prices vary by Region and secret type. Consult the current AWS documentation and target-service integration before designing rotation, replication, caching, or recovery.

## How this group fits the mental model

Secrets Manager stores encrypted secret values and controls access through AWS IAM and resource policies. It can coordinate rotation for supported secret types or invoke a Lambda rotation function for others. It does not make a credential safe merely by storing it: callers still need least privilege, rotation must update the target system as well as the stored secret, and applications must handle cache freshness and credential overlap.

## Supplied names explained

- **Secret:** encrypted value plus metadata, tags, resource policy, KMS key association, and one or more versions.
- **Secret version:** a copy of the secret value. AWS staging labels track important versions: `AWSCURRENT` (always present and returned by default), `AWSPREVIOUS` (last current version after rotation), and `AWSPENDING` (candidate during rotation). These labels move between version IDs; they are not a linear immutable history by themselves.
- **Managed rotation:** AWS-managed rotation for supported managed secrets, without a customer Lambda rotation function.
- **Lambda rotation:** a Lambda function updates the target credential and secret through the rotation protocol. It uses staged steps commonly named `createSecret`, `setSecret`, `testSecret`, and `finishSecret`; design the function to be idempotent because retries and partial failures can occur.
- **Single-user rotation:** changes the password for one database user. There can be a short mismatch window between target system and secret; existing connections may remain open while new connections using the old password fail.
- **Alternating-users rotation:** alternates between two users so one credential remains usable while the other is updated. It requires appropriate database permissions and synchronization of both users’ grants.
- **Replica secret:** a linked copy in another Region. Replication can help regional availability but is not an independent secret lifecycle or an automatic failover plan.
- **Caching:** clients/extensions may cache retrieved values to reduce API calls and latency. Cache duration directly affects how quickly consumers observe a rotated value.

## Rotation lifecycle and failure behavior

For Lambda rotation, Secrets Manager creates or reuses an `AWSPENDING` version, the function updates the destination, tests the candidate credential, and only then moves `AWSCURRENT` to the successful version. The function must ensure the secret and target refer to the same resource and never log sensitive values. Failed rotations can leave `AWSPENDING`; inspect version labels and CloudWatch logs using current AWS troubleshooting guidance rather than deleting labels blindly.

Plan rotation with the application:

1. Give the rotation function permission to update only the target and secret it manages.
2. Ensure network paths and security groups allow the function to reach Secrets Manager and the database/service.
3. Use `AWSCURRENT` explicitly where needed; decide how `AWSPREVIOUS` is used for recovery.
4. Set client cache TTL and connection-pool behavior so consumers can adopt the new credential before old credentials stop working.
5. Alert on failed/incomplete rotation, target-side authentication failures, and secrets approaching policy deadlines.
6. Rehearse recovery: determine whether to retry, roll back target credentials, or manually reconcile the target and version labels.

## Example: .NET API with an RDS credential

The .NET API’s workload role can read one secret ARN and decrypt through the associated KMS key according to IAM/key-policy rules. It fetches the value server-side, keeps it out of logs and browser responses, and uses a bounded cache shorter than the acceptable rotation propagation window. For a high-availability database, alternating users can keep one valid identity while the other rotates, provided grants remain synchronized. If the API caches a credential past rotation, it refreshes on authentication failure with jitter and bounded retry rather than creating a retry storm.

A React frontend must never retrieve database credentials. If a browser needs user-specific access, it calls the .NET API, which performs authorization and uses its own workload credential.

## Regional resilience and security

- A replica remains linked to the primary; writes/rotation are generally performed on the primary secret and propagated. Plan for replication delay, regional KMS key availability, and failover behavior documented for the chosen setup.
- Cross-account access requires appropriate identity and resource policies; KMS key permissions also matter. A secret policy alone may not be enough to decrypt.
- Use a customer-managed KMS key when policy requires control over key policy/audit, and protect that key from deletion or disabling. Secrets Manager’s encryption does not replace application-side encryption needs for particular fields.
- Restrict `GetSecretValue`, `PutSecretValue`, `RotateSecret`, and resource-policy mutation rights separately. A principal that can modify the secret policy can change who reads it.
- Enable CloudTrail and monitor retrieval and rotation events. Avoid recording secret contents in logs, traces, exception messages, or build output.
- Use VPC endpoints where appropriate, but endpoint policies are only one authorization layer.

## Cross-item comparison

- **Secrets Manager vs Parameter Store:** Secrets Manager is purpose-built for secret lifecycle/versioning and managed or Lambda rotation; Parameter Store supports configuration and secure string use cases with different limits/features. Choose based on rotation, lifecycle, integration, throughput, and cost needs.
- **Secrets Manager vs Vault:** AWS-managed service integrates with IAM and supported AWS targets; Vault offers broader engines and portability but may require operating a high-value control plane.
- **Secret rotation vs key rotation:** changing a database password is credential rotation; KMS key-material rotation is a separate cryptographic-key lifecycle. Rotating one does not automatically rotate the other.
- **Cache vs source of truth:** the secret version in Secrets Manager is authoritative for retrieval, but the target database/service must be in sync; a stale client cache can continue using the previous value.

## Common mistakes

- Assuming rotation changes the target credential just because a secret version was created.
- Logging plaintext secret values or returning them to a React/browser client.
- Setting a long cache TTL while expecting immediate rotation visibility.
- Treating `AWSCURRENT`/`AWSPREVIOUS` as a durable audit history or manually moving labels without reconciling the target.
- Assuming a replica secret can be independently rotated or automatically take over without checking regional behavior.
- Granting broad `secretsmanager:*` access to all application roles.
- Forgetting associated KMS key authorization and deletion/disable risks.
- Retrying failed rotation without checking partial target-side changes and idempotency.

## Knowledge checks with answers

1. **What makes a rotation complete?** The target service accepts the candidate credential and Secrets Manager promotes its version to `AWSCURRENT`.
2. **What can happen if application cache TTL exceeds the rotation window?** The app can keep using stale credentials after the target changes; use a suitable TTL/refresh path and connection-pool strategy.
3. **What is the purpose of alternating database users?** One credential can remain usable while the other is rotated, subject to synchronized grants and target support.
4. **Does `AWSPREVIOUS` guarantee rollback will work?** No. The target may already have changed; validate and reconcile both secret and target state.
5. **Should a browser receive a backend database secret?** No. Keep it server-side and expose only authorized application operations.

## Examples

If a Lambda rotation fails after changing the database but before moving the staging label, `AWSCURRENT` may not match the target. The operator inspects the function’s step/logs without exposing values, validates both credentials against the database, then completes a controlled retry or rollback. The API remains within a documented bounded fallback period and does not guess which credential is current.

## Practice exercise

Design secret rotation for a .NET service using an RDS database and a regional disaster-recovery replica. Specify IAM/KMS permissions, rotation strategy, client cache TTL, connection-pool refresh, `AWSCURRENT`/`AWSPREVIOUS` recovery, replication lag assumptions, monitoring, and what happens if the rotation Lambda or database is unavailable.
