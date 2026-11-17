# system design foundations and infrastructure building blocks — Reference: Operating-system resources and foundational data structures

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.rfc-editor.org/rfc/rfc8446), [reference 3](https://www.rfc-editor.org/rfc/rfc9293), [reference 4](https://www.rfc-editor.org/rfc/rfc6455), [reference 5](https://www.rfc-editor.org/rfc/rfc9000), [reference 6](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Process` — An operating-system resource boundary with its own address space and lifecycle; process isolation costs more than sharing memory between threads.
- `Thread` — A schedulable execution path within a process that shares process memory and therefore requires synchronization around shared state.
- `Virtual memory` — An address-space abstraction backed by physical pages and possibly storage; page faults and working-set pressure can dominate tail latency.
- `Page cache` — Operating-system memory that caches file-backed data, often making repeated reads faster while competing with application memory.
- `Blocking I/O` — An operation where the caller waits until I/O completes; too many blocked worker threads can limit concurrency.
- `Readiness-based I/O` — An I/O model that notifies an event loop when a descriptor can progress, reducing idle thread use while adding state-machine complexity.
- `File descriptor` — A process-local handle to an open file, socket, or similar resource; descriptor limits can constrain connection-heavy services.
- `Hash table` — A key-to-bucket structure with expected efficient lookup under a suitable hash and load policy; collisions and adversarial keys matter.
- `Skip list` — A layered linked structure supporting expected logarithmic search and ordered traversal with simpler probabilistic balancing.
- `Bloom filter` — A compact approximate set-membership structure with possible false positives but no false negatives for inserted values under correct use.
- `B-tree` — A balanced page-oriented search tree that supports ordered lookup and range scans with bounded tree height.
- `LSM tree` — A write-optimized storage structure that flushes sorted runs and compacts them later, trading write behavior for read/space amplification.

## Cross-item comparison

Use the item descriptions above to compare purpose, guarantee, and cost. Choose the smallest mechanism that provides the needed behavior; similar names may operate at different layers or under different assumptions.

## Examples

For a new feature, trace one successful operation and one failure through the relevant items. Identify the authoritative component, the state that is copied or derived, and what happens when a request is delayed, repeated, or interrupted.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** That is an explicit application data-ownership decision, not implied by a cache or replica.
2. **What if an acknowledgement is lost?** Treat the outcome as unknown; use idempotency or verification before repeating an effect.
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.