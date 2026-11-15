<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# .NET platform vs runtime vs SDK vs framework and alternatives — Exercises and worked solutions

## Goals
- Understand the boundaries and relationships between the .NET platform, runtimes, SDKs, frameworks, and comparable ecosystems (.NET 11 GA and .NET 10 LTS checked 2026-11-15 per [Microsoft .NET Introduction](https://learn.microsoft.com/en-us/dotnet/core/introduction)).
- Learn how source code compiles to Intermediate Language (IL) and executes on the Common Language Runtime (CLR).
- Differentiate compile-time concepts (such as Target Framework Monikers and SDK versions) from runtime concepts (such as RIDs, Framework-Dependent vs. Self-Contained deployments, and roll-forward policies).
- Apply architectural decision criteria when choosing .NET versus alternative platforms like Java, Node.js, Python, Go, and Rust.

## Worked example
Consider a developer troubleshooting why a newly built .NET console application runs successfully on their local developer workstation (which has the full .NET SDK installed) but fails with a missing-runtime error when copied to a minimal production server.

1. **Diagnosis**: The developer checks the environment using command-line diagnostic tools. Running `dotnet --info`, `dotnet --list-sdks`, and `dotnet --list-runtimes` reveals that the developer workstation contains the .NET SDK (which bundles developer tools, MSBuild, NuGet, and shared runtime layers), whereas the production server contains only a minimal execution runtime or lacks the required major version.
2. **Build Configuration**: The project file (`.csproj`) defines a target framework using a Target Framework Moniker (TFM), such as `net11.0` (referencing the .NET 11 release support lifecycle).
3. **Deployment Strategy**: 
   - Under a **Framework-dependent deployment**, the production server must have the exact or roll-forward compatible runtime installed.
   - Under a **Self-contained deployment**, the application bundles its own runtime binaries for a specific Runtime Identifier (RID) (e.g., `linux-x64`), eliminating the dependency on pre-installed host runtimes.

## Exercises
1. **Tooling Inspection**: State the functional difference between `dotnet --list-sdks` and `dotnet --list-runtimes`. Which command verifies your ability to *compile* code, and which verifies your ability to *execute* pre-compiled assemblies on a host?
2. **Framework vs. Runtime**: Explain why changing the `TargetFramework` property in a `.csproj` file from `net10.0` to `net11.0` is a compile-time/package-compatibility decision, whereas configuring a roll-forward policy is a runtime execution decision.
3. **Deployment Selection**: Compare Framework-Dependent Deployment (FDD) and Self-Contained Deployment (SCD) in terms of target server requirements, final artifact size, and update mechanics.
4. **Platform Tradeoffs**: Contrast the managed, garbage-collected Common Language Runtime (CLR) environment of .NET with the compile-time memory safety model of Rust or the dynamic interpretation model of Python/CPython.

## Progressive hints
- **Hint 1 for Exercise 1**: Think about the distinction between building software (requiring MSBuild, NuGet, compilers, and reference assemblies) and executing software (requiring the Common Language Runtime and the Base Class Library).
- **Hint 2 for Exercise 2**: A Target Framework Moniker (TFM) governs which API contract is checked at compile-time and referenced from NuGet packages. Roll-forward policies dictate how the host picks an installed runtime version when launching the compiled assembly.
- **Hint 3 for Exercise 3**: FDD relies on the host environment having a compatible runtime pre-installed. SCD includes the runtime and required libraries directly within the publish output folder.
- **Hint 4 for Exercise 4**: Consider memory management (garbage collection vs. manual/ownership models), startup latency, and deployment artifact footprints.

## Complete solutions
1. **Tooling Inspection Solution**: `dotnet --list-sdks` lists the installed .NET Software Development Kits, which include compilers, MSBuild, NuGet package managers, and development tooling necessary to build and publish applications. `dotnet --list-runtimes` lists only the execution engines (such as the Microsoft.NETCore.App or ASP.NET Core shared frameworks) required to run built applications.
2. **Framework vs. Runtime Solution**: Setting `TargetFramework` to `net11.0` defines the API contract and language/SDK feature gates used by the compiler and NuGet asset selection at build time. Roll-forward policies determine how the launcher selects among compatible minor or patch runtime updates if the exact compilation runtime is absent on the target machine.
3. **Deployment Selection Solution**: 
   - **Framework-dependent deployment**: Results in smaller binaries and relies on the target machine having the correct .NET runtime installed and patched centrally.
   - **Self-contained deployment**: Bundles the runtime and libraries for a specific Runtime Identifier (RID), resulting in larger file sizes but zero external runtime dependencies on the target host.
4. **Platform Tradeoffs Solution**: .NET relies on a managed Common Language Runtime (CLR) with automatic garbage collection, dynamic Just-In-Time (JIT) compilation (or optional AOT), and a rich Base Class Library. Rust enforces memory safety at compile-time without a garbage collector and targets native binary execution. Python typically relies on interpreted or bytecode-evaluated execution with dynamic typing.

## Tests and edge cases
- **Mismatched SDK and Target Framework**: Attempting to compile an application targeting `net11.0` using an older SDK (e.g., an SDK whose max supported TFM predates .NET 11) will fail because the reference assemblies or language feature set are unavailable to the compiler.
- **RID Mismatch**: Deploying a self-contained application compiled with an `win-x64` Runtime Identifier onto a Linux host will fail at the OS loader level because the bundled native binaries target Windows architecture.
- **End-of-Support Runtimes**: Running applications on unpatched or unsupported releases (such as .NET 8 or .NET 9, which reached end of support on November 10, 2026 per [Microsoft .NET Releases and Support](https://learn.microsoft.com/en-us/dotnet/core/releases-and-support)) leaves systems without security updates, even if roll-forward or installation policies permit execution.

## Reflection questions
- How does separating the .NET SDK from the .NET runtime simplify continuous integration (CI) server maintenance compared to all-in-one monolithic development kits?
- When would you choose an LTS release (.NET 10) over an STS release (.NET 11) for an enterprise production deployment?
- What factors drive the choice between Native AOT publishing and standard JIT-based execution in modern .NET applications?

*Note: This is an automatically generated draft.*
