<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CLR execution IL JIT AOT assemblies reflection attributes and loading — Reference: Assembly files, identity, references, resources, dependency graphs, and deployment metadata

# Scope and version

This lesson covers every name in `assemblies-metadata-and-dependencies`. It focuses on modern .NET assembly identity and deployment metadata; .NET Framework-only GAC behavior is explicitly separated. Sources: [assembly concepts](https://learn.microsoft.com/en-us/dotnet/standard/assembly/), [Assembly API](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.assembly), and [dependency loading](https://learn.microsoft.com/en-us/dotnet/core/dependency-loading/overview).

# How this group fits the mental model

An assembly is both metadata identity and a unit used by the loader/deployment graph, but an assembly's file name is not its full identity and its identity alone does not determine every runtime binding decision. Attributes describe assembly/build metadata; `.deps.json`, runtime configuration, package assets, and the load context help the host resolve runtime files. Resource lookup can cross into satellite assemblies. Inspect metadata using APIs, but account for single-file bundles and assemblies that have no ordinary file location.

# Supplied names explained

| Supplied name | Meaning and practical boundary |
|---|---|
| `Assembly` | Runtime representation of a loaded managed assembly; it exposes identity, types, references, modules, and resources. |
| `AssemblyName` | Structured assembly identity object, including name, version, culture, and public key/token information. |
| `AssemblyName.Name` | Simple name component used in dependency matching within a load context; not a unique file path. |
| `AssemblyName.Version` | Version component of assembly identity; modern .NET dependency resolution is not the old .NET Framework binding-redirect system. |
| `AssemblyName.CultureName` | Culture identity, often relevant to satellite resource assemblies; neutral assemblies commonly have no specific culture. |
| `AssemblyName.GetPublicKeyToken()` | Returns the token derived from an assembly public key when present; token is an identity aid, not proof that a file is trusted. |
| `Assembly identity` | Structured identity usually including simple name, version, culture, and public key token; actual type identity also depends on the loaded assembly instance/context. |
| `Simple assembly name` | The name portion excluding version/culture/key; used as a cache key in an `AssemblyLoadContext`. |
| `Versioned assembly reference` | Metadata reference to an assembly with identity constraints; runtime resolution policy and load context determine the actual result. |
| `Strong-named assembly` | Assembly signed with a strong-name key for identity/integrity scenarios; strong naming alone is not a security or publisher-trust guarantee. |
| `Public key token` | Short identifier derived from the public key and commonly shown in assembly identity strings. |
| `AssemblyVersionAttribute` | Sets assembly version identity recorded in manifest; library authors often manage it separately from file/product version. |
| `AssemblyFileVersionAttribute` | Sets informational file version metadata, typically used by file/version tools; it does not define assembly binding identity. |
| `AssemblyInformationalVersionAttribute` | Product/informational version string, which can include labels beyond numeric assembly version. |
| `AssemblyCompanyAttribute` | Declares company metadata for tooling/display; not runtime identity or proof of publisher. |
| `AssemblyProductAttribute` | Declares product metadata for tooling/display. |
| `AssemblyTitleAttribute` | Declares a display title for the assembly. |
| `AssemblyDescriptionAttribute` | Declares descriptive metadata. |
| `AssemblyCopyrightAttribute` | Declares copyright text metadata. |
| `AssemblyCultureAttribute` | Declares culture metadata for an assembly, commonly used for satellite assemblies; most main assemblies are neutral. |
| `AssemblyConfigurationAttribute` | Declares build configuration metadata such as Debug/Release; it does not select runtime behavior by itself. |
| `AssemblyMetadataAttribute` | Adds arbitrary key/value metadata for tools or application conventions; consumers define its meaning. |
| `AssemblyDependencyAttribute` | Declarative dependency metadata used by runtime/tooling scenarios; deployment dependency resolution is also described by generated manifests. |
| `AssemblyFileAttribute` | Records a file associated with an assembly manifest, including hash metadata in multi-file assembly scenarios. |
| `AssemblyKeyFileAttribute` | Legacy/compiler-oriented attribute identifying a strong-name key file; modern signing is generally configured through project/build properties. |
| `AssemblyDelaySignAttribute` | Legacy strong-name build metadata for delay signing; not a runtime security switch. |
| `AssemblyLoadEventArgs` | Provides the loaded `Assembly` to an `AppDomain.AssemblyLoad` event handler. |
| `Assembly.Location` | File path of the loaded assembly when available; bundled/single-file assemblies can return an empty string. |
| `Assembly.FullName` | Display-form assembly identity string; do not parse it as a path or treat it as a universal unique type identity. |
| `Assembly.ManifestModule` | Module containing the assembly manifest; most modern projects use a single-module assembly. |
| `Assembly.GetName()` | Returns the structured `AssemblyName` identity of the loaded assembly. |
| `Assembly.GetReferencedAssemblies()` | Returns assembly references recorded in metadata; references do not prove those assemblies are loaded. |
| `Assembly.GetModules()` | Returns modules in the assembly; multi-module assemblies are uncommon in typical modern .NET apps. |
| `Assembly.GetManifestResourceNames()` | Lists manifest resource names embedded in the assembly. |
| `Assembly.GetManifestResourceStream(String)` | Opens a named embedded resource stream, or returns null when the resource is not found. |
| `Assembly.GetType(String)` | Looks up a type by its metadata name in the assembly; the string format and nested/generic naming rules matter. |
| `Assembly.GetTypes()` | Enumerates defined types; may throw `ReflectionTypeLoadException` if some types cannot load, with partial types/errors available on the exception. |
| `Assembly.ExportedTypes` | Enumerates types exposed as public/exported by the assembly; enumeration can still trigger type loading. |
| `Assembly.CustomAttributes` | Enumerates custom-attribute metadata without requiring the same eager attribute-object pattern as `GetCustomAttributes`. |
| `Assembly.DefinedTypes` | Enumerates `TypeInfo` representations for types defined by the assembly. |
| `AssemblyDependencyResolver` | Resolves managed and native component dependencies relative to a component's deployment layout, useful for plugin contexts. |
| `deps.json dependency graph` | Publish-time dependency manifest used by the host/runtime to locate application and package assets. |
| `runtimeconfig.json runtime selection` | Describes target framework and runtime configuration/framework selection for an app. |
| `NuGet package assets file` | Restore output (`project.assets.json`) mapping package assets for target frameworks/RIDs; build input rather than the normal runtime dependency manifest. |
| `Reference assembly versus implementation assembly` | Reference assemblies expose compile-time API metadata, while implementation assemblies provide executable implementation; do not deploy a reference assembly as the app's runtime implementation. |
| `Satellite assembly` | Culture-specific assembly containing localized resources, conventionally separated from the main implementation assembly. |
| `ResourceManager satellite resource lookup` | ResourceManager searches culture-specific resource sets and falls back through parent cultures/default resources according to resource conventions. |
| `Assembly probing and dependency resolution` | Runtime/host uses configured probing and load-context rules to locate dependencies; do not assume arbitrary current-directory search. |
| `Assembly version binding in .NET Core` | Modern .NET uses dependency/load-context rules and does not apply .NET Framework app-config binding redirects in the same manner. |
| `Assembly identity versus file name` | Multiple files can share a name, and file name need not match full assembly identity; inspect metadata and actual load context. |
| `Strong name versus code signing` | Strong-name signing provides assembly identity/integrity semantics within .NET; Authenticode or package signing serves different publisher/distribution trust goals. |
| `Global Assembly Cache applies to .NET Framework only` | GAC is a .NET Framework deployment facility; modern .NET uses application/package/runtime asset resolution instead. |
| `Application domains unavailable in modern .NET` | Modern .NET does not support creating/unloading multiple AppDomains as a plugin isolation mechanism; use `AssemblyLoadContext` for load/unload scenarios. |
| `Single-file assembly location behavior` | Bundled managed assemblies may have no standalone location, so code that assumes `Assembly.Location` points to a physical file can fail. |
| `Assembly metadata versus file-system metadata` | Assembly attributes/manifest describe managed identity and declarations; filesystem timestamps, ACLs, and signatures are separate file properties. |

# Cross-item comparison

| Metadata surface | What it answers |
|---|---|
| `AssemblyVersionAttribute` | Assembly identity version. |
| `AssemblyFileVersionAttribute` | File/product build version shown by file tooling. |
| `AssemblyInformationalVersionAttribute` | Human-facing product version, potentially including prerelease/build labels. |
| `deps.json` | Runtime dependency asset graph. |
| `project.assets.json` | NuGet restore resolution inputs used by the build. |
| `Assembly.FullName` | Loaded identity display string, not path or cryptographic trust result. |

# Examples

```csharp
using System;
using System.Reflection;

Assembly assembly = typeof(string).Assembly;
AssemblyName identity = assembly.GetName();
Console.WriteLine($"Identity: {identity.FullName}");
Console.WriteLine($"Location: {assembly.Location}"); // May be empty for bundled assemblies.

foreach (AssemblyName reference in assembly.GetReferencedAssemblies())
    Console.WriteLine(reference.FullName);
```

The example inspects the runtime-loaded core library; it does not resolve or load each listed dependency. Avoid treating the displayed full name as a security decision.

# Common mistakes

- Using `Assembly.Location` as a universal application base path in a single-file app.
- Treating strong names/public key tokens as publisher authentication or a security boundary.
- Confusing NuGet restore assets with the runtime `.deps.json` graph.
- Assuming a referenced assembly has already loaded or that `GetTypes()` cannot partially fail.
- Applying .NET Framework GAC/binding-redirect advice to modern .NET dependency resolution.
- Using assembly version as the only file/product version users see.

# Knowledge checks with answers

1. **Does `GetReferencedAssemblies()` load every reference?** No; it reads metadata references.
2. **What exception can `GetTypes()` throw for partial load failure?** `ReflectionTypeLoadException`, which carries successfully loaded types and loader exceptions.
3. **Does a strong name prove an assembly is safe?** No; it is not a sandbox or publisher trust policy.
4. **What does `Assembly.Location` return in a single-file deployment?** It may be empty because the assembly is bundled.
5. **What replaces AppDomain unloading for modern plugin loading?** A collectible `AssemblyLoadContext`, with all references released before collection can unload it.
