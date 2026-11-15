<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# .NET platform vs runtime vs SDK vs framework and alternatives — Reference: .NET implementations, framework families, target frameworks, and compatibility

# Scope and version

This reference lesson covers the exact inventory group of .NET implementations, framework families, target frameworks, and compatibility mechanisms as defined in `.NET 11 GA and .NET 10 LTS checked 2026-11-15` [https://learn.microsoft.com/en-us/dotnet/core/introduction](https://learn.microsoft.com/en-us/dotnet/core/introduction). 

This is a reference lesson. It examines a bounded set of terms that describe how .NET code targets specific platforms, how compilers select APIs, how runtimes execute binaries, and how support lifecycles govern software stability. It does not cover C# language syntax, exact command-line interface (CLI) execution flags, or internal memory management.

---

# How this group fits the mental model

When writing code, you need a way to declare what APIs your code uses and where it is expected to run. The items in this inventory group represent the vocabulary of those choices:

1. **Implementations and Runtimes**: Explain *who* executes the code (such as modern `.NET`, `.NET Framework`, `CoreCLR`, or the `Mono runtime`).
2. **Targets and Identifiers**: Explain *what* APIs are guaranteed to exist at compile time (`TargetFramework`, `Target framework moniker (TFM)`, `net11.0 TFM`, etc.) versus what operating system and architecture execute the code (`Runtime Identifier (RID)`).
3. **Compatibility and Portability Specifications**: Explain how libraries share code across different implementations (`.NET Standard API specification`).
4. **Packaging and Deployment Strategies**: Explain how binaries are delivered to target environments (`Framework-dependent deployment`, `Self-contained deployment`, and `Roll-forward policy`).
5. **Lifecycles**: Explain how support duration is scheduled (`Long Term Support (LTS) release`, `Standard Term Support (STS) release`, and `.NET release support lifecycle`).

Understanding these terms ensures you do not confuse compile-time API availability with runtime execution capability.

---

# Supplied names explained

## .NET implementations, runtimes, and legacy editions

- **.NET (modern .NET, formerly .NET Core)**: Microsoft's primary, open-source, cross-platform implementation used for building cloud services, web applications, microservices, and desktop/mobile apps. Since .NET 5, it uses the simple ".NET" product name [https://learn.microsoft.com/en-us/dotnet/core/introduction](https://learn.microsoft.com/en-us/dotnet/core/introduction).
- **.NET Framework**: A mature, Windows-only implementation of .NET used primarily for maintaining existing enterprise applications. It is in maintenance mode [https://learn.microsoft.com/en-us/dotnet/core/introduction](https://learn.microsoft.com/en-us/dotnet/core/introduction).
- **.NET Core 1.0 through 3.1**: The historical precursor versions of modern cross-platform .NET. They established the foundation for modern .NET before the product name was simplified to ".NET" starting with .NET 5 [https://github.com/dotnet/core/releases](https://github.com/dotnet/core/releases).
- **Mono runtime**: An open-source, cross-platform implementation of the .NET Framework historically used for mobile (Xamarin), gaming, and Linux environments.
- **CoreCLR**: The execution engine (runtime) for modern .NET, responsible for garbage collection, assembly loading, and compiling Intermediate Language (IL) to native machine code via Just-In-Time (JIT) compilation.
- **.NET Standard API specification**: A formal specification of .NET APIs that establish consistent contract boundaries across different .NET implementations, enabling code reuse across modern .NET, .NET Framework, and Mono [https://learn.microsoft.com/en-us/dotnet/standard/glossary](https://learn.microsoft.com/en-us/dotnet/standard/glossary).
- **.NET Standard 2.0 support boundary**: A compatibility line guaranteeing that libraries targeting this specification can run on .NET Framework 4.6.1+, modern .NET, and other compliant runtimes [https://learn.microsoft.com/en-us/dotnet/standard/glossary](https://learn.microsoft.com/en-us/dotnet/standard/glossary).
- **.NET Standard 2.1 support boundary**: An advanced API specification boundary supported by modern .NET and Mono, but *not* supported by .NET Framework [https://learn.microsoft.com/en-us/dotnet/standard/glossary](https://learn.microsoft.com/en-us/dotnet/standard/glossary).

## Target frameworks and build-property naming

- **Target framework**: The conceptual designation of the API set and behavior your application or library requires.
- **Target framework moniker (TFM)**: A standardized token string format (such as `net11.0`) that uniquely identifies the target framework of a .NET application or library [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).
- **net11.0 TFM**: The target framework moniker representing the modern .NET 11 release [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).
- **net10.0 TFM**: The target framework moniker representing the modern .NET 10 Long Term Support release [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).
- **netstandard2.1 TFM**: The target framework moniker for libraries implementing .NET Standard version 2.1 [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).
- **netstandard2.0 TFM**: The target framework moniker for libraries implementing .NET Standard version 2.0 [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).
- **net481 TFM**: The target framework moniker targeting the final version of .NET Framework (4.8.1) [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).
- **TargetFramework MSBuild property**: An MSBuild project file setting used to specify a single TFM for a project (e.g., `<TargetFramework>net10.0</TargetFramework>`) [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).
- **TargetFrameworks MSBuild property**: An MSBuild project file setting used to build a project for multiple target frameworks concurrently (multi-targeting, e.g., `<TargetFrameworks>net10.0;netstandard2.0</TargetFrameworks>`) [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).
- **TargetPlatformVersion**: An MSBuild property used alongside OS-specific TFMs to specify the minimum OS version requirement (such as a specific Windows or iOS SDK version).
- **OS-specific TFM**: A TFM that includes an operating system specifier suffix (e.g., `net11.0-windows` or `net11.0-android`) to unlock platform-specific APIs.
- **Runtime Identifier (RID)**: A string token (such as `win-x64` or `linux-x64`) that identifies the target operating system and hardware architecture where an application runs [https://learn.microsoft.com/en-us/dotnet/core/deploying/](https://learn.microsoft.com/en-us/dotnet/core/deploying/).
- **Target framework versus Runtime Identifier**: The architectural distinction where the *Target Framework* decides *what APIs* are legal to write against during compilation, while the *Runtime Identifier* decides *what machine architecture binaries* are packaged for deployment [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).

## Compatibility, dependency resolution, and annotations

- **NuGet asset selection by target framework**: The mechanism by which the NuGet package manager inspects a package's compiled folders and picks the most compatible binary asset matching the consuming project's TFM [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).
- **Compile-time API availability versus runtime support**: The operational reality that code might compile successfully against an abstract target framework contract, but fail or throw platform exceptions if executed on an underlying host runtime that lacks the necessary OS drivers or subsystem features.
- **Platform-specific API annotations**: Attributes (such as `[SupportedOSPlatform]`) used in modern .NET code to warn developers or trigger compiler errors if an API is invoked on an incompatible operating system.

## Deployment styles, versioning policies, and lifecycle management

- **Framework-dependent deployment**: A deployment model where the application relies on a shared, globally installed .NET runtime present on the host machine [https://learn.microsoft.com/en-us/dotnet/core/deploying/](https://learn.microsoft.com/en-us/dotnet/core/deploying/).
- **Self-contained deployment**: A deployment model where the application bundles its own copy of the .NET runtime and core libraries, removing the need for a pre-installed runtime on the target host [https://learn.microsoft.com/en-us/dotnet/core/deploying/](https://learn.microsoft.com/en-us/dotnet/core/deploying/).
- **Roll-forward policy**: The behavior configuration that dictates whether an application can automatically upgrade to a newer patch or major runtime version if the exact targeted runtime is missing on the host [https://learn.microsoft.com/en-us/dotnet/core/versions/selection](https://learn.microsoft.com/en-us/dotnet/core/versions/selection).
- **Long Term Support (LTS) release**: A .NET release version supported for extended enterprise stability (typically 3 years), ideal for production environments requiring fewer breaking changes [https://learn.microsoft.com/en-us/dotnet/core/releases-and-support](https://learn.microsoft.com/en-us/dotnet/core/releases-and-support).
- **Standard Term Support (STS) release**: A .NET release version supported for 18 months, featuring newer capabilities delivered more frequently (such as .NET 11) [https://learn.microsoft.com/en-us/dotnet/core/releases-and-support](https://learn.microsoft.com/en-us/dotnet/core/releases-and-support).
- **.NET release support lifecycle**: The official Microsoft policy timeline dictating when releases become Generally Available (GA), when they receive patches, and when they reach end-of-support status [https://learn.microsoft.com/en-us/dotnet/core/releases-and-support](https://learn.microsoft.com/en-us/dotnet/core/releases-and-support).

---

# Cross-item comparison

To understand how these concepts operate together, examine these key contrasts:

- **Target framework vs. Runtime Identifier (RID)**: `TargetFramework` controls the API shape visible to the compiler (e.g., `net11.0`), whereas `Runtime Identifier` controls the native platform binaries included during publishing (e.g., `linux-x64`).
- **Framework-dependent vs. Self-contained deployment**: Framework-dependent applications result in smaller download sizes because they require an external runtime install; self-contained applications bundle the runtime, increasing file size but guaranteeing execution environment independence.
- **LTS vs. STS releases**: Long Term Support (LTS) releases like .NET 10 prioritize stability over several years, while Standard Term Support (STS) releases like .NET 11 deliver cutting-edge features with a shorter 18-month lifecycle [https://learn.microsoft.com/en-us/dotnet/core/releases-and-support](https://learn.microsoft.com/en-us/dotnet/core/releases-and-support).
- **.NET Standard vs. Modern .NET**: `.NET Standard` is a specification contract for library reuse across distinct families, whereas modern `.NET` is a concrete, cross-platform runtime implementation [https://learn.microsoft.com/en-us/dotnet/standard/glossary](https://learn.microsoft.com/en-us/dotnet/standard/glossary).

---

# Examples

## Example 1: Defining a Target Framework and Multi-targeting

The following project configuration demonstrates how to set a single modern .NET target framework or multi-target a library for both modern .NET and legacy specification boundaries [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks).

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <!-- Single target example using net11.0 TFM -->
  <PropertyGroup>
    <TargetFramework>net11.0</TargetFramework>
  </PropertyGroup>

</Project>
```

For a library that needs to support both modern runtimes and older specifications, you use `TargetFrameworks`:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <!-- Multi-targeting example -->
  <PropertyGroup>
    <TargetFrameworks>net11.0;netstandard2.0</TargetFrameworks>
  </PropertyGroup>

</Project>
```

*Expected Result*: The compiler builds separate assemblies for each specified moniker, allowing NuGet asset selection to pick the optimal binary for any consumer.

---

# Common mistakes

- **Confusing compile-time TFMs with runtime installs**: Assuming that if your project uses `net10.0 TFM`, the host machine does not need a compatible runtime installed (unless using a self-contained deployment).
- **Expecting .NET Framework to run .NET Standard 2.1 code**: Attempting to consume a library built for `netstandard2.1` in an old .NET Framework application. .NET Framework only supports up to `.NET Standard 2.0` [https://learn.microsoft.com/en-us/dotnet/standard/glossary](https://learn.microsoft.com/en-us/dotnet/standard/glossary).
- **Ignoring roll-forward behavior**: Deploying an app to a server where the exact minor patch version is missing, causing execution failure because the roll-forward policy was overly strict or misconfigured [https://learn.microsoft.com/en-us/dotnet/core/versions/selection](https://learn.microsoft.com/en-us/dotnet/core/versions/selection).

---

# Knowledge checks with answers

1. **Question**: What is the difference in purpose between a Target Framework Moniker (TFM) and a Runtime Identifier (RID)?
   - **Answer**: A TFM dictates what API contract is visible to the compiler during code generation, while a RID specifies the target operating system and hardware architecture for native binary packaging and deployment [https://learn.microsoft.com/en-us/dotnet/standard/frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks), [https://learn.microsoft.com/en-us/dotnet/core/deploying/](https://learn.microsoft.com/en-us/dotnet/core/deploying/).

2. **Question**: Can a legacy .NET Framework 4.8 application reference a library targeting `netstandard2.1`?
   - **Answer**: No. .NET Framework supports up to `.NET Standard 2.0`; version 2.1 requires modern .NET or other modern compliant runtimes [https://learn.microsoft.com/en-us/dotnet/standard/glossary](https://learn.microsoft.com/en-us/dotnet/standard/glossary).

3. **Question**: What is the primary operational advantage of a self-contained deployment over a framework-dependent deployment?
   - **Answer**: A self-contained deployment bundles the runtime and required libraries directly inside the application package, eliminating the requirement for a pre-installed .NET runtime on the target host machine [https://learn.microsoft.com/en-us/dotnet/core/deploying/](https://learn.microsoft.com/en-us/dotnet/core/deploying/).

4. **Question**: Which release type (.NET LTS or .NET STS) is designed for extended production support over a 3-year timeline?
   - **Answer**: Long Term Support (LTS) releases (such as .NET 10) [https://learn.microsoft.com/en-us/dotnet/core/releases-and-support](https://learn.microsoft.com/en-us/dotnet/core/releases-and-support).
