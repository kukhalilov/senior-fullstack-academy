# test design flaky tests coverage limits and maintainability — Reference: Generated cases, invariants, shrinking, and example-based complements

# Scope and version

This reference covers the supplied property-based and example-based testing vocabulary, with FsCheck .NET/F# concepts from its official documentation. FsCheck API syntax differs by language binding and integration version; this lesson explains the named surfaces without inventing overload signatures. Sources checked 2026-11-17. [FsCheck quick start](https://fscheck.github.io/FsCheck/QuickStart.html) [FsCheck test data](https://fscheck.github.io/FsCheck/TestData.html) [Running FsCheck tests](https://fscheck.github.io/FsCheck/RunningTests.html)

# How this group fits the mental model

An example-based test provides a known input and expected result. A property-based test describes a rule over many generated inputs. Generators choose examples from a domain, and shrinkers seek a smaller counterexample when the property fails. FsCheck connects these ideas to test runners and provides configurable checking/replay.

# Supplied names explained

- `Property-based testing` — Testing a general property across generated inputs rather than only hand-picked examples. It is powerful when a meaningful invariant can be stated and the input domain can be generated deliberately.
- `Property` — A predicate or relationship expected to hold for values in a defined domain. A vague or incomplete property can pass while the program remains wrong; validate the rule against requirements and examples.
- `Invariant` — A condition that must remain true for every valid state/input in scope, such as a normalized result being idempotent or a collection preserving element count. State preconditions explicitly so invalid inputs are not mistaken for invariant failures.
- `Generator` — Logic that creates test inputs. A useful generator covers meaningful valid cases, boundaries and relevant invalid cases instead of producing mostly unrealistic data.
- `Shrinker` — Logic that proposes smaller inputs after a failure while preserving the failure. A good shrinker makes the root condition easier to see; shrink quality affects diagnosis, not whether the original test ran.
- `Counterexample` — A generated input for which the property is false. Keep the minimal useful example as a named regression when it captures a stable defect.
- `FsCheck` — A property-based testing library for .NET and F# that generates inputs, checks properties and shrinks failing values. It can be integrated with test frameworks or called directly.
- `FsCheck.Xunit` — The FsCheck integration for xUnit, including a property attribute and test-runner reporting. Match package versions with the selected xUnit generation; examples in one integration version may not compile unchanged under another.
- `PropertyAttribute` — The FsCheck.Xunit attribute that marks a parameterized property test. FsCheck supplies generated arguments and can report a counterexample; test arguments/property return shape follow the integration’s documented conventions.
- `Prop.ForAll` — FsCheck’s combinator for expressing a property over generated values. It connects a generator/arbitrary instance to the predicate being checked; use an explicit domain when default generation does not exercise the important cases.
- `Arbitrary<T>` — An FsCheck value that associates a generator and shrinker for type `T`. Custom arbitrary values can improve domain validity and produce more useful counterexamples.
- `Gen<T>` — A generator of values of type `T`. Compose or constrain generators to represent the domain rather than filtering away most generated values, which can waste test runs.
- `Arb.Sized` — A way to make an arbitrary/generator depend on a size parameter used by FsCheck. Size controls the scale of generated structures; establish a suitable distribution so very large inputs do not dominate or never appear.
- `Check.Quick` — A quick FsCheck entry point that runs a property with a default configuration and reports pass/failure information. Defaults are convenient for exploration; use explicit configuration when seed, test count, or diagnostics matter.
- `Check.One` — An FsCheck entry point that runs a property with an explicit configuration. It is useful for choosing settings or replaying a seed in a controlled way.
- `Seed replay` — Re-running a randomized property with the seed and relevant size/configuration from a failure. Preserve the exact inputs/configuration and environment assumptions; a seed does not control external time, network, or shared state.
- `State-machine property test` — A property that generates a sequence of commands/actions against a model and a system under test, checking that state transitions remain consistent. Make commands repeatable and isolate mutable state so shrinking/replay can rebuild the scenario.
- `Metamorphic relation` — A relation between multiple executions whose outputs should change predictably when inputs are transformed. It helps when a direct expected output oracle is hard to obtain, but the relation itself must be independently justified.
- `Differential testing` — Running the same inputs through two implementations and comparing results. It is useful when one implementation is a trusted reference, but correlated bugs or different valid semantics can make simple equality misleading.
- `Example-based test` — A test with explicitly selected input and expected outcome. It documents named behavior and edge cases clearly; it complements generated exploration rather than competing with it.
- `Boundary-value test` — A test at or near a meaningful domain boundary, such as minimum/maximum values, empty input, or one item beyond a limit. Boundaries often reveal off-by-one and validation defects.
- `Combinatorial test` — A method of selecting cases that cover combinations of input factors without testing the full Cartesian product. Use it when interactions among settings matter and exhaustive combination is too large.
- `Pairwise test` — A combinatorial design in which every pair of values across factors appears in at least one test. It reduces case count for pairwise interactions but can miss defects requiring three-way or higher-order combinations.
- `Decision table` — A table mapping conditions to expected actions/outcomes. It helps identify missing combinations and translate business rules into clear example tests; validate that the table covers relevant defaults and contradictory conditions.

