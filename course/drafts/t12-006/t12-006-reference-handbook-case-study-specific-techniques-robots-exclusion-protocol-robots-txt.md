# end-to-end system design case studies — Reference: Robots Exclusion Protocol (robots.txt)

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 3](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 5](https://www.rfc-editor.org/rfc/rfc9110), [reference 6](https://learn.microsoft.com/en-us/ef/core/saving/transactions), [reference 7](https://hld.handbook.academy/curriculum/case-studies/), [reference 8](https://hld.handbook.academy/curriculum/interview-framework/frameworks-compared/), [reference 9](https://www.rfc-editor.org/rfc/rfc9309), [reference 10](https://www.rfc-editor.org/rfc/rfc5322), [reference 11](https://www.rfc-editor.org/rfc/rfc8216), [Google Cloud unknown transaction outcomes](https://docs.cloud.google.com/spanner/docs/queues/queues-at-most-once), [AWS idempotent operations](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_idempotent.html), [Azure caching guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Robots Exclusion Protocol (robots.txt)` — A crawler convention defined by RFC 9309 for crawler access rules; it is not access control and does not guarantee that a site is private. [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309).

## Cross-item comparison

Use the item descriptions above to compare purpose, guarantee, and cost. Choose the smallest mechanism that provides the needed behavior; similar names may operate at different layers or under different assumptions.

## Examples

Before fetching a site path, retrieve and parse the applicable robots policy for the origin. Cache the policy only within its HTTP freshness rules, apply the specified matching group and longest-match behavior, and distinguish a successful policy response from unavailable or unreachable policy retrieval. Robots rules guide crawler behavior; they are not access control and do not authorize bypassing authentication or server restrictions.
## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** Make ownership of each piece of state explicit; a cache or replica does not by itself establish that ownership. Microsoft's caching guidance treats a cache as a copy rather than the authoritative store for critical information, while its microservices guidance distinguishes a service's source-of-truth data from other services' eventually consistent copies. [Caching](https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching); [microservices data](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/data-considerations).
2. **What if an acknowledgement is lost?** The caller may not know whether the operation committed. Resolve the outcome if the system provides a safe way to do so; otherwise retry only when the operation is idempotent or deduplicated, because repeating a non-idempotent side effect can apply it twice. [Google Cloud documents this as the unknown commit status problem](https://docs.cloud.google.com/spanner/docs/queues/queues-at-most-once); [AWS describes idempotency tokens for safe retries](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_idempotent.html).
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.
