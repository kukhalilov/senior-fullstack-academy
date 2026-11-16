# relational modeling constraints data types null and normalization — Reference: Relations, keys, dependencies, normalization, and modeling anomalies

# Scope and version

This is the assigned reference group from the SQL Server 2025 (17.x) snapshot checked 2026-11-16. Every supplied name is explained below. Scope outside this group belongs to the overview or neighboring references.

# How this group fits the mental model

The table below is a design toolkit, not a sequence of independent vocabulary cards. Begin with what fact a row represents, then choose identity and relationships, constrain valid values, and preserve one authoritative copy of each fact. The next references connect these design choices to SQL Server enforcement and exact scalar behavior.

# Supplied names explained

- `Relation (table)` — A relation is a set of tuples described by attributes; a SQL Server table is the practical storage object, with SQL details such as duplicate rows and physical indexes that are not part of the pure mathematical definition.

- `Tuple (row)` — A tuple is one record containing a value for each attribute, subject to nullability and constraints. A row has no guaranteed order; identity requires a key rather than its current physical position.

- `Attribute (column)` — An attribute describes one kind of fact for rows in a relation. Its type, nullability, collation, and constraints define which values it can represent and how they compare.

- `Entity` — An entity is a distinguishable thing about which the system stores facts, such as a customer or invoice. Decide what makes two real-world instances the same before choosing its key.

- `Relationship` — A relationship expresses an association between entity instances. A foreign key or junction table turns that conceptual association into enforceable relational structure.

- `Entity integrity` — Entity integrity requires each row to be identifiable; a SQL Server PRIMARY KEY enforces uniqueness and non-null values for its key columns.

- `Domain integrity` — Domain integrity restricts a column to values in its intended domain through its type, nullability, defaults, and constraints such as CHECK.

- `Candidate key` — A minimal set of attributes that uniquely identifies every row is a candidate key. “Minimal” means removing any member would lose uniqueness.

- `Superkey` — Any attribute set that uniquely identifies rows is a superkey; it may contain unnecessary columns. A candidate key is a minimal superkey.

- `Primary key` — The candidate key selected as the table’s principal identifier. SQL Server enforces one PRIMARY KEY constraint per table; a composite primary key may contain multiple columns.

- `Alternate key` — A candidate key not chosen as the primary key. If it must stay unique, enforce it with a UNIQUE constraint rather than relying on application checks.

- `Composite key` — A key formed from two or more columns. Uniqueness applies to the entire tuple, not to each component separately; order and nullability affect referencing/index design.

- `Natural key` — A key drawn from domain data, such as an externally assigned code. It can avoid a meaningless identifier but may change, be reused, have privacy implications, or have poor width.

- `Surrogate key` — An identifier introduced for database identity rather than business meaning, often an integer or GUID. It simplifies references but does not replace UNIQUE constraints on real business keys.

- `Foreign key` — A constraint requiring child key values to match a referenced primary or unique key, except that nullable foreign-key values can represent no referenced row. It protects the relationship at write time.

- `Referential integrity` — The invariant that each non-null reference points to a valid parent key, maintained by foreign keys and their configured delete/update actions.

- `Functional dependency` — X functionally determines Y when any two valid rows equal on X must also equal on Y. Dependencies reveal which facts belong to which key and where duplication creates anomalies.

- `Full functional dependency` — A dependency on an entire composite determinant where no proper subset is sufficient. In 2NF, non-key attributes should depend on the whole candidate key, not just part of it.

- `Partial dependency` — A non-key attribute depends on only part of a composite candidate key. It can duplicate a fact across rows and is the specific dependency 2NF removes.

- `Transitive dependency` — A non-key attribute depends on another non-key attribute through the key. In the usual 3NF teaching pattern, splitting that determinant prevents repeated facts and update anomalies.

- `First normal form (1NF)` — A practical 1NF design uses columns with values from declared domains and avoids repeating groups or comma-packed multi-valued fields. It does not itself guarantee good keys or eliminate all anomalies.

- `Second normal form (2NF)` — A relation is in 2NF when it is in 1NF and every non-key attribute depends on the whole of every candidate key, not a proper subset. This is chiefly relevant to composite keys.

- `Third normal form (3NF)` — A relation is in 3NF when it is in 2NF and non-key facts do not depend transitively on candidate keys; formally, each nontrivial FD X→A has X a superkey or A prime.

- `Boyce-Codd normal form (BCNF)` — BCNF requires every nontrivial functional dependency determinant to be a superkey. It is stricter than 3NF and decompositions may trade dependency preservation for stronger redundancy control.

- `Normalization` — Normalization decomposes relations according to dependencies so each fact has an appropriate home. It reduces anomalies but does not automatically produce ideal performance or eliminate every valid redundancy.

