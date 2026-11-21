
# CLR execution IL JIT AOT assemblies reflection attributes and loading — Big-picture orientation and mental model

## Problem and purpose

When C# code runs, source does not normally become a CPU instruction stream in one direct step. The SDK compiler produces an assembly containing metadata and intermediate language. A runtime host selects and starts a runtime; the CLR loads types and dependencies, provides services such as garbage collection and exception handling, and compiles or executes methods. Reflection and attributes expose metadata at runtime or to build-time tools. Deployment modes move work between build and startup, changing tradeoffs and which dynamic behaviors are available.

This topic helps you reason about that pipeline rather than treating “the compiler,” “the runtime,” “the assembly,” and “the JIT” as one thing. It also covers the boundaries that matter for plugins, trimming, single-file publishing, ReadyToRun, and Native AOT.

## Plain-language mental model

Think of a .NET program as a recipe in a sealed package. The C# compiler writes a portable set of instructions (IL) plus a detailed catalog (metadata) into assemblies. The host chooses a compatible runtime and configuration. The CLR loads dependencies, creates runtime types, enforces managed execution rules, and supplies services. When a method is needed, the JIT can translate its IL to machine code. Tiered compilation may first produce code quickly and later optimize hot methods using observations. ReadyToRun stores some native code in advance but can fall back to JIT. Native AOT compiles ahead to a platform-specific native executable and removes runtime JIT as an assumption.

The package's **assembly identity** is not the same as its file name. The **load context** determines dependency resolution and participates in runtime type identity. Two types with the same namespace and name loaded from different contexts can still be different runtime types. Reflection reads runtime metadata and can invoke members; attributes are declarative metadata that a consumer interprets. Both can become constrained by trimming and AOT because code or metadata not statically visible may be removed or unavailable.

## How the parts fit together

1. **Build:** C# and other managed compilers produce IL and metadata in assemblies; resource files and deployment metadata describe dependencies and configuration.
2. **Host:** `dotnet` and native hosting components select the app/runtime, runtime identifier, and framework-dependent or self-contained deployment assets.
3. **Load:** the runtime uses an `AssemblyLoadContext` to locate/cache dependencies and create type identities. The default context covers normal application dependencies; custom contexts support dependency isolation and plugin lifetimes.
4. **Execute:** the CLR initializes types and applies runtime services. JIT, ReadyToRun, and Native AOT determine when native code becomes available.
5. **Inspect and extend:** reflection examines metadata at runtime; attributes feed frameworks, analyzers, and source generators. Dynamic code and reflection need explicit consideration for trimming/AOT.
6. **Deploy:** framework-dependent, self-contained, single-file, ReadyToRun, and Native AOT builds make different size, startup, portability, runtime-installation, and dynamic-code choices.

## Concept map

```text
C# source ── SDK/compiler ──> assembly = IL + metadata + resources
                                     │
                      host/runtime selection + dependency graph
                                     │
                  AssemblyLoadContext resolves and identifies types
                                     │
                CLR services ── execution strategy ──> machine code
                                 JIT / ReadyToRun / Native AOT
                     │                                  │
              reflection + attributes          trimming/deployment limits
```

## End-to-end walkthrough

For a conventional framework-dependent app, `dotnet` reads deployment/runtime configuration, selects an installed compatible runtime, and starts the app. The runtime loads the entry assembly and resolves referenced assemblies through the default load context. When execution reaches a method without usable precompiled code, the JIT compiles it. With tiered compilation, fast initial code can later be replaced by optimized code. Reflection can discover a plugin type only if the required assembly and metadata remain available.

If the same app is trimmed, the publish tool removes code it cannot prove is needed. Reflection by a string name may therefore require preservation metadata, annotations, or a source-generated alternative. If published as Native AOT, code is compiled for a selected RID and architecture ahead of time; runtime dynamic-code generation is unavailable, and reflection patterns need AOT analysis. These are build/deployment decisions that should be tested on the actual published artifact, not inferred from a debug run.

## When to use it and tradeoffs

- Choose ordinary JIT deployment when broad runtime flexibility and dynamic features matter.
- Use ReadyToRun when startup matters and measured publish size/startup tradeoffs are acceptable; available precompiled code can still fall back to JIT.
- Use Native AOT when a target-specific self-contained native executable and predictable startup footprint are valuable, and the app's reflection/dynamic-code patterns are compatible.
- Use reflection for genuinely dynamic inspection or discovery; use explicit registration/source generation when the set of types is known and trimming/AOT predictability matters.
- Use collectible `AssemblyLoadContext` for plugin dependency lifetime isolation only when plugin references can be released. It is not a security sandbox.

The exact host, loader, compiler, and deployment settings evolve. For example, tiered compilation and ReadyToRun behavior are runtime configuration choices; Native AOT is target-specific. Check the published output and official documentation for the target release. See [runtime compilation configuration](https://learn.microsoft.com/en-us/dotnet/core/runtime-config/compilation), [assembly loading contexts](https://learn.microsoft.com/en-us/dotnet/core/dependency-loading/understanding-assemblyloadcontext), and [Native AOT deployment](https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/).

## What later lessons cover

The concepts lesson explains IL, metadata, runtime hosting, type identity, and code-generation choices in sequence. Reference units enumerate CLR execution, assembly/dependency metadata, reflection, attributes, and loading/deployment APIs. Practice builds a plugin/inspection scenario and diagnoses trimming/AOT constraints. The interview lesson focuses on runtime pipeline, load-context identity, and deployment tradeoffs.
