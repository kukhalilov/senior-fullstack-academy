# SOLID cohesion coupling DRY KISS YAGNI — Interview questions and reasoning

Sources: [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles), [SOLID principles in C#](https://learn.microsoft.com/en-us/archive/msdn-magazine/2014/may/csharp-best-practices-dangers-of-violating-solid-principles-in-csharp), [Beck’s design rules](https://martinfowler.com/bliki/BeckDesignRules.html), and [YAGNI](https://martinfowler.com/bliki/Yagni.html).

## Core questions

Be ready to explain principles as ways to reduce concrete change risk, not as slogans. Give an example, identify a boundary, and mention the cost of overapplying the rule.

## Concise interview answers

SRP groups one coherent reason to change. OCP isolates real extension points. LSP preserves behavioral contracts. ISP keeps clients independent of unused operations. DIP protects policy from low-level details. DRY centralizes shared knowledge; KISS and YAGNI control complexity and speculative work.

## Deep follow-up answers

### How do you identify a responsibility?

Look at the policy, stakeholder, invariant, and reasons code changes. Method count is a weak signal by itself. A cohesive module can have many operations that protect one domain responsibility.

### Does DRY mean eliminating duplicate code?

No. It targets duplicated knowledge that must stay synchronized. Similar-looking code can express independent policies and may be safer separate. A copied security or pricing rule is duplicated knowledge even if its syntax differs.

### Is dependency injection the same as DIP?

No. DIP is about dependency direction and abstraction ownership. Injection is a way to provide an implementation. A system can use an injection container while high-level policy still depends on low-level details or an abstraction owned by infrastructure.

### When is composition better than inheritance?

When behavior should be assembled from collaborators or subtype contracts are not genuinely substitutable. Inheritance remains appropriate for stable behavioral subtyping. Composition can reduce hierarchy coupling but may add delegation.

## Scenario questions

### A shared helper has four callers

Determine whether they encode the same knowledge and change for the same reasons. If so, centralize a focused policy. If they merely share syntax while their contracts evolve separately, keep independent implementations or share a lower-level primitive.

### An interface has 30 methods

Inspect clients and change patterns. If clients depend on unrelated capabilities, define coherent smaller contracts. Avoid splitting mechanically into one-method interfaces without usage evidence.

### A team wants a plugin system for one implementation

Ask whether extension is a current requirement, whether a stable variation exists, and whether the system’s operating cost is justified. A narrow direct implementation may be clearer until another implementation is real.

## Tradeoffs and alternatives

Abstraction can reduce change ripple but adds indirection. Duplication can preserve independent policy but risks drift when knowledge is shared. Inheritance can express substitutability but restrict implementation. Composition gives assembly flexibility but may produce forwarding boilerplate. Choose based on observed change and contract stability.

## Common weak answers

- “A class should have one method.”
- “OCP means never modify existing code.”
- “DIP means use an IoC container.”
- “DRY means no repeated lines.”
- “Inheritance is bad; always use composition.”
- “YAGNI means ignore future-facing requirements already committed.”

## Self-check rubric

State the principle accurately, give a concrete example, explain the change or correctness risk, and acknowledge the cost or limitation. Avoid treating a heuristic as a guarantee.

## Senior-level signals

Distinguishes textual similarity from shared knowledge, explains behavioral contracts, notices hidden global/content coupling, and ties abstractions to real variation and team change patterns.
