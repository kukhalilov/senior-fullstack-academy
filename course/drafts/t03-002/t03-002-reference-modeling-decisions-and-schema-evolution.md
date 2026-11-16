# relational modeling constraints data types null and normalization — Reference: Choosing identifiers, optionality, ownership, and evolution strategies

# Scope and version

This is the assigned reference group from the SQL Server 2025 (17.x) snapshot checked 2026-11-16. Every supplied name is explained below. Scope outside this group belongs to the overview or neighboring references.

# How this group fits the mental model

The table below is a design toolkit, not a sequence of independent vocabulary cards. Begin with what fact a row represents, then choose identity and relationships, constrain valid values, and preserve one authoritative copy of each fact. The next references connect these design choices to SQL Server enforcement and exact scalar behavior.

# Supplied names explained

- `Required attribute` — A required attribute is enforced with NOT NULL and, if needed, domain constraints. Application validation alone cannot protect against alternate writers, races, or migration mistakes.

- `Optional attribute` — An optional attribute permits NULL because the fact may be absent or not applicable. Define each meaningful absence state; use separate columns/status when “unknown”, “not yet supplied”, and “not applicable” differ.

- `Value object` — A value object is a domain concept defined by its values rather than independent identity, such as a money amount with currency. In relational storage it may be columns in an owning row or a child relation when lifecycle/query needs justify it.

- `Entity identity` — Entity identity is the rule that distinguishes one entity instance over time. A primary key implements a database identifier, while natural-key uniqueness and lifecycle policy express business identity.

- `Aggregate boundary` — An aggregate boundary groups facts whose invariants should be changed together by one application operation. It informs ownership and transaction design but is not automatically a database transaction or a reason to denormalize.

- `One-to-one foreign-key placement` — Put the FK on the side whose existence depends on or is optional relative to the other; enforce one-to-one with UNIQUE. If both sides are mandatory, SQL constraints alone may not enforce simultaneous existence without additional design.

- `One-to-many foreign-key placement` — Put the FK on the many-side table, referencing the one-side candidate key. Make it NOT NULL when every child must have a parent; index it according to joins/deletes and workload.

- `Many-to-many junction-table design` — Create one row per association, include both FKs and relationship attributes, and enforce pair uniqueness if duplicates have no meaning. Choose cascade behavior and whether associations have their own identity.

- `Composite foreign key` — References multiple columns of a matching unique/primary key and enforces the tuple relationship. Column count, order, type compatibility, and NULL behavior must align on both sides.

- `Natural-key mutability risk` — Domain identifiers can be corrected, reissued, reformatted, or change ownership. If referenced widely, updates are costly and can break integrations; retain a stable surrogate while enforcing current business-key rules separately.

- `Surrogate-key tradeoff` — Surrogate keys make references independent of changing business labels but add a column and do not guarantee meaningful uniqueness. Keep a separate unique constraint on the intended natural identifier.

- `Cascade delete decision` — Use cascading delete only when child records truly have no independent lifecycle and deletion is authorized as a whole aggregate. Audit cascade paths, triggers, volume, retention, and accidental parent deletes.

- `Restrict delete decision` — NO ACTION blocks parent deletion while dependent rows exist. It protects retained history but requires an explicit child/archive/reassignment workflow; SQL Server checking is immediate, not deferred.

- `Check constraint versus application validation` — A CHECK constraint protects the invariant for all writers and concurrent requests; application validation provides clearer user feedback and richer context. Use both for different purposes, while keeping the database rule authoritative.

- `Computed versus stored fact` — A computed value is derived from other attributes; persisting a second manually updated copy creates drift risk. SQL Server computed columns may be persisted/indexed only under determinism and SET-option conditions; otherwise calculate in queries or maintain explicit history.

- `Audit columns` — Created/updated identity and time columns help answer who/when metadata questions but do not form a tamper-proof audit trail. Define actor source, UTC policy, update path, and whether full change history is required.

- `Created-at timestamp` — Store creation time with a clear clock/UTC convention and choose datetime2 or datetimeoffset based on whether only a UTC instant or the original numeric offset matters. A default alone does not prevent later edits.

- `Updated-at timestamp` — Define which changes update the field and whether updates are database- or application-owned. It is not supplied automatically by an ordinary column default on every update.

- `Soft delete versus physical delete` — Soft deletion preserves a row for recovery/history but complicates uniqueness, every query, FK lifecycle, and retention. Physical deletion removes active data; regulated retention/erasure policies may require both purge and evidence handling.

- `Schema migration compatibility` — A compatible migration lets old and new application versions coexist during rollout. Separate additive changes, backfills, constraint validation, cutover, and cleanup so deployment ordering is safe.

- `Expand-and-contract schema change` — First add a backward-compatible representation, deploy code that can work with both, backfill, switch reads/writes, then remove the old shape after all clients have moved. It avoids requiring an all-at-once deployment. [Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/expand-contract)

- `Backfill existing rows` — Populate new columns in controlled batches with resumable progress, idempotency, throttling, and validation. A default does not necessarily rewrite existing rows the way the application expects.

- `Default value during migration` — A default can make inserts from old code continue to work, but a fabricated value may misrepresent historical facts. Backfill intentionally and remove temporary defaults if they encode migration convenience rather than domain truth.

