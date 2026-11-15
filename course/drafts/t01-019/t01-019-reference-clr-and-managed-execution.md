<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CLR execution IL JIT AOT assemblies reflection attributes and loading — Reference: CLR services, IL, metadata, compilation stages, type loading, and runtime execution

# Scope and version

This reference explains every item in `clr-and-managed-execution` for .NET 11 and C# 15 stable. The source snapshot is the topic manifest; see Microsoft's [runtime compilation configuration](https://learn.microsoft.com/en-us/dotnet/core/runtime-config/compilation), [Native AOT guide](https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/), and [dependency loading overview](https://learn.microsoft.com/en-us/dotnet/core/dependency-loading/overview).

# How this group fits the mental model

The CLR is the execution environment and service provider. A compiler emits IL and metadata into assemblies; the host starts a compatible runtime; the loader resolves dependencies; JIT/AOT strategy produces machine code; runtime services manage type initialization, exceptions, memory, threads, and interop. The deployment configuration determines which components are supplied and which dynamic operations remain available.

# Supplied names explained

| Supplied name | Meaning and practical boundary |
|---|---|
| `Common Language Runtime (CLR)` | The .NET execution environment that loads managed code and provides services such as GC, exceptions, type loading, and threading. |
| `CoreCLR` | The open-source runtime implementation used by modern .NET for general-purpose managed execution; it is not the SDK or host executable. |
| `Managed execution` | Execution under CLR services and managed type/lifetime rules; unsafe code and native interop can still violate memory or contract assumptions. |
| `Managed code` | Code compiled for and executed by a managed runtime, commonly IL plus metadata before native compilation. |
| `Unmanaged code` | Native code not governed by CLR-managed execution rules; interop boundaries require explicit ABI, ownership, and error handling. |
| `Common Intermediate Language (CIL)` | Standardized stack-based intermediate instruction representation emitted by managed compilers. |
| `Intermediate Language (IL)` | Common shorthand for CIL instructions stored in an assembly; runtime usually JIT-compiles methods as needed. |
| `IL instruction stream` | Ordered method-body instructions and operands; reading IL helps inspect compiler output but does not show final optimized machine code. |
| `Common Type System (CTS)` | Runtime type rules that support interoperable types across .NET languages. |
| `Common Language Specification (CLS)` | A language-interoperability subset convention; a public library can follow it to be usable from more CLS-compliant languages. |
| `Metadata tables` | Structured assembly records describing types, members, references, signatures, attributes, and related symbols. |
| `Assembly manifest metadata` | Assembly-level identity, referenced assemblies, files/resources, and version information stored in metadata. |
| `Method metadata` | Method signature, flags, parameters, and relationship to an IL/native body; does not itself contain runtime execution state. |
| `Type metadata` | Describes a type's identity, base type, interfaces, members, generic parameters, and attributes. |
| `IL verification` | A safety analysis that checks IL's structural/type-stack rules; modern runtime trust and verification behavior is not identical to a blanket guarantee that all code is safe. |
| `IL verification versus runtime type safety` | Verification checks IL properties; runtime type safety also depends on runtime enforcement, unsafe code, interop, and trusted execution assumptions. |
| `Just-in-time compilation (JIT)` | Converts IL to target machine code at runtime, usually as methods are needed. |
| `JIT compilation per method` | Methods can be compiled when first invoked rather than compiling the entire assembly upfront; generic instantiations and runtime conditions can affect generated code. |
| `Tiered compilation` | Begins with fast code or precompiled code and can later replace hot methods with more optimized JIT code. |
| `Quick JIT` | Prioritizes fast initial compilation over optimization for eligible methods; startup may improve while early code runs less efficiently. |
| `Optimizing JIT tier` | Later compilation tier applies more optimization to methods that become hot. |
| `Dynamic profile-guided optimization` | Uses runtime-observed profiles to guide optimization; behavior is version/runtime dependent and should be measured. |
| `ReadyToRun compilation` | Publishes precompiled native code alongside managed metadata/IL for faster startup; runtime can fall back to JIT. |
| `Crossgen2` | .NET toolchain component used to produce ReadyToRun images and related cross-target compilation work. |
| `Ahead-of-time compilation` | Compiles code before execution; general term covering options with different runtime and portability properties. |
| `Native AOT` | Publish-time compilation to target-specific native code without runtime JIT; dynamic code and some reflection patterns are constrained. |
| `NativeAOT MSBuild property` | `<PublishAot>true</PublishAot>` enables Native AOT publish and related analysis; publish for a specific RID and toolchain. |
| `RuntimeFeature.IsDynamicCodeSupported` | Reports whether the runtime supports generating dynamic code; use it to select a supported fallback. |
| `RuntimeFeature.IsDynamicCodeCompiled` | Reports whether dynamic code is compiled by the runtime; distinct from merely being supported. |
| `Reflection.Emit dynamic code` | Runtime API family for generating assemblies/types/methods dynamically; availability and behavior depend on runtime/deployment, notably Native AOT. |
| `Dynamic code and trimming compatibility` | Dynamically generated or discovered members may be invisible to static analysis; use annotations, explicit roots, or generated code and address warnings. |
| `AssemblyLoadContext type identity` | A type is tied to its defining assembly instance; same textual name loaded in different contexts may be a different runtime type. |
| `Garbage collector runtime service` | Finds unreachable managed objects and reclaims managed heap memory; it does not deterministically close external resources. |
| `Exception handling runtime service` | Runtime implements exception propagation, stack unwinding, and cleanup semantics for managed execution. |
| `Thread-pool runtime service` | Shared scheduler infrastructure for many tasks and callbacks; a task is not a dedicated thread. |
| `Interop runtime service` | Runtime facilities marshal or bridge managed/native calls; ABI, ownership, pinning, and platform constraints remain explicit. |
| `CLR startup and runtime host` | Native host components locate/select/start a runtime before managed entry-point execution. |
| `dotnet host` | CLI/native muxer used to run SDK commands and framework-dependent apps; it selects among installed SDKs/runtimes according to configuration. |
| `hostfxr` | Native host component that resolves framework/runtime configuration and initializes the selected runtime. |
| `hostpolicy` | Native host component that applies app/deployment policy and locates managed application components. |
| `Runtime Identifier (RID)` | Target platform/architecture identifier used to select runtime/package assets; it is not a guarantee of cross-platform binary portability. |
| `Framework-dependent deployment runtime selection` | App uses a compatible runtime installed on the target machine, subject to framework roll-forward policy. |
| `Self-contained deployment runtime selection` | Publish output includes runtime components for a chosen target; it is still target-specific and needs security/runtime servicing through republish. |
| `Single-file application deployment` | Packages app components into a bundle for distribution; native dependencies and some files may still be extracted or separately required. |
| `Native AOT platform and architecture restriction` | Native AOT output targets a specific platform/RID/architecture and can require native compiler/linker dependencies. |
| `Managed runtime versus native executable` | A managed assembly normally needs a CLR; Native AOT output is native executable code with a reduced runtime component rather than runtime JIT. |
| `ReadyToRun fallback to JIT` | If usable precompiled code is missing or not applicable, runtime can compile IL with JIT. |
| `Tiered PGO and dynamic optimization` | Profile-guided runtime optimization can improve hot code but introduces warm-up and workload-dependence. |
| `JIT disassembly diagnostics` | Specialized diagnostics expose generated machine code for investigation; disassembly is runtime/architecture/configuration specific. |
| `DOTNET_JitDisasm environment variable` | Runtime diagnostic setting that filters and prints JIT disassembly for selected methods; use diagnostic builds carefully because output is verbose. |
| `Runtime compilation configuration` | Runtimeconfig, MSBuild, and environment settings can alter tiered compilation, Quick JIT, ReadyToRun, and dynamic-code support. |

