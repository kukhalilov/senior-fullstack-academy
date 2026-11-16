# code review refactoring and legacy modernization — Reference: Safe structural transformations and characterization strategies

# Scope and version

This lesson covers the supplied refactoring terms and transformations by their common catalog names. Exact automation and safety depend on the language, compiler, IDE, dynamic features, and test setup; this lesson does not assert a language-specific tool contract. A refactoring intends to preserve observable behavior, but tests and tooling provide evidence rather than an absolute guarantee. The names below are the complete assigned group.

# How this group fits the mental model

The overview’s “renovate an occupied building” analogy applies: first understand and protect the behavior in use, then alter structure in small steps. Fowler defines refactoring as a disciplined change to internal structure that preserves external behavior. Where callers cannot all be identified—public APIs, plugins, reflection, persisted names—the “external” boundary is larger and a rename or move may be a breaking change. [Fowler’s definition](https://martinfowler.com/bliki/DefinitionOfRefactoring.html) [Interface changes](https://martinfowler.com/bliki/IsChangingInterfacesRefactoring.html)

# Supplied names explained

- `Refactoring` — A disciplined structural change intended to make code easier to understand or change while preserving observable behavior. If functionality changes, identify and test that separately.
- `Behavior-preserving transformation` — A code transformation whose intended observable results remain the same. Observability includes public output, errors, state changes, timing guarantees, serialization, and side effects relevant to callers.
- `Characterization test` — A test that records what the current system actually does, especially where documentation or design intent is incomplete. It can capture undesirable legacy behavior, so decide deliberately whether to preserve or change each result.
- `Golden master test` — A comparison against recorded output from a baseline execution. It is useful for complex outputs, but volatile fields, ordering, timestamps, and environment-specific values may require normalization; otherwise noise either causes false failures or is normalized too aggressively.
- `Refactoring safety net` — The evidence and controls that make a structural change safer: focused tests, contracts, representative fixtures, type checking, static analysis, review, and incremental diffs. No single net covers every hidden behavior.
- `Extract Function` — Move a cohesive block into a named function with explicit inputs and outputs. It improves structure when the name expresses intent; avoid simply relocating complexity or changing evaluation order and side effects.
- `Inline Function` — Replace a call with the function body when indirection no longer adds meaning. Preserve evaluation count, order, scope, and exception behavior; keep the function if it is a useful abstraction or extension boundary.
- `Rename Variable` — Give a variable a clearer name and update its uses. Check scopes, shadowing, reflection, serialization, generated code, and textual references beyond the compiler’s symbol model.
- `Rename Function` — Rename a function and its callers to clarify intent. A rename can change a public or dynamically referenced contract; inventory callers and compatibility requirements first.
- `Move Function` — Place behavior in a module or type with the responsibility and dependencies it belongs to. Update imports and callers while preserving visibility, initialization timing, and dependency direction.
- `Extract Variable` — Name a subexpression to explain meaning or avoid repeating a calculation. Preserve short-circuit behavior, evaluation timing, mutation visibility, and exception timing.
- `Introduce Parameter Object` — Group related parameters into a value or request object. It can clarify a growing call boundary, but changes construction and compatibility; avoid making an unstable “bag of everything.”
- `Encapsulate Variable` — Hide direct access to a variable behind controlled operations or properties. This creates a place to enforce invariants, but can alter mutation timing, event notification, serialization, or thread-safety assumptions.
- `Replace Magic Number with Symbolic Constant` — Give a meaningful name to a literal whose role is otherwise obscure. Do not name every obvious literal; scope the constant and explain its unit or domain meaning.
- `Split Phase` — Separate work that performs distinct conceptual steps, often producing an intermediate representation from one phase consumed by another. This can make each phase clearer while adding allocation or data-passing costs.
- `Separate Query from Modifier` — Make information retrieval distinct from operations that change state. A query should not silently mutate state, and a command should make its effects apparent; preserve transaction and consistency semantics when separating calls.
- `Extract Class` — Move a cohesive subset of state and behavior into a new class or module with a clear responsibility. Avoid splitting merely by line count; define ownership, invariants, and the new dependency direction.
- `Replace Conditional with Polymorphism` — Move variant-specific behavior into implementations selected through a common contract. Useful when variants evolve independently; can be excessive for a small, closed, stable condition set.
- `Replace Nested Conditional with Guard Clauses` — Return or fail early for exceptional cases so the main path is less deeply nested. Preserve ordering where checks have side effects or where one failure must take precedence.
- `Remove Dead Code` — Remove code that cannot affect observable behavior in the relevant configuration. Prove that feature flags, reflection, external callers, deployment versions, and operational scripts do not use it before removal.
- `Strangler Fig Application` — Incrementally replace an existing system by routing selected capabilities to a new implementation and moving more behavior over time. It reduces big-bang risk but requires routing, coexistence, compatibility, and an explicit retirement plan. [Fowler’s discussion](https://martinfowler.com/bliki/StranglerFigApplication.html)
- `Refactoring versus feature change` — Refactoring targets internal structure while preserving observable behavior; feature change intentionally adds or changes behavior. Keep them separate when feasible, or document and test each intent distinctly.
- `Refactoring versus rewrite` — Refactoring changes a system incrementally within its existing design and constraints; a rewrite replaces a larger implementation. A rewrite may be appropriate, but must account for behavior discovery, parity, migration, coexistence, and delayed value.

# Cross-item comparison

| Choice | Prefer it when | Watch for |
| --- | --- | --- |
| Extract Function vs Inline Function | Extraction names a meaningful step; inlining removes a needless layer. | Evaluation order, recursion, side effects, testability, and useful abstraction boundaries. |
| Extract Class vs Introduce Parameter Object | The former gives a responsibility/state its own owner; the latter groups data crossing a call boundary. | Creating a class solely to move lines or a parameter object with unrelated fields. |
| Conditional-to-polymorphism vs guard clauses | Polymorphism models multiple independently varying behaviors; guard clauses flatten exceptional paths. | Unnecessary type hierarchies or reordered conditions changing behavior. |
| Characterization vs golden master | Characterization is the broader purpose of discovering current behavior; golden master is one snapshot-comparison technique. | Capturing accidental behavior as a permanent contract or unstable snapshots. |
| Refactoring vs rewrite | Refactoring preserves behavior through small transformations; a rewrite replaces implementation more broadly. | A rewrite must rediscover undocumented behavior and support migration while users still need service. |

# Examples

### Extract a function without changing evaluation

```csharp
static decimal CalculateTotal(decimal subtotal, decimal taxRate)
{
    return subtotal + subtotal * taxRate;
}
```

If this code was extracted from a larger expression, first verify the actual domain rules: rounding, currency precision, negative values, and whether tax applies to shipping may be part of observable behavior. Naming the calculation does not establish that its formula is correct.

### Characterize a legacy response before cleanup

Record representative responses for valid, missing, and malformed data, including status, body, and relevant headers. Compare the current implementation to those cases after each structural step. If a response is insecure or violates a desired contract, record it as an intentional behavior change rather than silently updating the baseline.

### Use a Strangler Fig seam

Route a bounded read capability through a new adapter while writes remain with the old system. Compare results for a defined cohort, monitor discrepancies, and specify what happens on timeout. Do not route duplicate write operations to both systems without idempotency and side-effect analysis.

# Common mistakes

- Calling a change “refactoring” while also changing output or error behavior without saying so.
- Treating tests as a complete proof; missing scenarios remain unprotected.
- Over-normalizing golden-master output until differences that matter are hidden.
- Renaming a public or serialized identifier as if IDE symbol search found every caller.
- Extracting abstractions whose only purpose is to follow a pattern rather than reduce change cost.
- Removing apparently dead code without checking configuration, reflection, scripts, and older deployed versions.
- Rewriting a system because its code is unpleasant without defining parity, migration, and user-value checkpoints.
- Keeping Strangler Fig routing and compatibility paths after the old implementation has been retired.

# Knowledge checks with answers

1. **What is the safest order when tests are sparse?** Identify critical behavior, add characterization evidence for the important paths, then make small transformations and check after each step.
2. **Does a golden master say that its output is correct?** No. It records a baseline. The team must decide which observed behavior is required and which should intentionally change.
3. **Why can `Rename Function` break behavior?** Callers may be outside the compiler’s symbol graph, including external consumers, reflection, strings, serialization, or runtime configuration.
4. **When should a conditional remain instead of becoming polymorphism?** When the variant set is small and stable and a hierarchy would add more indirection than it removes.
5. **What makes dead-code deletion risky?** “Unused” may only be true for current tests or current configuration, while external callers or deployment overlap still depend on it.
6. **What is the key guarantee of refactoring?** Behavior preservation is its intent and definition, but practical safety depends on finding the relevant observable behavior and checking it.

# Sources

- [Fowler: definition of refactoring](https://martinfowler.com/bliki/DefinitionOfRefactoring.html)
- [Refactoring catalog](https://refactoring.com/catalog/)
- [Fowler: changing interfaces](https://martinfowler.com/bliki/IsChangingInterfacesRefactoring.html)
- [Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Fowler and Sadalage: evolutionary database design](https://martinfowler.com/articles/evodb.html)
