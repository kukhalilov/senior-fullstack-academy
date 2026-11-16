# code review refactoring and legacy modernization — Exercises and worked solutions

# Goals

By the end, you should be able to review a risky change with concrete, prioritized findings, separate structural cleanup from behavior change, create a safe first modernization slice, and define verification and recovery criteria that can be acted upon.

# Worked example

## Review a retry and idempotency change

A service processes payment requests. The pull request adds automatic retry after a timeout but does not change the provider call contract.

```csharp
public async Task<Receipt> PayAsync(Payment payment, CancellationToken cancellationToken)
{
    try
    {
        return await _provider.ChargeAsync(payment, cancellationToken);
    }
    catch (TimeoutException)
    {
        return await _provider.ChargeAsync(payment, cancellationToken);
    }
}
```

The dangerous ambiguity is whether the first call timed out before or after the provider committed the charge. Retrying may duplicate a payment. A strong review comment is: “A timeout does not tell us whether the provider completed the charge. This retry may charge twice. Please use a provider-supported idempotency key or a reconciliation step, and add a test where the first call commits but the response is lost.” This finding is blocking because it names a direct financial consequence and a behavior that must be safe. A separate nonblocking suggestion might ask whether the retry policy belongs in a shared resilience component, but that does not outrank idempotency correctness.

The author should first establish the provider’s idempotency contract, including key scope and retention, then implement a stable key derived from the logical payment operation. The test must simulate an ambiguous timeout rather than merely throwing before any effect. CI passing on a test that never commits the first charge would not establish safety.

# Exercises

## Exercise 1: Classify review comments

A change renames a private helper, changes an API response from `404` to `200` with an empty object, updates formatting, and includes a migration that drops a column. Classify these proposed comments as blocking, question, or nonblocking suggestion and state why:

1. “Please use the team formatter; the diff includes inconsistent indentation.”
2. “The response status changed. Is this an intentional client contract change? Which clients were checked?”
3. “The migration drops the old column in the same release that first writes the replacement. How are older application instances and rollback handled?”
4. “I prefer `TryFindCustomer` to `FindCustomerOrNull` for the helper name.”

## Exercise 2: Refactor without hiding a behavior change

An order calculation method has repeated discount branches and unclear names. Product also asks to change rounding from per-line to invoice-total rounding. Propose a sequence of changes and tests that makes the structural cleanup reviewable while communicating the new contract.

## Exercise 3: Plan a legacy modernization slice

A monolithic application directly calls an old shipping provider from six modules. The vendor will be retired in nine months. Draft a first migration slice that includes desired outcome, dependency discovery, a seam, behavior baseline, rollout, key risks, a checkpoint, recovery strategy, and an exit criterion.

## Exercise 4: Write actionable review feedback

The code adds a database query inside a loop over search results. The current test contains two rows. Write one specific comment that communicates the concern without assuming the query is always slow, and state what evidence could resolve it.

## Exercise 5: Design a review gate and retrospective

Several production defects involved missing authorization checks at service boundaries. Propose a focused automated gate and one retrospective question. Explain what the gate cannot prove.

# Progressive hints

1. **Exercise 1:** Separate style from contract and data-loss risks; ask questions when required context is missing.
2. **Exercise 2:** Characterize current outputs first. Keep new rounding semantics explicit and test examples where the two policies differ.
3. **Exercise 3:** Do not migrate all six call sites in the first slice. Learn the current contract and select a bounded low-risk operation.
4. **Exercise 4:** Explain how request count scales with rows and mention the tiny fixture; request measurement, batching, or a test that exposes scaling.
5. **Exercise 5:** Put a cross-principal access case into a test that runs at the relevant boundary. A green result still depends on the test and authorization model being correct.

# Complete solutions

## Exercise 1 solution

1. **Usually nonblocking**, unless formatting is a required repository gate. The author can run the formatter; mechanical conventions should be automated.
2. **Clarifying question, potentially blocking.** It changes an observable contract. Determine whether clients rely on 404 semantics and whether this behavior is intentional, documented, and tested. If the author cannot show compatibility or a deliberate migration, request changes.
3. **Blocking concern.** Dropping data while older instances may still need it creates deployment and rollback hazards. Require sequencing/compatibility evidence and a recovery plan before destructive cleanup.
4. **Nonblocking suggestion.** It is a naming preference unless a project convention or actual ambiguity makes the current name harmful.

Do not classify solely by comment wording. A “question” can surface a blocking risk; a “suggestion” can be blocking if the consequence justifies it. State the reason and local workflow semantics.

## Exercise 2 solution

