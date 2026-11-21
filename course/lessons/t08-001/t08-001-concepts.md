# SOLID cohesion coupling DRY KISS YAGNI — Core concepts and how they fit together

Sources: [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles), [SOLID principles in C#](https://learn.microsoft.com/en-us/archive/msdn-magazine/2014/may/csharp-best-practices-dangers-of-violating-solid-principles-in-csharp), [Cohesion in software design](https://www.open.edu/openlearn/science-maths-technology/approaches-software-development/content-section-1.5.4), [Beck’s design rules](https://martinfowler.com/bliki/BeckDesignRules.html), and [YAGNI](https://martinfowler.com/bliki/Yagni.html).

## Learning objectives

Explain each SOLID principle with a design consequence; reason about cohesion and coupling; distinguish duplicated text from duplicated knowledge; and choose when an abstraction is worth its cost.

## Prerequisites

Know modules, classes/interfaces, dependencies, tests, and basic object-oriented design. These principles apply beyond object-oriented languages, though SOLID is framed around OO design.

## Core concepts

### SOLID as design guidance

**Single Responsibility Principle (SRP):** a module should have one coherent reason to change. It does not prescribe one method per class; identify the stakeholder or policy whose change should be isolated.

**Open-Closed Principle (OCP):** a stable policy should allow anticipated kinds of extension without repeatedly editing fragile central logic. It does not mean every class needs a plugin system. First observe a real variation point.

**Liskov Substitution Principle (LSP):** implementations of an abstraction should honor its behavioral contract so a client can use them without special cases that violate expectations. Matching method signatures alone is insufficient; preconditions, postconditions, and invariants matter.

**Interface Segregation Principle (ISP):** clients should not depend on operations they do not need. Narrow interfaces reduce accidental coupling but excessive fragmentation can make composition harder.

**Dependency Inversion Principle (DIP):** high-level policy should not be forced to depend on low-level details; both can depend on an abstraction whose ownership is chosen to protect policy. Dependency injection is one way to supply an implementation, not the principle itself.

**Separation of concerns** assigns distinct policies or responsibilities to boundaries that can evolve independently. **Composition over inheritance** favors assembling behavior from collaborators when subtype inheritance would create a rigid or misleading relationship; it is a heuristic, not a ban on inheritance.

### Cohesion and coupling

Cohesion describes how strongly a module’s elements contribute to a shared purpose. Functional cohesion is generally desirable: each part contributes to one well-defined function. Temporal or logical grouping may be weaker when the only connection is “happens at startup” or “is a kind of operation.” Coupling describes dependency relationships. Data/message coupling passes focused values or messages; control coupling exposes flags that tell another module what path to take; common/content coupling shares mutable internals and makes change ripple. The taxonomy is a reasoning vocabulary, not a universal numeric score.

### Changeability heuristics

DRY means one authoritative representation for a piece of knowledge that must change together. Two repeated lines may encode independent policy and should remain separate; one shared rule may be duplicated in different forms and should be centralized. KISS favors the least complex design that satisfies actual constraints. YAGNI postpones capabilities until evidence justifies them. Premature abstraction invents a shared model before repeated cases are understood; premature optimization spends complexity without measured need.

## Mechanisms and relationships

```text
cohesion inside module ↑     dependency knowledge across modules ↓
SRP → focused reason to change; ISP → focused client contract
DIP → policy protected from implementation details
DRY → centralize shared knowledge; YAGNI/KISS → limit speculative machinery
```

These are not independent scores to maximize. A generalized abstraction may reduce textual duplication while increasing coupling and cognitive load. A deliberate copy can preserve independent evolution.

## Worked examples

Two export formats both call a helper that validates the same business invariant. Centralize the invariant because both must change together. Keep format-specific column mapping separate because the rules evolve independently. If a single export method has branches for every format, OCP may suggest a strategy boundary—but only once formats are a real, repeated variation.

## Misconceptions and edge cases

- SRP does not mean every class must contain one method.
- OCP does not forbid changing code; it asks where known extension belongs.
- LSP is behavioral substitutability, not merely inheritance syntax.
- DIP is not synonymous with a dependency-injection container.
- DRY does not mean eliminating all repetition.
- YAGNI does not excuse ignoring a requirement already known to exist.

## Knowledge checks with answers

1. **How does DIP differ from injection?** DIP is about dependency direction; injection is one construction technique.
2. **When should similar code stay separate?** When the represented rules evolve independently.
3. **What is the core LSP test?** Can clients use the substitute while relying on the promised contract?
4. **What should drive abstraction?** Real variation, stable shared knowledge, and the cost of change.
