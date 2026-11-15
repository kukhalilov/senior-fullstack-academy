<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CLR execution IL JIT AOT assemblies reflection attributes and loading — Interview questions and reasoning

## Core questions

1. What is the path from C# source to executing machine code?
2. What are IL and metadata, and what does the CLR do?
3. How do JIT, tiered compilation, ReadyToRun, and Native AOT differ?
4. What is the difference between assembly identity and file name?
5. Why can equal full type names fail an `is` or cast check?
6. How does `AssemblyLoadContext` help plugin architectures?
7. Why is `AssemblyLoadContext` not a security sandbox?
8. What prevents a collectible load context from unloading?
9. How can trimming break reflection-based code?
10. When would you use `MetadataLoadContext`?

Sources: Microsoft's [assembly-loading guidance](https://learn.microsoft.com/en-us/dotnet/core/dependency-loading/understanding-assemblyloadcontext), [metadata inspection guide](https://learn.microsoft.com/en-us/dotnet/standard/assembly/inspect-contents-using-metadataloadcontext), and [Native AOT documentation](https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/).

## Concise interview answers

1. The SDK/compiler emits assemblies with IL and metadata; the host selects a runtime; the loader resolves dependencies; methods run from ReadyToRun code or are JIT-compiled, unless published as Native AOT.
2. IL is intermediate method instructions; metadata describes types/members/references. The CLR loads/executes managed code and supplies GC, exceptions, type loading, threading, and interop services.
3. JIT compiles at runtime; tiering can replace quick code with optimized code; ReadyToRun includes precompiled code but can fall back to JIT; Native AOT compiles target-specific native output at publish and has no runtime JIT.
4. File name is a filesystem label. Assembly identity is structured metadata such as name/version/culture/key; loading context and assembly instance also affect runtime type identity.
5. They may be defined by different assembly instances loaded in separate contexts; names alone do not establish runtime identity.
6. It provides separate dependency resolution/caching scopes and optional collectible lifetimes for plugin dependencies.
7. Code still runs with the process's permissions and can access process resources; security isolation needs an OS/process boundary.
8. Any strong reference to context assemblies/types, instances, delegates, reflection objects, active frames, tasks, or callbacks can keep it alive.
9. The linker may not see members used only by dynamic strings/reflection and can remove them unless a preservation contract or static reference makes them visible.
10. For inspecting assembly metadata without executing the inspected code, often alongside `CustomAttributeData`.

## Deep follow-up answers

### How do you distinguish an assembly from an `AssemblyLoadContext`?

An assembly carries metadata identity and executable/resource content. A load context is a runtime resolution/cache scope that maps simple names to actual assembly instances. Multiple contexts can host assemblies with the same name, producing distinct types. The context is not the package, process, or security boundary.

### What is the difference between ReadyToRun and Native AOT?

ReadyToRun puts native code into publish output for faster startup while retaining IL/runtime flexibility and possible JIT fallback. Native AOT compiles code ahead for a specific target and does not use a runtime JIT. It can improve startup and reduce runtime dependencies but restricts dynamic code and makes trim/AOT compatibility important. Test the actual target artifact and consider size, native toolchain, globalization, and servicing.

### How would you design a plugin contract?

Define a small stable interface assembly shared from the default context. Load plugin implementation/private dependencies in a separate ALC using `AssemblyDependencyResolver`. Define version compatibility, native dependency handling, cancellation/shutdown, and error boundaries. If unload is required, prohibit long-lived host references and clean events/tasks/threads/caches. Execute untrusted plugins in a separate process with OS-level controls.

### How do you diagnose failed type discovery?

Determine whether the assembly loaded, the expected metadata exists in the published artifact, and which load context created the type. Inspect `ReflectionTypeLoadException.LoaderExceptions`, assembly dependency graph, trim/AOT warnings, and actual runtime IDs. Check overload and name format. Separate metadata-only `Type` objects from runtime `Type` objects.

### What is the role of attributes in trimming?

Attributes provide machine-readable declarations to consumers. `DynamicallyAccessedMembers` describes member requirements flowing through type values; `DynamicDependency` roots a known dependency; `RequiresUnreferencedCode` warns callers that trimming may break behavior; `RequiresDynamicCode` marks runtime code-generation requirements. These are contracts that must be accurate and tested, not blanket suppression.

## Scenario questions

### Scenario: A plugin loads but interface cast fails

Ask whether host and plugin share the exact contract assembly instance. Inspect load contexts and assembly identities. Load the shared contract from Default and resolve only plugin-private dependencies in the collectible context.

### Scenario: Plugin unload never completes

Check object/delegate/reflection caches, static event handlers, active tasks/threads/stacks, timers, native callbacks, and exception references. Stop/cancel and await work, unsubscribe, clear roots, call `Unload`, and verify eventual collection with a weak reference.

### Scenario: Reflection works locally but fails in published output

Check trimming, Native AOT, single-file, and RID configuration. Review linker/AOT warnings, member preservation annotations, dynamic-code requirements, and assembly path assumptions. Reproduce against the exact published artifact.

### Scenario: Cold startup is slow

Separate host/runtime startup, dependency loading, JIT, tiering, and application initialization. Measure cold and steady state. Evaluate ReadyToRun or Native AOT against size, portability, dynamic-code, and maintenance requirements instead of assuming compilation mode alone is the bottleneck.

## Tradeoffs and alternatives

- **JIT / ReadyToRun / Native AOT:** flexibility and runtime optimization versus faster startup/precompilation and target/dynamic-code constraints.
- **Reflection / source generation:** open-ended discovery versus static visibility, faster direct calls, and improved trim/AOT predictability.
- **Runtime `AssemblyLoadContext` / `MetadataLoadContext`:** executable plugin loading versus safe metadata inspection without execution.
- **In-process plugin / separate process:** low-cost calls and shared process state versus stronger fault/security isolation.
- **Framework-dependent / self-contained:** smaller deployment relying on installed runtime versus bundled runtime for a chosen target.

## Common weak answers

- “The C# compiler produces machine code.” For the usual JIT path, it produces IL/metadata first.
- “ReadyToRun is AOT so JIT is gone.” ReadyToRun can fall back to JIT.
- “A strong name makes an assembly trusted.” Strong naming is not a security sandbox or publisher trust system.
- “ALC isolates plugins securely.” It isolates dependency resolution/type identity, not process permissions.
- “Call `Unload()` and it unloads immediately.” Reclamation requires all references to become unreachable and GC to run.
- “The linker can see reflection.” Dynamic strings and scans can hide dependencies; follow trim warnings and preserve required members.
- “Native AOT is the fastest mode.” Performance depends on workload, target, startup, throughput, and dynamic-code requirements.

## Self-check rubric

Score each from 0 (cannot explain) to 2 (clear and accurate with a tradeoff):

1. Traces source, IL, metadata, host, loader, and execution stages.
2. Distinguishes JIT, tiered compilation, ReadyToRun, and Native AOT.
3. Explains assembly and type identity across load contexts.
4. Designs plugin resolution/shutdown and explains unload roots.
5. Identifies reflection/trimming/AOT compatibility boundaries.
6. Selects runtime deployment and diagnostics based on measured requirements.

10–12: ready to explain runtime/deployment decisions; 7–9: revisit loading and trim contracts; 0–6: redo the exercises before relying on memorized tool names.
