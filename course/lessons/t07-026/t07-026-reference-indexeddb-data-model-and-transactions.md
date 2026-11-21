# Browser persistence offline operation and web workers — Reference: IndexedDB data model, queries, and transaction boundaries

## Scope and version

This lesson covers the IndexedDB concepts in the supplied inventory. APIs are asynchronous and browser behavior should be checked against supported targets.

## How this group fits the mental model

IndexedDB is the browser’s structured local database for records that need more than a string key/value pair. A transaction defines the operations that belong together and provides the boundary for commit or abort.

## Supplied names explained

- `IndexedDB database` — A per-origin database containing named object stores and a schema version. Keep a clear owner and migration plan for each database.
- `Object store` — A collection of records stored by key. It is analogous to a table only loosely: it has browser-specific transaction and index semantics rather than SQL joins.
- `Key path and key generator` — A key path derives a record key from its data; a key generator can supply incrementing keys. Choose stable identifiers for synchronized domain records so local and server identity do not drift.
- `Index` — A secondary lookup structure over selected record values. Indexes support efficient lookup patterns but add maintenance and schema decisions; define them for actual queries.
- `Cursor and key range` — A cursor traverses records in key order, while a key range bounds the keys visited. They allow ordered scans and range-based access without loading an entire store into memory.
- `Structured clone` — The serialization mechanism used to copy supported values into and out of IndexedDB. Not every JavaScript value is cloneable; validate the data shape and handle cloning failures.
- `readonly transaction` — A transaction intended to read records. It communicates intent and allows the browser to coordinate access; it cannot be used to mutate stored data.
- `readwrite transaction` — A transaction that can mutate records in its scope. Group related writes so partial application does not leave inconsistent local state.
- `Transaction completion and abort` — The transaction’s completion indicates its operations committed; abort means its changes did not commit. Do not treat an individual request’s success event as proof the overall transaction committed.
- `Asynchronous request model` — Requests complete through events/promises supplied by the chosen wrapper, and transactions have a bounded active lifetime. Avoid awaiting unrelated work inside a native transaction if that can let it become inactive before issuing the next database request.

## Cross-item comparison

An object store is the primary record collection; an index and key range refine lookup; a cursor supports traversal. A key path derives identity from a record, while a generator assigns a key. Read-only and read/write transactions express different access and mutation roles.

## Examples

For an offline task editor, store task records by stable task ID and add an index for a real query such as tasks by project. In one read/write transaction, update the local task and append its pending synchronization operation. Consider the update successful only after the transaction completes. If the operation fails, keep the UI from claiming the local write was committed.

## Common mistakes

- Creating indexes speculatively; every index has storage and write-maintenance cost.
- Assuming a successful request means the transaction committed.
- Treating IndexedDB as SQL with arbitrary joins.
- Keeping a transaction open while waiting on network work.
- Persisting unsupported values without handling structured-clone errors.

## Knowledge checks with answers

1. When should the UI regard a grouped write as committed? When the transaction completes successfully.
2. What is an index for? A defined lookup pattern over record fields, with storage and write costs.
3. Should a network request be awaited inside a database transaction? No; finish the local transaction and coordinate network work outside it.

### Sources

- [Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Indexed Database API specification](https://w3c.github.io/IndexedDB/)