- `Denormalization` — Denormalization intentionally stores derived or repeated facts to serve measured access needs. It requires an authority and synchronization rule so updates cannot leave conflicting copies.

- `Update anomaly` — An update anomaly occurs when one fact is duplicated across rows and only some copies change, leaving contradictions. Store that fact once or maintain copies transactionally.

- `Insertion anomaly` — An insertion anomaly means a fact cannot be recorded without inventing an unrelated fact or creating an incomplete row. Separating independent entities usually removes the coupling.

- `Deletion anomaly` — A deletion anomaly occurs when removing one fact unintentionally removes the only stored copy of another fact. Separate entity facts and define dependent-row deletion deliberately.

- `Junction (associative) table` — A junction table represents a many-to-many relationship with one row per pair or association. Put relationship attributes there and enforce the intended pair uniqueness with a key/constraint.

- `Identifying relationship` — A relationship is identifying when the parent key participates in the child’s primary key, so child identity depends on its parent, as with an order line keyed by order plus line number.

- `Non-identifying relationship` — A non-identifying relationship references a parent while the child keeps an independent primary key. The FK establishes association without forming part of child identity.

- `One-to-one relationship` — A one-to-one relationship is implemented by a foreign key made unique on one side; choose the side based on optionality, lifecycle, access, and whether the facts share ownership.

- `One-to-many relationship` — A one-to-many relationship places the parent key as a foreign key in the many-side table. Nullability determines whether a child may be unassociated.

- `Many-to-many relationship` — A many-to-many relationship uses a junction relation with foreign keys to both parents. Add a composite uniqueness rule unless repeated associations are valid domain events.

- `Weak entity` — A weak entity cannot be identified independently in the domain and uses its owner’s key plus a partial key, commonly implemented by an identifying composite primary key and cascading lifecycle policy.

- `Temporal data modeling` — Temporal modeling distinguishes event/effective time from when data is recorded. Choose whether to retain history, correct past facts, or reconstruct state; SQL Server system-versioned temporal tables automate row history but do not replace business-valid-time rules.

- `Soft-delete column modeling` — Soft delete marks a row inactive instead of physically removing it. It affects uniqueness, foreign keys, query filters, retention, and privacy erasure; define how deleted rows participate in each invariant.

- `Prime attribute` — An attribute is prime when it belongs to at least one candidate key. The formal 3NF condition permits a non-superkey determinant for a dependency when the dependent attribute is prime.

- `Nontrivial functional dependency` — An FD X→Y is trivial when Y is a subset of X; otherwise it is nontrivial. Normal-form conditions focus on nontrivial dependencies because trivial ones follow from set inclusion.

- `Lossless decomposition` — A decomposition is lossless when joining its projections reconstructs exactly the original relation for every legal state, without spurious tuples or lost tuples. A split that merely looks normalized is not enough.

- `Dependency preservation` — A decomposition preserves dependencies when the original functional constraints can be checked on the decomposed relations without joining them back together. A design can be lossless yet fail to preserve every dependency locally.

- `Multivalued dependency` — X↠Y states that, for a given X, the set of Y values is independent of the remaining attributes. Independent multi-valued facts stored together create combinatorial duplication.

- `Fourth normal form (4NF)` — A relation is in 4NF when every nontrivial multivalued dependency has a superkey determinant. It separates independent multi-valued facts that ordinary FD-based 3NF/BCNF can miss.

- `Join dependency` — A join dependency says a relation is exactly reconstructible by joining several projections. It generalizes multivalued dependency and motivates the rare, higher-order 5NF decomposition.

- `Fifth normal form (5NF / project-join normal form)` — 5NF requires every nontrivial join dependency to be implied by candidate keys. It is specialized; decompose only when the business constraints justify the join reconstruction, not as a ritual.

- `Surrogate identifier generation with IDENTITY and SEQUENCE` — IDENTITY generates values as rows are inserted into one table; SEQUENCE is a separately defined object that can allocate values to multiple consumers. Both can have gaps and neither guarantees commit order or business chronology. [IDENTITY](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property?view=sql-server-ver17) [SEQUENCE](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-sequence-transact-sql?view=sql-server-ver17)

- `Sixth normal form (6NF)` — A relation is in 6NF when it has no nontrivial join dependencies; equivalently, it cannot be further losslessly decomposed except into trivial projections. It is mainly useful in specialized temporal designs and can greatly increase relation count.

- `Domain-key normal form (DKNF)` — DKNF is an ideal in which every constraint follows solely from domain constraints and key constraints. It is useful as a design goal but is not always achievable without awkward schemas or procedural enforcement.

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