# Cross-item comparison

| Strategy | Compilation timing | Key tradeoff |
|---|---|---|
| JIT | At runtime as methods are needed | Flexible and runtime-aware; pays compilation/warmup costs. |
| ReadyToRun | Some code during publish, some possibly at runtime | Faster startup potential with larger output and JIT fallback. |
| Native AOT | At publish for selected target | No runtime JIT and target-specific native output; dynamic-code constraints and toolchain requirements. |
| Framework-dependent | Runtime selected on target | Smaller deployment; target must have compatible runtime. |
| Self-contained | Runtime included for target | More complete distribution; still requires target-specific servicing/publishing. |

# Examples

For a normal deployment, measure cold startup separately from steady-state throughput because JIT/tiering costs change over time. To publish Native AOT, set `PublishAot` in the project, publish for a RID, and treat AOT/trimming analyzer warnings as compatibility findings. To inspect runtime-generated code, use JIT diagnostics on a controlled reproduction rather than assuming IL is the executed instruction sequence.

# Common mistakes

- Calling IL native code, or assuming source maps one-to-one to machine instructions.
- Treating verification as proof against unsafe/interop defects.
- Assuming ReadyToRun eliminates JIT or Native AOT is portable across RIDs.
- Treating `RuntimeFeature.IsDynamicCodeSupported` as proof that a particular reflection member survived trimming.
- Assuming framework-dependent and self-contained runtime servicing are the same operational process.
- Making performance claims from one cold run without accounting for tiered compilation and PGO.

# Knowledge checks with answers

1. **What is the relationship between IL and JIT?** IL is the intermediate method representation; JIT translates methods into target machine code at runtime.
2. **Can ReadyToRun fall back to JIT?** Yes.
3. **Does Native AOT use runtime JIT?** No; it compiles at publish for a target, with dynamic-code restrictions.
4. **Does a RID make one binary universal?** No; it selects target-specific assets.
5. **What does tiered compilation change?** Methods can move from quickly produced/precompiled code to later optimized code.
