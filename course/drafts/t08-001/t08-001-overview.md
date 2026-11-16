# SOLID cohesion coupling DRY KISS YAGNI — Big-picture orientation and mental model

Sources: [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles), [SOLID principles in C#](https://learn.microsoft.com/en-us/archive/msdn-magazine/2014/may/csharp-best-practices-dangers-of-violating-solid-principles-in-csharp), [Cohesion in software design](https://www.open.edu/openlearn/science-maths-technology/approaches-software-development/content-section-1.5.4), [Beck’s design rules](https://martinfowler.com/bliki/BeckDesignRules.html), and [YAGNI](https://martinfowler.com/bliki/Yagni.html).

## Problem and purpose

Design principles help teams decide where responsibilities belong, how dependencies should cross boundaries, and whether an abstraction earns its cost. Their purpose is to make change safer and understanding easier, not to maximize the number of interfaces or patterns in a codebase.

## Plain-language mental model

Put things that change together and belong together near one another. Keep dependencies narrow and visible. Avoid conflicting copies of the same knowledge. Prefer the simplest design that meets current requirements, while preserving a clear path to extend it when a real change arrives.

## How the parts fit together

```text
change request → identify responsibility and invariant
               → locate cohesive module
               → expose narrow dependency boundary
               → add only required variation
               → verify behavior and ease of the next change
```

SOLID gives object-oriented guidance on responsibility, extension, substitutability, interface size, and dependency direction. Cohesion and coupling help assess module boundaries. DRY, KISS, and YAGNI guard against repeated knowledge and speculative complexity. These ideas can pull in different directions; context decides.

## Concept map

High cohesion means a module’s work supports a focused purpose. Low coupling means changes and details do not ripple unnecessarily. SRP helps focus responsibilities; ISP narrows client contracts; DIP makes policy depend on abstractions; composition can limit rigid inheritance. DRY concerns knowledge that changes together. KISS and YAGNI challenge abstraction built without a demonstrated need.

## End-to-end walkthrough

Imagine an order service that validates orders, calculates tax, sends email, and writes invoices. A new tax rule forces a change to a large class, while testing it also sends mail. Separate the tax policy behind a meaningful responsibility and make notification a distinct collaborator. Do not create a universal plugin framework for unknown future tax providers. If two tax implementations are now required, use a small explicit extension point. The goal is a focused, testable change, not compliance theater.

## When to use it and tradeoffs

Use these principles during design and refactoring when requirements change, tests are difficult, or unrelated edits collide. Apply them proportionally: abstraction adds indirection and concepts; duplication can be safer when rules only look alike but evolve independently. Inheritance can express a real substitutable relationship; composition often provides looser assembly. A local violation may be the simplest design when the cost of generality exceeds the cost of change.

## What later lessons cover

Reference lessons explain SOLID and composition, cohesion/coupling taxonomies, and changeability heuristics. Practice asks you to classify dependencies and choose a minimal refactoring. Interview material emphasizes tradeoffs and concrete examples.

## Version notes

These are enduring heuristics rather than versioned APIs. Their definitions and applications vary among authors; use the manifest’s scoped terminology and explain the observed design consequence.
