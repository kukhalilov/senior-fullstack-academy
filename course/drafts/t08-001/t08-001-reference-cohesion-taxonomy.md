# SOLID cohesion coupling DRY KISS YAGNI — Reference: Cohesion levels used to reason about module responsibility

Sources: [Cohesion in software design](https://www.open.edu/openlearn/science-maths-technology/approaches-software-development/content-section-1.5.4) and [cohesion taxonomy study](https://publications.rwth-aachen.de/record/755886/files/755886.pdf?version=1).

## Scope and version

Cohesion labels describe how strongly a module’s parts relate to a purpose. Textbooks order these forms differently in some details; use the labels as a diagnostic vocabulary, not a universal quality score.

## How this group fits the mental model

Higher cohesion generally means a module is easier to explain and change as one unit. The labels help identify whether elements share a real functional purpose or were grouped by incidental circumstances.

## Supplied names explained

### Functional cohesion

Every element contributes to one well-defined function or result. This is typically the strongest form: a module parses and validates a specific request format, for example. Keep its operations focused on that outcome.

### Sequential cohesion

One part’s output becomes the next part’s input. A pipeline that parses, normalizes, and validates data has sequential cohesion. It can also have functional cohesion if the complete sequence serves one coherent purpose.

### Communicational cohesion

Operations are grouped because they work on the same data or record. This can be a useful object boundary, especially when the operations protect one invariant; it can be weaker if the shared data is the only relationship.

### Procedural cohesion

Elements are grouped because they must execute in a particular order, even though they may operate on different data or serve different policies. A coordinator can legitimately sequence cohesive components; placing all steps into one module solely because of order may obscure responsibility.

### Temporal cohesion

Elements are grouped because they happen at the same time, such as startup or shutdown tasks. A lifecycle coordinator may be appropriate, while the individual tasks can remain separate responsibilities.

### Logical cohesion

Elements are grouped because they belong to a broad category and one is selected by a flag or mode. A utility module with unrelated file, date, and network helpers has logical grouping. Separate focused modules may make changes and tests easier.

### Coincidental cohesion

Elements share no meaningful relationship and appear together for accidental reasons. This is usually the weakest form and often signals a “miscellaneous” module that should be reconsidered.

## Cross-item comparison

Functional cohesion groups work around one result; sequential cohesion follows a data pipeline; communicational cohesion shares data; procedural and temporal cohesion group by order or time; logical and coincidental cohesion have weaker relationships. These forms can overlap in real modules and are not mutually exclusive labels.

## Examples

An image import module that validates dimensions, normalizes metadata, and returns a verified image can be functionally cohesive. A startup coordinator that invokes database migration, telemetry registration, and cache warmup is temporally/procedurally cohesive, while each task should keep its own implementation boundary.

## Common mistakes

- Ranking a module by label alone without considering its purpose.
- Treating sequential cohesion as automatically good even if the pipeline mixes unrelated policy.
- Extracting each line into a separate module in pursuit of a taxonomy.
- Assuming all tasks run at startup must share one implementation module.

## Knowledge checks with answers

1. **Which form focuses all elements on one result?** Functional cohesion.
2. **What groups work by common timing?** Temporal cohesion.
3. **What is a warning sign for logical cohesion?** Many unrelated operations selected by a broad mode or flag.

### Exact terms covered

- `Functional cohesion`
- `Sequential cohesion`
- `Communicational cohesion`
- `Procedural cohesion`
- `Temporal cohesion`
- `Logical cohesion`
- `Coincidental cohesion`

### Exact terms covered

- `Functional cohesion`
- `Sequential cohesion`
- `Communicational cohesion`
- `Procedural cohesion`
- `Temporal cohesion`
- `Logical cohesion`
- `Coincidental cohesion`
