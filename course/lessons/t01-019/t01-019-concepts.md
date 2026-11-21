
# CLR execution IL JIT AOT assemblies reflection attributes and loading — Core concepts and how they fit together

## Learning objectives

Explain the source-to-execution pipeline; distinguish IL, metadata, assemblies, runtime, host, and native code; compare JIT, tiered compilation, ReadyToRun, and Native AOT; reason about assembly identity and load-context type identity; and identify reflection/trimming/AOT risks. Sources: [runtime compilation configuration](https://learn.microsoft.com/en-us/dotnet/core/runtime-config/compilation), [assembly loading](https://learn.microsoft.com/en-us/dotnet/core/dependency-loading/understanding-assemblyloadcontext), and [Native AOT deployment](https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/).

## Prerequisites

You should know basic C# compilation, project files, package references, and application publishing. This lesson focuses on runtime behavior and deployment boundaries, not the full MSBuild or interop surface.

## Core concepts

### IL, metadata, and assemblies

The compiler translates source into Common Intermediate Language (CIL/IL) plus metadata. Metadata describes types, members, references, attributes, and other information the runtime and tools need. An assembly is a logical deployment/identity unit that commonly packages IL, metadata, and resources; the exact files in a deployment vary by mode. IL is not native machine code and is not itself a guarantee that every runtime or platform can execute every dependency.

The Common Type System defines runtime type concepts shared by .NET languages. The Common Language Specification is a subset-oriented interoperability contract for languages; it is not the entire CTS. “Managed code” means code executed under runtime services and rules, not that the runtime prevents every unsafe or interop error. Native/unmanaged code runs outside those managed guarantees.

### Host, runtime, and loading

The native `dotnet` host and runtime host components select a runtime and start the application. Runtime selection depends on deployment configuration and installed/shared or bundled runtime assets. A Runtime Identifier (RID) describes a target platform/architecture asset graph used for restore/publish; it does not by itself make output universally portable.

An `AssemblyLoadContext` provides managed dependency locating, loading, and caching. Within one context, only one version per simple assembly name is loaded; a request can be satisfied by an already-loaded equal-or-higher version under the documented rule. Different contexts can load conflicting dependency versions, but context separation is not binary isolation or a security boundary. A type's runtime identity includes its defining assembly instance/context, so equal textual names are not enough for assignment compatibility.

### JIT and ahead-of-time choices

With JIT, IL is compiled to machine code as methods are needed. Per-method compilation spreads startup cost and enables runtime-specific optimizations. Tiered compilation can begin with Quick JIT or available ReadyToRun code, then compile hot methods at an optimizing tier. Dynamic PGO can use runtime profile information to improve decisions. These are optimization mechanisms, not promises of a particular speedup or instruction sequence.

ReadyToRun stores precompiled native code in assemblies to improve startup, but it can fall back to JIT when code is unavailable or runtime conditions require it. Native AOT compiles at publish time for a particular target and does not use a JIT at runtime. It can reduce startup and remove the runtime installation requirement, while restricting dynamic code and increasing the need for statically discoverable dependencies. Target OS, architecture, native toolchain, globalization, and library compatibility matter.

Framework-dependent deployment selects a compatible installed runtime. Self-contained deployment includes runtime components for a target RID. Single-file is a packaging form, not a guarantee that all files disappear or that reflection and native dependencies behave exactly like a loose-file layout. Inspect `Assembly.Location` and resource/dependency behavior carefully in bundled apps.

### Reflection and attributes

Reflection inspects runtime `Type`, member, parameter, and custom-attribute metadata. It can invoke methods and create types, but dynamic invocation has overhead and failure modes such as ambiguous lookup, accessibility, invalid arguments, and wrapped target exceptions. Attribute instances are created when retrieved as attributes; `CustomAttributeData` can inspect encoded metadata without constructing attribute objects.

Attributes are declarations, not automatic behavior: a framework, compiler, analyzer, or application must consume them. Attribute metadata is not a security boundary. Trimming removes code/metadata that static analysis considers unused; dynamic string-based reflection can hide dependencies. Annotations such as `DynamicallyAccessedMembers`, `DynamicDependency`, and warning attributes express preservation/compatibility contracts. Source generation or explicit registration can make known dependencies visible to the build.

`MetadataLoadContext` inspects assemblies as metadata without executing their code. Types obtained from it are metadata-context types and cannot be treated as the runtime `Type` instances of the executing application. Dispose the context when finished.

## Mechanisms and relationships

```text
source → compiler → IL + metadata → host selects runtime → loader resolves assemblies
                                              │
                          reflection reads metadata / attributes are consumed
                                              │
                       JIT now ─ ReadyToRun partly early ─ Native AOT at publish
                                              │
                    trimming and deployment mode constrain dynamic discovery
```

Use the following sequence to diagnose a behavior:

1. Identify the output actually published: RID, framework-dependent/self-contained, single-file, trimmed, ReadyToRun, or AOT.
2. Determine which runtime and load context loaded the assembly; compare assembly identity and actual type identity, not only names.
3. Separate metadata inspection from code execution. Reflection and `MetadataLoadContext` have different purposes.
4. If code is missing, inspect trim/AOT warnings and preservation contracts before changing runtime loader behavior.
5. For performance, measure cold startup and steady-state separately; JIT/tiering and profile warmup change results.

## Worked examples

### Same type name, different context

Suppose plugin A and plugin B each load their own copy of `Contracts.dll` into separate collectible contexts. Each can define a type whose full name is `Contracts.IPlugin`, yet the runtime sees separate type identities because the defining assembly instances differ. Passing an object across the boundary and casting it to the host's interface can fail. A common plugin design shares one contract assembly from the default context while isolating each plugin's private dependencies.

### Reflection and trimming

If code asks for `assembly.GetType(nameFromConfig)` and then invokes a member by string, a trimmer may not see that dependency. A publish warning signals that static analysis cannot prove the required member is kept. Fix the contract with supported annotations or explicit metadata roots, or use source-generated/explicit registration. Test the trimmed/AOT published artifact because a development run does not exercise the same removal decisions.

## Misconceptions and edge cases

- “IL is interpreted.” Modern .NET commonly JIT-compiles IL; deployment modes can provide precompiled or ahead-of-time native code.
- “JIT compiles the whole program once.” Compilation is generally method-oriented and tiered; methods can be recompiled.
- “ReadyToRun means no JIT.” Runtime fallback can still JIT code.
- “A Native AOT executable is portable.” It targets a runtime environment/RID and architecture and can require platform dependencies.
- “Same namespace and type name means same type.” Defining assembly identity/load context matters.
- “An attribute does something by itself.” A consumer must interpret it.
- “Reflection works identically after trimming/AOT.” Dynamically discovered code/metadata may not be present or dynamic code may be unsupported.
- “AssemblyLoadContext is a sandbox.” It controls dependency loading and type identity, not malicious-code isolation.
- “Single-file means `Assembly.Location` is always a useful path.” Bundled assemblies may not have ordinary individual file paths.

## Knowledge checks with answers

1. **What does an ordinary managed assembly contain conceptually?** IL, metadata, references, and often resources; deployment forms can add or replace native code.
2. **What is one important difference between ReadyToRun and Native AOT?** ReadyToRun can fall back to JIT; Native AOT produces target-specific native output without runtime JIT.
3. **Why can two identically named types fail a cast?** They may come from different assembly instances/load contexts.
4. **What is `MetadataLoadContext` for?** Inspecting assembly metadata without executing the assembly's code.
5. **Why does trimming affect reflection?** The trimmer may not infer members referenced only dynamically, so they can be removed unless preservation is expressed.
