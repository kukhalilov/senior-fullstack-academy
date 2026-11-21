# SOLID cohesion coupling DRY KISS YAGNI — Exercises and worked solutions

Sources: [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles), [SOLID principles in C#](https://learn.microsoft.com/en-us/archive/msdn-magazine/2014/may/csharp-best-practices-dangers-of-violating-solid-principles-in-csharp), and [YAGNI](https://martinfowler.com/bliki/Yagni.html).

## Goals

Use design principles to diagnose change friction, improve a dependency boundary, and avoid both redundant knowledge and speculative abstraction.

## Worked example

`OrderManager` validates business rules, saves records, renders PDFs, and sends email. Changes to the mail provider require testing tax rules and persistence. Separate the mail adapter from order policy and keep the invariant in a focused domain collaborator. Do not create a generic notification platform until multiple real channels and common requirements justify it.

## Exercises

### Exercise 1: SRP or class-count rule?

A 300-line class has 20 methods but all protect one inventory reservation invariant. Does SRP require splitting it into 20 classes?

#### Worked solution

No. SRP concerns coherent reasons to change, not method count or file length alone. Split only if responsibilities have independent policy/owners or a boundary improves tests and change isolation. A large cohesive module may still need decomposition for readability, but one-method-per-class is not the principle.

### Exercise 2: LSP contract failure

`Storage.Read(key)` promises to return the stored value or a documented not-found result. A subclass throws `NotSupportedException` for some keys that its caller may validly request. What design response fits?

#### Worked solution

The subtype violates the abstraction’s behavioral promise. Narrow the abstraction, model unsupported operations explicitly in a separate capability, or use composition. Do not force callers to inspect concrete subtype type before an operation the contract promises.

### Exercise 3: Distinguish DRY from repeated text

Two screens contain similar phone-number formatting, but one is for a legal export with a fixed international standard and the other is a user-local display. Should they share a formatter?

#### Worked solution

Not automatically. The policies may evolve independently. Give each explicit semantics and share only low-level logic that is truly common and stable. A copied expression is not necessarily duplicated knowledge.

### Exercise 4: Find hidden coupling

`ReportBuilder` reads a mutable global `CurrentTenant`, then writes into `Database.InternalCache`. Identify coupling forms and propose a safer boundary.

#### Worked solution

The global is common coupling; depending on database internals is content coupling. Pass an explicit tenant value and depend on a narrow repository/reporting contract. Let the database implementation own its cache. Verify authorization cannot be bypassed by passing a tenant identifier from an untrusted client.

### Exercise 5: Abstraction timing

One file writer exists today. A design proposes `IWriterFactoryProvider` with 12 methods for possible future cloud/object-store providers. Apply KISS and YAGNI.

#### Worked solution

Build only the current requirement with a clear ownership boundary. If a second real writer appears, identify what is genuinely common and extract the smallest contract. Do not design a framework from a speculative list of future providers.

### Exercise 6: Cohesion and startup

A startup class configures telemetry, checks the database, warms a cache, and schedules a backup. How can temporal cohesion inform a refactor without forcing one module?

#### Worked solution

The startup coordinator may sequence lifecycle tasks, but each task can keep its focused responsibility. Separate implementation behind small collaborators where changes/testing justify it; retain orchestration at the lifecycle boundary.

## Progressive hints

For each case, name what changes, who depends on the behavior, what knowledge must stay synchronized, and which boundary reduces a demonstrated risk. Then account for the complexity introduced by your proposed fix.

## Complete solutions

Each exercise includes one solution. Valid alternatives should preserve contracts and invariants while explaining their own tradeoffs.

## Tests and edge cases

Check substitute implementations against contracts, authorization when passing explicit IDs, independent format evolution, module-level tests, and whether a proposed abstraction has more real users than its creator. Ensure the design does not rely on mutable global state or implementation internals.

## Reflection questions

Which changes become easier after the refactor? Which indirection was added? What evidence would make you reverse the abstraction or centralize duplicated knowledge?
