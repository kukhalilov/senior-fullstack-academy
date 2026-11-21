
# CLR execution IL JIT AOT assemblies reflection attributes and loading — Reference: AssemblyLoadContext, plugin loading and unloading, trimming, ReadyToRun, and Native AOT

# Scope and version

This is the full `loading-contexts-and-deployment-modes` inventory for .NET 11. The critical boundaries are dependency identity, unload reachability, and static visibility for trimming/AOT. Sources: [AssemblyLoadContext guidance](https://learn.microsoft.com/en-us/dotnet/core/dependency-loading/understanding-assemblyloadcontext), [trimming](https://learn.microsoft.com/en-us/dotnet/core/deploying/trimming/trim-self-contained), [Native AOT](https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/), and [runtime compilation configuration](https://learn.microsoft.com/en-us/dotnet/core/runtime-config/compilation).

# How this group fits the mental model

Each `AssemblyLoadContext` maps simple assembly names to loaded assembly instances and resolves dependencies. It can isolate plugin dependency versions and provide a collectible lifetime, but it does not isolate execution or permissions. Unloading is cooperative garbage collection: every reference to plugin types, instances, delegates, reflection objects, threads, and context state must disappear. Trimming and Native AOT analyze what code is statically reachable; reflection or dynamic code that hides dependencies must be expressed or redesigned.

# Supplied names explained

| Supplied name | Meaning and practical boundary |
|---|---|
| `AssemblyLoadContext` | Runtime service for locating/loading/caching managed dependencies; separate contexts create distinct assembly/type instances and can be collectible. |
| `AssemblyLoadContext.Default` | Default context populated during startup and used for ordinary application dependencies; it is not collectible. |
| `AssemblyLoadContext.All` | Enumerates current load contexts, useful for diagnostics; enumeration does not imply every context is still usable or unloadable. |
| `AssemblyLoadContext.Name` | Optional context name for diagnostics. |
| `AssemblyLoadContext.IsCollectible` | Indicates whether the context was created with collectible support. |
| `AssemblyLoadContext.Assemblies` | Assemblies currently loaded into the context. |
| `AssemblyLoadContext.LoadFromAssemblyPath(String)` | Loads a managed assembly from an absolute file path into that context; dependency resolution follows the context's policy. |
| `AssemblyLoadContext.LoadFromAssemblyName(AssemblyName)` | Resolves/loads an assembly by identity through this context's managed load algorithm. |
| `AssemblyLoadContext.LoadFromStream(Stream)` | Loads managed assembly data from streams; optional symbol stream overload can provide symbols. The stream must contain a valid assembly image. |
| `AssemblyLoadContext.Load(AssemblyName) override` | Custom managed resolution hook. Return a compatible assembly or null to continue fallback; be repeatable, thread-safe, and avoid recursive resolution. |
| `AssemblyLoadContext.LoadUnmanagedDll(String) override` | Custom native-library resolution hook; return a valid handle or use fallback behavior, respecting native platform naming/ABI. |
| `AssemblyLoadContext.Resolving event` | Managed fallback event raised when normal resolution cannot find an assembly; handlers should not create inconsistent instances or throw for ordinary misses. |
| `AssemblyLoadContext.ResolvingUnmanagedDll event` | Native-library fallback event for unresolved unmanaged dependencies. |
| `AssemblyLoadContext.Unload()` | Initiates unloading of a collectible context; actual reclamation waits until references are gone and GC processes it. |
| `AssemblyLoadContext.Unloading event` | Notification raised when unload is initiated; use for cleanup, not as proof that the context has already disappeared. |
| `Collectible AssemblyLoadContext` | Context created as collectible, allowing eventual unload only after all roots to its contents and context are released. |
| `AssemblyDependencyResolver.ResolveAssemblyToPath` | Resolves a plugin's managed assembly dependency to a path based on the component's `.deps.json`/deployment layout. |
| `AssemblyDependencyResolver.ResolveUnmanagedDllToPath` | Resolves native plugin dependencies by component layout and RID-aware assets. |
| `Plugin contract shared assembly identity` | Host and plugin must share the same contract assembly instance/type identity (commonly loaded from Default) for interface casts to work. |
| `Plugin dependency isolation` | Separate contexts can load private dependency versions independently; dependencies intentionally shared across the boundary must use the same assembly instance. |
| `AssemblyLoadContext version unification rule` | A context loads one version per simple name; an already-loaded version can satisfy a request only when it is equal to or higher than the requested version. |
| `AssemblyLoadContext identity and duplicate type names` | Same fully qualified type name from separate assembly instances/contexts is not the same runtime type. |
| `AssemblyLoadContext is not a security sandbox` | Loaded code runs with process permissions; untrusted plugins require process/OS isolation and a security protocol. |
| `Collectible context unload requires releasing references` | Any live object, static, event delegate, reflection cache, task, or stack frame referencing plugin/context data can prevent unload. |
| `WeakReference-based unload verification` | Hold a weak reference to the context, call `Unload`, let references leave scope and trigger diagnostic GC in tests; eventual weak-reference death is evidence of collection, not synchronous guarantee. |
| `Static event root prevents plugin unload` | A default-context publisher can retain a plugin delegate/target; unsubscribe or otherwise remove the root before unloading. |
| `Thread stack root prevents plugin unload` | Active plugin frames or thread-local state can keep plugin code/types alive; stop/join plugin work before unloading. |
| `Unmanaged dependency loading callback` | Context hook resolves native libraries; native handles/lifetimes and OS loader rules remain separate from managed assembly resolution. |
| `Managed dependency resolution order` | Runtime considers the context cache, load override, default-context sharing and fallback/resolving mechanisms according to the documented algorithm; do not rely on arbitrary directory probing. |
| `Satellite assembly loading context` | Culture-specific resources are resolved through load-context/resource rules, often associated with the assembly's context. |
| `AssemblyLoadContext versus AppDomain` | ALC handles dependency isolation/unloading in modern .NET; it does not provide AppDomain remoting or process-like isolation. |
| `AssemblyLoadContext versus MetadataLoadContext` | ALC loads executable runtime assemblies; MetadataLoadContext loads metadata for inspection without executing the code. |
| `Assembly loading event diagnostics` | Runtime events can reveal load requests, successes, failures, and contexts; correlate with actual assembly identities and paths. |
| `dotnet-trace assembly loader events` | EventPipe trace can capture loader events for runtime diagnosis; provider/event settings and runtime version affect detail. |
| `IL trimming` | Publish-time linker removes code/metadata considered unreachable; dynamic reflection can hide dependencies and produce warnings. |
| `PublishTrimmed MSBuild property` | Enables trimming during publish for supported project/deployment modes; test publish output and resolve warnings. |
| `Trimmer analysis warnings` | Diagnostics report patterns where trimming may break behavior; treat warnings as actionable compatibility contracts. |
| `Reflection trimming warning IL2026` | Warning associated with calling an API marked `RequiresUnreferencedCode`; it says trimming may invalidate behavior, not that it always will. |
| `DynamicallyAccessedMembersAttribute trimming contract` | Annotates a type value/parameter/return so specific categories of members are preserved; annotations must flow through the full data path. |
| `DynamicDependencyAttribute trimming root` | Explicitly preserves selected types/members for linker analysis when dependencies are otherwise hidden. |
| `Trimming incompatible reflection patterns` | String-based discovery, arbitrary assembly scans, and private-member inspection may be impossible for static analysis to preserve reliably. |
| `ReadyToRun publish property PublishReadyToRun` | Enables ReadyToRun compilation at publish for a target; increases output size and does not remove JIT fallback. |
| `PublishAot MSBuild property` | Enables Native AOT publish and dynamic-code analysis; output targets a RID/architecture and requires supported native tooling. |
| `Native AOT dynamic code restriction` | Runtime code generation is unsupported; designs using `Reflection.Emit`/dynamic compilation need an alternative. |
| `Native AOT reflection limitations` | Reflection is available in constrained forms, but dynamically discovered members may be trimmed and need statically analyzable preservation. |
| `Native AOT generic instantiation requirements` | AOT must compile required generic native instantiations ahead of time; arbitrary runtime-created instantiations may not be available. |
| `Native AOT analyzer warnings` | Build analyzers identify dynamic-code/trimming incompatibilities; resolve or deliberately suppress only with verified reasoning. |
| `RuntimeFeature.IsDynamicCodeSupported fallback` | Branches to a supported alternative when runtime code generation is unavailable; it does not guarantee reflected metadata was retained. |
| `Cross-platform runtime identifier publish output` | Publish using a specific RID and validate on that environment; native dependencies, ABI, and OS version constrain portability. |
| `Single-file bundle assembly loading constraints` | Bundling changes file-layout assumptions and can affect assembly paths/native extraction; test plugin/resource loading in the published bundle. |

# Cross-item comparison

| Option | Provides | Does not provide |
|---|---|---|
| `AssemblyLoadContext` | Dependency resolution scope, type identity boundary, optional collectible lifetime. | Security isolation or automatic unloading despite live references. |
| `MetadataLoadContext` | Metadata inspection without executing target code. | Runtime types that can be cast/invoked in the host context. |
| IL trimming | Smaller deployment by removing statically unreachable code. | Correctness for arbitrary hidden reflection unless dependencies are described. |
| ReadyToRun | Precompiled native code for faster startup potential. | Guaranteed absence of JIT or target independence. |
| Native AOT | Target-specific native publish without runtime JIT. | Unrestricted dynamic code or runtime-created generic instantiations. |

# Examples

```csharp
using System;
using System.IO;
using System.Reflection;
using System.Runtime.Loader;

sealed class PluginLoadContext(string pluginPath) : AssemblyLoadContext(isCollectible: true)
{
    private readonly AssemblyDependencyResolver _resolver = new(pluginPath);

    protected override Assembly? Load(AssemblyName name)
    {
        string? path = _resolver.ResolveAssemblyToPath(name);
        return path is null ? null : LoadFromAssemblyPath(path);
    }
}
```

This illustrates managed dependency resolution only. A production plugin loader must also define which contract assembly is shared, how native dependencies resolve, how plugin threads/events are stopped, and how all references are released before `Unload`. ALC is not suitable for executing untrusted code safely.

# Common mistakes

- Returning a new copy of the shared contract assembly into the plugin context and then wondering why interface casts fail.
- Calling `Unload` while a plugin instance, delegate, reflection object, task, static, or stack frame still references the context.
- Assuming an unloading event means the context has already been collected.
- Using ALC as a security sandbox.
- Suppressing trimming/AOT warnings without proving preservation or runtime behavior.
- Assuming `RuntimeFeature.IsDynamicCodeSupported` proves a reflection target survived trimming.
- Testing JIT behavior in Debug and inferring Native AOT publish behavior.
- Treating RID-specific output as universally portable.

# Knowledge checks with answers

1. **What does one ALC allow per simple assembly name?** One loaded assembly version; a loaded equal-or-higher version can satisfy a request under the version rule.
2. **Why can a plugin unload fail to complete?** Some strong reference remains, often an event handler, static cache, task, or active stack frame.
3. **Is ALC an isolation boundary for hostile plugins?** No; use a process/OS security boundary.
4. **What is the difference between `Unload()` and actual reclamation?** `Unload` initiates unload; GC can reclaim the collectible context only after references are released.
5. **Why can Native AOT reject or break dynamic reflection code?** Code and generic instantiations must be available ahead of time, and trimming can remove members not statically described.
