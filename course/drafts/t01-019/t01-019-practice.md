<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CLR execution IL JIT AOT assemblies reflection attributes and loading — Exercises and worked solutions

## Goals

Practice tracing execution from source to runtime, reasoning about assembly and type identity, separating metadata inspection from invocation, and designing a plugin boundary that survives trimming/AOT analysis. Source references: [AssemblyLoadContext guidance](https://learn.microsoft.com/en-us/dotnet/core/dependency-loading/understanding-assemblyloadcontext), [Native AOT](https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/), and [MetadataLoadContext](https://learn.microsoft.com/en-us/dotnet/standard/assembly/inspect-contents-using-metadataloadcontext).

## Worked example

### Choose a deployment model from requirements

A command-line utility runs in a controlled fleet, must start quickly, and uses a fixed set of registered handlers. It can target a known OS/architecture and does not generate code at runtime. Native AOT is a plausible candidate, but the choice is not automatic: publish it, inspect analyzer warnings, test reflection/resource paths, and measure startup, size, memory, and update workflow. If the app depends on arbitrary runtime-loaded plugins or `Reflection.Emit`, ordinary JIT deployment may fit better. The choice follows constraints and measured output, not the label “native.”

## Exercises

### Exercise 1: Trace the execution pipeline

For a framework-dependent C# app that uses ReadyToRun assemblies and tiered compilation, put these events in a useful order and explain possible fallback: SDK compile; host selects runtime; dependency load; method first call; later optimization of hot method.

### Exercise 2: Diagnose a failed plugin cast

The host and plugin both define a type named `Contracts.IPlugin`. The plugin instance fails `is IPlugin` in the host. Give the likely cause and fix the plugin contract design.

### Exercise 3: Make plugin unload possible

A collectible context receives `Unload()`, but a weak reference to it stays alive. List at least four plausible roots and describe a disciplined shutdown sequence.

### Exercise 4: Repair a reflection/trimming risk

Code reads a type name from configuration, calls `Assembly.GetType`, looks up a private method by name, and invokes it. Explain at least four risks and propose two alternatives for a known set of handlers.

### Exercise 5: Choose inspection or execution

A build tool scans a directory of third-party assemblies to find public types marked with an attribute. It must not run their code. Choose the API approach and explain why constructing attribute instances can be undesirable.

### Exercise 6: Evaluate Native AOT compatibility

A library uses `Reflection.Emit`, discovers arbitrary public types by scanning assemblies, and constructs arbitrary generic types from configuration. Explain which assumptions conflict with Native AOT and outline a migration strategy.

## Progressive hints

1. Compilation/build output exists before host selection. ReadyToRun can provide initial code; unavailable methods can still be JIT compiled.
2. Compare defining assembly instances/load contexts, not just full type names.
3. Consider static events, host caches, plugin tasks/threads, instances/delegates, reflection caches, and locals/stack frames.
4. Private reflection is brittle; trimming may remove hidden members; invocation can be ambiguous or throw wrapped exceptions.
5. Use metadata-only inspection and metadata representations of attributes.
6. Make the supported types/statics visible at build time, replace dynamic generation, and analyze/publish for target RIDs.

## Complete solutions

### Solution 1

The SDK compiles source into assemblies containing IL/metadata. At process startup, the host selects a compatible runtime from deployment configuration. The runtime/load context resolves dependencies. At first method use, available ReadyToRun code can execute; otherwise JIT compiles the method. Tiered compilation can later recompile hot methods at an optimizing tier, optionally using profile data. Thus ReadyToRun can reduce initial JIT work but is not a guarantee of no runtime JIT.

### Solution 2

The likely cause is duplicate contract assembly identity. The host and plugin loaded separate copies of `Contracts.dll` into different contexts, so their `IPlugin` types are distinct runtime types. Load the contract assembly once in a shared context (commonly Default) and configure plugin resolution to reuse that exact assembly instance. Keep private plugin dependencies isolated where appropriate. Do not use matching file names/full names as proof of identity.

### Solution 3

Potential roots include: host-held plugin instances; delegates subscribed to host static/global events; cached `Type`/`MethodInfo` objects; plugin-created tasks or active thread stacks; timers/callbacks; static fields; exception objects; and native callbacks rooting delegates. A safe shutdown stops new work, cancels and awaits tasks, stops/joins threads, unsubscribes events, disposes plugin resources, clears host caches/instances/delegates, initiates `Unload`, then verifies eventual collection through a weak reference in a test scope where locals have gone out of scope. `Unload()` is initiation, not synchronous destruction.

### Solution 4

Risks include arbitrary configuration selecting unintended code, private member shape changing, overload ambiguity, `TargetInvocationException`, access/runtime restrictions, trimming removal of unreferenced members, AOT dynamic-code limitations, and reflection cost. For known handlers, use explicit registrations or a source generator that emits a dispatch table. If reflection is required, use a constrained allowlist, precise signatures, trim annotations/roots, and publish tests; avoid private implementation members. Never treat metadata as an authorization decision.

### Solution 5

Use `MetadataLoadContext` with an appropriate `MetadataAssemblyResolver` such as `PathAssemblyResolver`. Enumerate metadata types and use `CustomAttributeData` to inspect attribute declarations without loading code for execution or constructing attribute objects. This prevents attribute constructor side effects. Keep metadata-context `Type` values separate from runtime `Type` values; they are not interchangeable.

### Solution 6

Native AOT has no runtime JIT/Reflection.Emit support for arbitrary new methods, and ahead-of-time analysis cannot guarantee arbitrary types/members/generic instantiations discovered from configuration. Replace generated code with source generation or a finite precompiled strategy, replace arbitrary scanning with explicit registrations or accurately annotated patterns, and enumerate required generic instantiations at build time. Enable Native AOT analysis, resolve warnings, publish for each supported RID/architecture, and exercise the published binary with production-like configuration.

## Tests and edge cases

- Verify the actual publish layout and runtime selected for each deployment mode, not only Debug execution.
- Add plugin tests with two versions of the same dependency and assert which context/type identity is used.
- Test collectible unload after event unsubscription, task completion, and cache clearing; verify eventual weak-reference collection without assuming a fixed GC count.
- Publish trimmed and Native AOT artifacts in CI for supported targets; treat new linker/AOT warnings as behavior changes.
- Test missing type/member, overload ambiguity, constructor side effects, partial type-load failures, and target exceptions.
- Test single-file behavior when code uses `Assembly.Location` or loads adjacent resources/native libraries.

## Reflection questions

1. Is this requirement about metadata, executable behavior, dependency isolation, or security isolation?
2. Which runtime/host/IL/JIT/AOT stage is responsible for the observed result?
3. Does the plugin boundary share the same contract assembly instance?
4. What strong references must disappear before a collectible context can unload?
5. Can a known set of dynamic behaviors be made statically visible to the compiler/linker?
