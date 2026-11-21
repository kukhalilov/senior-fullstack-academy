# end-to-end system design case studies — Reference: PostgreSQL exclusion constraint for reservations

Sources: [PostgreSQL 18: Range Types](https://www.postgresql.org/docs/18/rangetypes.html), [PostgreSQL 18: Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html), [PostgreSQL 18: B-tree and GiST indexes](https://www.postgresql.org/docs/18/indexes-types.html), [PostgreSQL 18: CREATE TABLE](https://www.postgresql.org/docs/18/sql-createtable.html).

## Scope and version

This lesson shows how a PostgreSQL exclusion constraint can enforce a no-overlapping-reservations invariant. Examples use PostgreSQL 18 documentation. Range types, operator classes, and extension availability vary by data type and installed version; verify in the target database. The essential idea applies more broadly: put a critical invariant in the durable system of record when possible.

## How this group fits the mental model

Suppose a room cannot have two active reservations whose time intervals overlap. An application-level “check availability, then insert” has a race: two transactions can both observe no conflict and then insert overlapping bookings. A database constraint evaluates the invariant as part of writes, so concurrent requests cannot both commit conflicting rows merely because their earlier reads saw the same state.

PostgreSQL range types represent intervals such as timestamp ranges, with explicit inclusive/exclusive bounds. A common booking convention is half-open `[start, end)`: the start is included and end excluded, so a reservation ending at 10:00 does not overlap one starting at 10:00. Exclusion constraints reject a pair of rows when all specified operator comparisons are true. For reservations, require equal room IDs not to coexist with overlapping time ranges. GiST indexes can support range overlap operators; scalar equality in the same exclusion constraint may require `btree_gist`.

## Supplied names explained

- **Range type:** a typed interval value, such as `tstzrange`, with operators for overlap and containment.
- **Half-open interval:** includes its lower endpoint but not its upper endpoint; useful for adjacent bookings with no artificial gap.
- **Exclusion constraint:** a rule that prevents rows from satisfying all configured conflicting operators at once.
- **GiST:** an index access method that supports range operators and exclusion checks.
- **btree_gist:** an extension that provides GiST operator classes for many scalar types so equality on a room key can be combined with a range-overlap condition.
- **Constraint violation:** a database error the application should translate into a normal “slot unavailable” response, while retaining diagnostics for unexpected constraint failures.

## Cross-item comparison

| Approach | Concurrency behavior | Trade-off |
| --- | --- | --- |
| Read availability then insert without constraint | Concurrent transactions can both observe availability | Simple but race-prone; a prior read does not reserve the slot |
| Exclusion constraint | Database rejects conflicting rows during writes | Strong invariant in one database; requires correct range/operator/index and careful migration |
| Explicit locking | Can serialize a chosen resource or row | Lock target must exist and all writers must follow the same protocol; broad locks reduce concurrency |
| Serializable transaction | Detects some serialization anomalies and aborts transactions for retry | Requires retry handling and has workload-dependent abort cost; still define the business invariant clearly |
| Distributed lock | Coordinates across processes if correctly designed | Adds a separate dependency and lease failure modes; database constraint may remain the stronger final guard |

## Examples

A table can store `room_id` and `during tstzrange`. After enabling `btree_gist`, an exclusion rule conceptually states: for any two rows, their room IDs must not be equal at the same time that their `during` ranges overlap. Insert each reservation using a half-open range. If two concurrent requests reserve the same room from 09:00 to 10:00, the database allows at most one conflicting row; the loser receives a constraint error. If one booking is 09:00–10:00 and the next is 10:00–11:00, half-open boundaries make the slots adjacent rather than overlapping.

The application should not treat every integrity error as “unavailable.” Identify the named constraint, return a conflict response for that known case, and surface unrelated data errors. If reservations have states such as cancelled or expired, a partial exclusion constraint can limit the rule to active rows, but status transitions and time-based expiry need explicit semantics. A row does not automatically stop conflicting just because its end timestamp is now in the past; the range itself and the query/business policy determine that.

## Common mistakes

- Checking availability in application code and assuming that the check reserves the time slot.
- Using inclusive end bounds so that adjacent intervals conflict unexpectedly.
- Forgetting the scalar equality GiST operator class needed for room IDs, such as `btree_gist` where appropriate.
- Assuming NULL values conflict; SQL null/operator semantics can allow rows through unless columns and expressions are designed deliberately.
- Ignoring cancelled/expired reservation semantics or trying to use a moving wall-clock predicate as if it were automatically updated.
- Translating every constraint violation into a normal conflict and hiding unrelated bugs.
- Adding the constraint without checking existing overlapping rows, index-build duration, locks, and rollout strategy.
- Believing a database constraint protects writes performed in a separate database or external service.

## Knowledge checks with answers

1. **Why can two “check then insert” requests both succeed?** Their reads can run before either insert commits; without an invariant-enforcing constraint or shared serialization mechanism, both see the same empty slot.
2. **Why use `[start, end)`?** It permits adjacent intervals to meet exactly at the boundary without overlapping.
3. **What does the exclusion rule combine?** Equality of the resource key and overlap of the time range; if both comparisons hold for two rows, one is rejected.
4. **Does the constraint replace all application validation?** No. It enforces the final conflict invariant. The application still validates input, handles the named constraint error, and defines lifecycle and response semantics.