First add characterization tests for important existing inputs: no discount, each discount branch, negative/zero values if valid, multiple line items, and current rounding boundaries. Verify the expected total with a trusted domain example. Then make a behavior-preserving structural change—extract a named discount calculation or remove duplicate branches—without changing rounding order. Review and run the targeted suite. In a separate behavioral change, state “round once at invoice total” as the new contract, implement it, and add cases where per-line and invoice rounding differ (for example two fractional results whose individually rounded sum differs from the rounded aggregate). Update API/business documentation and release notes if consumers observe the result. If business insists on combining the changes, the description and tests must still distinguish the refactoring from the intentional behavior change.

## Exercise 3 solution

- **Outcome:** route one bounded shipping quote operation through the supported replacement without changing quote semantics or delaying the rest of the vendor migration.
- **Discovery:** list six call sites, request/response fields, timeout/retry behavior, currencies/regions, scheduled jobs, support workflows, and vendor side effects. Validate the map with logs and maintainers.
- **Seam:** introduce a narrow shipping-quote interface and an adapter for the old provider; avoid a generic abstraction for every vendor endpoint.
- **Baseline:** record representative quote, unavailable-region, timeout, and error behavior. Add contract tests around the adapter and customer-visible totals.
- **Slice:** migrate a low-volume, reversible region/capability first. Keep one implementation selected per request; do not duplicate a write-like booking call in a shadow path.
- **Rollout:** feature-flag a cohort, compare quote totals and error/latency metrics, monitor user completion, and expand only after the checkpoint passes.
- **Risks:** hidden price adjustments, unit/currency conversion, inconsistent availability, timeout ambiguity, old/new configuration mismatch, and lack of support expertise.
- **Checkpoint/recovery:** halt expansion if discrepancy or error thresholds exceed predeclared limits. Route back only while old provider credentials and contract remain usable; after bookings are created in the new provider, use reconciliation/compensation rather than pretending routing reversal undoes them.
- **Exit criterion:** all selected-region workflows use the new adapter for an agreed observation period, outcomes remain within stated parity thresholds, and operations can support it. Repeat the pattern for other bounded capabilities; retire the old adapter only when all consumers and bookings are accounted for.

## Exercise 4 solution

“This appears to execute one database query for each result, so request count may grow with the number of matches. The current fixture has only two rows and may not expose the cost. Could we batch the lookup or add a representative query-count/performance check at expected result sizes? If the data volume is bounded or the query is served from a cache, please share that evidence.”

This is actionable but calibrated: it identifies a scaling mechanism, asks for evidence, and leaves room for context that could make it acceptable.

## Exercise 5 solution

Add an integration test at the service boundary that authenticates as tenant A and requests a valid resource owned by tenant B; assert the intended denial and verify no sensitive data is returned. Make that test a required CI check for the affected service. Add a review checklist prompt to inspect authorization where resource queries change. Retrospective question: “Which information or defense was unavailable when the change was made, and what system change will make this class of cross-tenant omission harder to release?”

The gate does not prove the identity model, tenant ownership data, or all resource paths are correct. It also does not prove security against unrelated threats. Review scope and targeted security analysis still matter.

# Tests and edge cases

When reviewing or rehearsing the scenarios, check that:

- A timeout can occur before or after an external side effect commits.
- Retry keys are stable across retries but unique across independent logical operations.
- Monetary rounding examples actually distinguish the competing policies.
- A migration is tested with malformed, missing, duplicate, and unexpectedly large legacy records.
- Old and new application instances can coexist for the stated deployment interval.
- A rollback description accounts for writes already performed under the new contract.
- Reviewer comments describe impact without assuming an unverified cause.
- Test gates run against the current revision and fail clearly when required checks are missing.

# Reflection questions

1. Which review comments do you find hardest to write, and how could you anchor them in observable impact?
2. What important behavior in a codebase you know is undocumented? How would you characterize it without freezing undesirable behavior forever?
3. Which modernization decision in the shipping scenario becomes irreversible first?
4. How would you define a review service level that exposes bottlenecks without rewarding rushed approvals?
5. What evidence would convince you to retire a compatibility layer?

# Sources

- [Google reviewer guide](https://google.github.io/eng-practices/review/reviewer/)
- [Google author guide](https://google.github.io/eng-practices/review/developer/)
- [Fowler: definition of refactoring](https://martinfowler.com/bliki/DefinitionOfRefactoring.html)
- [Fowler: changing interfaces](https://martinfowler.com/bliki/IsChangingInterfacesRefactoring.html)
- [Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Fowler and Sadalage: evolutionary database design](https://martinfowler.com/articles/evodb.html)
