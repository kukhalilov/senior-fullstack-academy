# end-to-end system design case studies — Reference: EVCache

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 3](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 5](https://www.rfc-editor.org/rfc/rfc9110), [reference 6](https://learn.microsoft.com/en-us/ef/core/saving/transactions), [reference 7](https://hld.handbook.academy/curriculum/case-studies/), [reference 8](https://hld.handbook.academy/curriculum/interview-framework/frameworks-compared/), [reference 9](https://www.rfc-editor.org/rfc/rfc9309), [reference 10](https://www.rfc-editor.org/rfc/rfc5322), [reference 11](https://www.rfc-editor.org/rfc/rfc8216).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `EVCache` — Netflix distributed in-memory cache system named by the Handbook; treat its architecture as a case-study example, not a generally available product choice.

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