# Cross-item comparison

**Property vs example:** A property explores a general relation across many inputs; an example records a specific requirement with a fixed expected result. Use both: examples explain the contract and generated values challenge it.

**Generator vs shrinker:** A generator broadens exploration; a shrinker reduces a discovered failure. A poor generator may never reach the important case, while a poor shrinker may leave a hard-to-understand counterexample. Neither substitutes for a correct property.

**Pairwise vs exhaustive combination:** Pairwise coverage includes every pair of factor values but not every higher-order interaction. Use it as a cost reduction when pairwise interactions are a reasonable risk model, not as exhaustive proof. No within-group comparison applies to a single item.

# Examples

### String normalization

Suppose a function trims and lowercases an identifier. A property could require that applying normalization twice produces the same output as once. A second property could require that the output contains no leading/trailing spaces and uses the expected case normalization. Add explicit examples for empty string, whitespace-only input, and a known regression. Generators should include Unicode and boundary lengths if the domain requires them; ASCII-only generation would leave those behaviors unexplored.

### A list invariant

For an operation that reverses a sequence, one property states that reversing twice restores the original sequence. Another checks that output length equals input length. Example cases document empty, one-item, repeated-value, and two-distinct-item behavior. If the generated collection is mutable, recreate it for each property evaluation so shrinking does not reuse a modified instance.

### Replay and regression

When FsCheck prints a failing seed, replay with the same configuration to reproduce the generated case. Inspect the shrunk counterexample, explain the violated rule, and add a named example if it captures a durable contract. Keep the property too: the single regression case does not replace broader exploration.

# Common mistakes

- Writing a tautological property that checks the implementation against itself.
- Generating mostly invalid values when the property only applies to valid input, or filtering so heavily that very few cases run.
- Treating a generated case count as proof of domain completeness.
- Dropping a failing counterexample after fixing the code and losing a readable regression example.
- Using mutable shared state while FsCheck shrinks/re-evaluates a property.
- Replaying only the seed while changing size/configuration or external environment.
- Treating pairwise test design as full combination coverage.
- Comparing two implementations that share the same bug and calling the equality result proof.
- Omitting examples because a property-based suite exists.

# Knowledge checks with answers

1. **What should a property state?** A meaningful rule or relation that must hold for the explicitly defined domain.
2. **What is a counterexample?** A generated input that falsifies the property.
3. **Why use a shrinker?** It reduces a failing input to a simpler case that helps expose the essential cause.
4. **What does pairwise testing guarantee?** Every pair of factor values appears in at least one selected case, not that all higher-order combinations are covered.
5. **Why keep examples alongside generated tests?** They document specific business expectations and stable regressions in an easy-to-read form.

# Sources

- [FsCheck quick start](https://fscheck.github.io/FsCheck/QuickStart.html)
- [FsCheck test data, generators and shrinkers](https://fscheck.github.io/FsCheck/TestData.html)
- [FsCheck running tests](https://fscheck.github.io/FsCheck/RunningTests.html)
- [FsCheck tips and mutable-state considerations](https://fscheck.github.io/FsCheck/TipsAndTricks.html)