- `Data classification` — Classify fields by sensitivity, purpose, and handling requirements before choosing access, encryption, logging, and retention. Classification is governance metadata, not a SQL type or an access control by itself.

- `Retention policy` — Defines how long facts remain and how they are archived or erased. Align retention with foreign keys, backups, temporal history, legal holds, and soft-delete behavior.

- `Tenant key in relational schema` — Include tenant ownership in keys/relationships when it is part of the invariant, and enforce that child rows cannot point across tenants. Application predicates alone are a weak isolation boundary.

- `Unique constraint scoped by tenant` — Use a composite unique key such as `(TenantId, EmailKey)` when the value must be unique only within one tenant. Normalize/canonicalize the key deliberately and decide how NULL/deleted rows participate.

- `Collation choice for identifiers` — Choose case/accent/width/Unicode comparison according to identifier rules before adding unique constraints. A collation affects both equality and sort semantics; changing it later can reveal duplicates.

- `Deterministic ordering key modeling` — If an application must page or replay rows deterministically, identify a unique tie-breaker and model it explicitly. A timestamp alone can collide; uniqueness and transaction consistency are separate guarantees.

- `Temporal table modeling` — System-versioned temporal tables maintain current and history rows with system period timestamps for database-time history. This is not automatically business-valid time, an audit identity trail, or a substitute for retention/security policy. [Temporal tables](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal-tables?view=sql-server-ver17)

- `IDENTITY property` — The IDENTITY property generates a number when rows are inserted, using seed and increment, but it does not itself enforce uniqueness, prevent gaps, or guarantee consecutive/commit order. Add a key/unique constraint and never treat it as a clock. [IDENTITY](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)

- `SEQUENCE object` — A sequence is a schema-scoped number generator that can be consumed independently of inserting a particular table row. Values can be lost on rollback, caching, or failure, so gaps are expected; use constraints to enforce uniqueness. [CREATE SEQUENCE](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)

- `ON DELETE SET DEFAULT decision` — Choose this only if a real, valid default parent represents the intended reassignment. Every FK column needs a usable default and the resulting tuple must reference an existing parent; otherwise the delete fails or silently misclassifies ownership.

- `ON UPDATE CASCADE versus immutable key` — ON UPDATE CASCADE propagates a changed key but couples every dependent row and has restrictions. A stable immutable surrogate key usually avoids that operational fan-out while a mutable natural key remains separately unique.

# Cross-item comparison

Use a natural key when its domain meaning is stable and uniqueness rules are clear; prefer a surrogate for stable internal references when business identifiers can change, but still protect alternate keys. A primary key is the selected row identity; a UNIQUE constraint protects additional candidate keys. A normalized schema stores facts according to dependencies; deliberate denormalization repeats facts for a measured need and creates synchronization work. A one-to-many foreign key belongs on the many side; a many-to-many relation requires an association table. These comparisons do not make one choice universal: lifecycle, invariants, access patterns, and migration cost decide.

# Examples

Consider a `Course`, a `Student`, and an `Enrollment`. A candidate key may be an institution-assigned `StudentNumber`, while a surrogate `StudentId` gives stable internal references if that number can be corrected. `Enrollment(StudentId, CourseId, AttemptNo, EnrolledAt, Grade)` models the association and its facts. If attempts are not distinct, remove `AttemptNo` and enforce pair uniqueness. Store course catalog name in Course, but store the name as it appeared on a signed historical transcript only if that is a separate historical fact with a defined source.

# Common mistakes

- Adding columns to a key without checking whether they are functionally necessary.
- Assuming a surrogate primary key makes a business identifier unique.
- Duplicating mutable facts without defining which copy is authoritative.
- Treating a many-to-many link as a comma-separated list.
- Cascading deletes through data that has independent retention or audit needs.
- Assuming physical row order or a generated identifier is chronological business time.

# Knowledge checks with answers

1. What is the difference between candidate key and superkey? **A candidate key is minimal; a superkey may contain redundant attributes.**
2. Where do relationship attributes for a many-to-many link belong? **On the junction/associative row that represents that link.**
3. What problem does 2NF address? **A non-key fact depending on only part of a composite candidate key.**
4. Why might a product price remain on an order line even when Product has a current price? **The line may record the historical transaction price, a distinct event fact.**
5. Does normalization guarantee the fastest query? **No. It primarily organizes dependencies and avoids anomalies; performance must be measured and any denormalization made explicit.**

# Sources

- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/alter-table-table-constraint-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/null-and-unknown-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-unique-indexes?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/decimal-and-numeric-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/money-and-smallmoney-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/char-and-varchar-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/nchar-and-nvarchar-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/date-and-time-types?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/datetime2-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/datetimeoffset-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-type-precedence-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/functions/cast-and-convert-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/functions/try-cast-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/collations?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/json-data-type?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/json/json-data-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/vector-data-type?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/functions/vector-functions-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/hierarchical-data-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/data-types/string-and-binary-types?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-table-valued-parameters-database-engine?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-types/create-user-defined-data-types-database-engine?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/spatial/spatial-data-types-overview?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/patterns/expand-contract)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/temporal-tables?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/tables/specify-computed-columns-in-a-table?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description)
