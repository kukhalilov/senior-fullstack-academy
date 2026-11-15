<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# .NET platform vs runtime vs SDK vs framework and alternatives — Reference: .NET application stacks, workloads, operating systems, and deployment choices

# Scope and version

**Scope:** This reference lesson covers the inventory group `.NET application stacks, workloads, operating systems, and deployment choices` within the broader `.NET platform vs runtime vs SDK vs framework and alternatives` topic.  
**Version & Authority:** Checked against Microsoft .NET documentation as of .NET 11 GA and .NET 10 LTS (.NET 11 STS and .NET 10 LTS checked 2026-11-15) [https://learn.microsoft.com/en-us/dotnet/core/introduction](https://learn.microsoft.com/en-us/dotnet/core/introduction).  
**Draft Notice:** This is an automatically generated draft.

---

# How this group fits the mental model

When building software in .NET, you must distinguish between the *base runtime* (which executes compiled code) and the *application stack* (the architectural layer providing UI, web, or background execution patterns). Furthermore, your code must be packaged and deployed correctly for specific operating systems, CPU architectures, and hosting environments. 

The supplied items in this inventory group represent the concrete choices you make when configuring what your application is (its stack), how it builds (workloads and architecture targets), and how it travels to the target machine (publishing shapes, roll-forward rules, and containerization). They sit downstream of the core SDK and runtime concepts, translating general .NET code into a runnable, production-ready artifact.

---

# Supplied names explained

* **ASP.NET Core**: An open-source, cross-platform web framework used for building modern cloud-based web apps, APIs, and microservices.
* **Windows Forms**: A graphical user interface (GUI) class library used exclusively on Windows for creating rich desktop applications.
* **Windows Presentation Foundation (WPF)**: A Windows-only UI framework based on DirectX, used for building desktop client applications with separated UI markup and business logic.
* **.NET MAUI (Multi-platform App UI)**: A cross-platform framework for building native mobile and desktop apps (iOS, Android, macOS, and Windows) from a single codebase.
* **Worker Service**: A template and framework pattern for writing long-running, background background tasks or daemons (such as message queue processors).
* **Console application**: A command-line text input/output program used for utilities, scripts, batch processing, or entry-level tests.
* **Class library**: A reusable project type containing compiled types and logic intended to be consumed by other applications rather than run directly.
* **WebAssembly workload**: An optional SDK workload that compiles .NET code to run client-side in web browsers via WebAssembly (Blazor WebAssembly).
* **Optional SDK workload**: Additional feature packs (such as mobile or web assembly tools) that can be installed on top of the base .NET SDK via CLI tools.
* **Cross-platform application**: Software designed to compile and run across multiple operating systems (such as Linux, macOS, and Windows) without code changes.
* **Windows-only application framework**: Frameworks (such as Windows Forms and WPF) that depend on native Windows APIs and cannot run natively on non-Windows operating systems.
* **Architecture target: x64**: A compilation and deployment target for 64-bit Intel and AMD processor architectures.
* **Architecture target: Arm64**: A compilation and deployment target for 64-bit ARM processor architectures (such as Apple Silicon or ARM64 servers).
* **Single-file deployment**: A publishing option that bundles the application and its dependencies into a single binary file to ease distribution.
* **ReadyToRun publishing**: A compilation mode that translates intermediate language (IL) code into native machine code ahead-of-time to reduce startup latency.
* **Native AOT publishing**: Ahead-of-time compilation that compiles .NET code directly to native machine code without relying on a JIT compiler at runtime, removing the managed runtime startup overhead.
* **RID-specific deployment**: A Runtime Identifier-specific deployment that targets a precise operating system and architecture combination (e.g., `linux-x64`).
* **Runtime roll-forward**: The policy that allows an application to execute on a newer patch or major version of the .NET runtime if the exact target version is missing.
* **SDK roll-forward**: The behavior where the .NET SDK automatically selects a newer patch or feature band SDK version to build a project.
* **Global.json SDK selection**: A configuration file mechanism (`global.json`) used to lock down a specific .NET SDK version for a repository or directory.
* **Container-based .NET deployment**: Packaging a .NET application, its dependencies, and runtime inside an isolated container image (such as Docker) for deployment.
* **Operating system support versus API support**: The boundary between whether an OS can host the runtime versus whether a specific framework API (like Windows UI APIs) is available.
* **Application stack versus base runtime**: The distinction between the specialized domain libraries you write against (web, desktop) and the foundational virtual machine execution environment.

---

# Cross-item comparison

* **Single-file deployment** vs **Native AOT publishing**: Single-file packages your assemblies and sometimes the runtime into one container file, but it still relies on the standard JIT runtime to execute. Native AOT strips out the JIT compiler entirely and compiles straight to native code, resulting in fast startup and smaller footprints, but with limitations on dynamic reflection and runtime code generation.
* **Runtime roll-forward** vs **SDK roll-forward**: Runtime roll-forward controls *execution* (allowing a deployed app to run on a newer installed runtime patch/version), whereas SDK roll-forward controls *building* (allowing the CLI to use a newer installed SDK version than requested).
* **Windows-only application framework** (e.g., Windows Forms, WPF) vs **Cross-platform application** (e.g., Console application, Worker Service, .NET MAUI): Windows-only frameworks are hard-tied to Win32/DirectX APIs and cannot target Linux or macOS. Cross-platform application stacks abstract away the OS layer to compile and run across various host environments.
* **Application stack versus base runtime**: The base runtime provides memory management, type safety, and JIT compilation common to all programs. An application stack builds on top of this runtime to provide specific patterns, like HTTP routing for ASP.NET Core or window management for WPF.

---

# Examples

### Example 1: Selecting a Target Stack and Architecture via MSBuild/CLI properties
*(Unverified snippet)*

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <!-- This project defines an ASP.NET Core Web API cross-platform application stack -->
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <RuntimeIdentifier>linux-x64</RuntimeIdentifier>
    <SelfContained>true</SelfContained>
  </PropertyGroup>
</Project>
```
*Expected result:* Configures the build process to target .NET 10.0 (`net10.0`), produce a self-contained deployment package, and lock the output specifically to the `linux-x64` Runtime Identifier (RID).

### Example 2: Forcing an Exact SDK Version with global.json
*(Unverified snippet)*

```json
{
  "sdk": {
    "version": "11.0.100",
    "rollForward": "disable"
  }
}
```
*Expected result:* Prevents SDK roll-forward behavior. If version `11.0.100` of the .NET SDK is missing on the machine, the build fails rather than automatically picking up a newer patch release.

---

# Common mistakes

* **Confusing Operating System Support with API Support:** Assuming that because a machine can install the .NET runtime, a Windows-only application framework (like Windows Forms) will execute on Linux. The runtime works cross-platform, but UI frameworks may rely on OS-specific subsystems [https://learn.microsoft.com/en-us/dotnet/core/introduction](https://learn.microsoft.com/en-us/dotnet/core/introduction).
* **Misunderstanding Native AOT Reflection Limits:** Assuming Native AOT publishing works out-of-the-box with heavy dynamic assembly generation or complex reflection frameworks without configuration. Native AOT requires trimming compatibility and explicit code annotations.
* **Ignoring Roll-Forward Risks in Production:** Relying completely on default runtime roll-forward behaviors in strict production environments without pinning versions or containers, leading to unverified runtime updates during deployments.

---

# Knowledge checks with answers

1. **Question:** What is the fundamental difference between a Windows-only application framework like WPF and a cross-platform stack like ASP.NET Core?  
   **Answer:** WPF relies on native Windows APIs (such as DirectX and Win32 windowing) and cannot run on non-Windows operating systems, whereas ASP.NET Core is built on cross-platform abstractions capable of running on Linux, macOS, and Windows [https://learn.microsoft.com/en-us/dotnet/core/introduction](https://learn.microsoft.com/en-us/dotnet/core/introduction).

2. **Question:** How does Native AOT publishing differ from standard single-file deployment regarding runtime execution?  
   **Answer:** Single-file deployment bundles application binaries into a single file but still uses the standard JIT runtime to execute. Native AOT compiles code directly to native machine code ahead-of-time, eliminating the JIT compiler and managed runtime startup overhead.

3. **Question:** What does a `global.json` file configure regarding SDK behavior?  
   **Answer:** It locks down or guides **SDK roll-forward** and exact version selection, forcing the .NET CLI to use a specified SDK version when building code in that directory tree.

4. **Question:** Why would you choose a Worker Service instead of a Console application?  
   **Answer:** A Worker Service provides a built-in hosting framework pattern (including dependency injection, logging, and graceful shutdown handling out-of-the-box) optimized for long-running background tasks, whereas a basic Console application runs linearly and exits unless explicitly structured otherwise.
