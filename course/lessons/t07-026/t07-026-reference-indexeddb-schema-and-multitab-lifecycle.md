# Browser persistence offline operation and web workers — Reference: IndexedDB schema upgrades, multiple tabs, and recovery

## Scope and version

This lesson focuses on database schema lifecycle and failure recovery. Keep migrations small, atomic, and compatible with tabs that may still run older application code.

## How this group fits the mental model

IndexedDB schema changes happen through a versioned upgrade transaction. An old page holding an open connection can block a new version from opening. The application must coordinate tabs and explain failures rather than waiting indefinitely.

## Supplied names explained

- `Database version` — The integer version used to distinguish schema revisions for an origin’s database. An application requests a version when opening; an upgrade runs when the stored version is older.
- `upgradeneeded migration` — The event path used to create or change stores and indexes during a version upgrade transaction. Perform schema work here rather than treating ordinary read/write transactions as schema migrations.
- `versionchange event` — A notification to an open connection that another context is requesting a version change or deletion. Close the connection promptly so the upgrade can proceed.
- `blocked upgrade` — An open request is blocked because an older connection has not closed. Notify the user or other tabs and provide a bounded recovery path.
- `Connection close and upgrade coordination` — Close on `versionchange`, avoid leaking connections, and coordinate refresh/reload across tabs where practical. Do not assume all tabs are on the newest code at once.
- `Atomic schema upgrade` — Schema changes occur as one upgrade transaction; if it aborts, the upgrade does not leave a partially migrated schema. Keep data transformations within the supported upgrade work and plan for errors.
- `Transaction error bubbling` — Request errors can cause a transaction to abort unless handled according to the API’s event/error rules. Observe transaction-level completion and abort, not just individual request callbacks.
- `Quota and storage failure recovery` — A write or migration can fail because of quota, browser policy, or device conditions. Preserve recoverable server data, report local unsaved work accurately, and do not silently discard pending records.

## Cross-item comparison

The database version triggers an upgrade; `upgradeneeded` performs the migration; `versionchange` helps existing connections get out of the way; `blocked` explains why a new open request cannot proceed. Atomicity protects schema state, but application recovery is still needed for quota or migration failure.

## Examples

When adding an index, open the next database version and create the index in the upgrade transaction. If another tab is open, its connection receives `versionchange`; close it and optionally tell the tab to reload. If it does not close, surface the blocked state and ask the user to close or refresh the older tab. After upgrade failure, keep server synchronization and export paths available where possible.

## Common mistakes

- Leaving database connections open after a tab is no longer using them.
- Assuming an upgrade cannot be blocked by another tab.
- Performing unrelated asynchronous work during the upgrade transaction.
- Ignoring transaction abort events and telling the user a migration succeeded.

## Knowledge checks with answers

1. Why can an upgrade be blocked? Another context still has a connection that has not closed.
2. Where should an index be added? In the schema upgrade transaction.
3. Does an atomic upgrade remove the need for a recovery UI? No; failures and incompatible old clients still need handling.

### Sources

- [Using IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [IndexedDB blocked event](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/blocked_event)
- [Indexed Database API specification](https://w3c.github.io/IndexedDB/)
- [Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
