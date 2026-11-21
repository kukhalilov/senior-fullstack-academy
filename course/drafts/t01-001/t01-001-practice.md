<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# .NET platform vs runtime vs SDK vs framework and alternatives — Exercises and worked solutions

## Goals
- Understand the boundaries and relationships between .NET platform components, runtimes, SDKs, frameworks, and comparable ecosystems; current release support was checked 2026-11-20.
- Learn how source code compiles to Intermediate Language (IL) and executes on the Common Language Runtime (CLR).
- Differentiate compile-time concepts (such as Target Framework Monikers and SDK versions) from runtime concepts (such as RIDs, Framework-Dependent vs. Self-Contained deployments, and roll-forward policies).
- Apply architectural decision criteria when choosing .NET versus alternative platforms like Java, Node.js, Python, Go, and Rust.

## Worked example
Consider a developer troubleshooting why a newly built .NET console application runs successfully on their local developer workstation (which has the full .NET SDK installed) but fails with a missing-runtime error when copied to a minimal production server.

1. **Diagnosis**: The developer checks the environment using command-line diagnostic tools. Running `dotnet --info`, `dotnet --list-sdks`, and `dotnet --list-runtimes` reveals that the developer workstation contains the .NET SDK (which bundles developer tools, MSBuild, NuGet, and shared runtime layers), whereas the production server contains only a minimal execution runtime or lacks the required major version.
2. **Build Configuration**: The project file (`.csproj`) defines a target framework using a Target Framework Moniker (TFM), such as `net11.0` (referencing the .NET 11 release support lifecycle).
3. **Deployment Strategy**:
   - Under a **Framework-dependent deployment**, the production server must have a compatible shared runtime installed. Patch roll-forward is normally automatic; exact major/minor selection and runtime configuration matter.
   - Under a **Self-contained deployment**, the application bundles the selected runtime for a target platform (commonly specified with a RID), removing the need for a separate shared .NET runtime install. A compatible OS, architecture, native libraries, and other system dependencies are still required.

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
1. **Tooling Inspection Solution**: `dotnet --list-sdks` lists installed SDK versions; `dotnet --list-runtimes` lists installed runtime versions for the invoked architecture. Having an SDK is evidence that build tooling is installed, but an actual build may still fail because of missing workloads, targeting packs, feeds, or project prerequisites.
2. **Framework vs. Runtime Solution**: Setting `TargetFramework` to `net11.0` selects the API contract and target framework assets at build time. Runtime configuration controls runtime selection for framework-dependent execution. SDK roll-forward, configured through SDK resolution rules such as `global.json`, is a separate build-tool selection decision.
3. **Deployment Selection Solution**:
   - **Framework-dependent deployment**: Often has less app-specific runtime payload, but relies on a compatible installed runtime that must be serviced on the host.
   - **Self-contained deployment**: Includes the runtime for a target platform and is usually larger; runtime servicing requires republishing the application. OS and native dependency requirements remain.
4. **Platform Tradeoffs Solution**: .NET relies on a managed Common Language Runtime (CLR) with automatic garbage collection, dynamic Just-In-Time (JIT) compilation (or optional AOT), and a rich Base Class Library. Rust enforces memory safety at compile-time without a garbage collector and targets native binary execution. Python typically relies on interpreted or bytecode-evaluated execution with dynamic typing.

## Tests and edge cases
- **Mismatched SDK and Target Framework**: Attempting to compile an application targeting `net11.0` using an older SDK (e.g., an SDK whose max supported TFM predates .NET 11) will fail because the reference assemblies or language feature set are unavailable to the compiler.
- **RID Mismatch**: Deploying a self-contained application compiled with an `win-x64` Runtime Identifier onto a Linux host will fail at the OS loader level because the bundled native binaries target Windows architecture.
- **End-of-Support Runtimes**: Running applications on unsupported releases leaves them outside that release's servicing support; check the current Microsoft lifecycle table before naming affected versions and dates.

## Reflection questions
- How does separating the .NET SDK from the .NET runtime simplify continuous integration (CI) server maintenance compared to all-in-one monolithic development kits?
- When would you choose an LTS release (.NET 10) over an STS release (.NET 11) for an enterprise production deployment?
- What factors drive the choice between Native AOT publishing and standard JIT-based execution in modern .NET applications?

*Note: This lesson is under factual review; consult Microsoft's current lifecycle documentation for release support dates.*

*Sources: [Microsoft .NET releases and support](https://learn.microsoft.com/en-us/dotnet/core/releases-and-support), [target frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks), and [deployment](https://learn.microsoft.com/en-us/dotnet/core/deploying/).*
