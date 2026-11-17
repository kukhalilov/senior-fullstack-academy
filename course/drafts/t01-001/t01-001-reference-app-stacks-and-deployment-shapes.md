<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# .NET platform vs runtime vs SDK vs framework and alternatives — Reference: .NET application stacks, workloads, operating systems, and deployment choices

# Scope and version

**Scope:** This reference lesson covers the inventory group `.NET application stacks, workloads, operating systems, and deployment choices` within the broader `.NET platform vs runtime vs SDK vs framework and alternatives` topic.  
**Version & Authority:** Current product lifecycle and publishing behavior checked against Microsoft documentation on 2026-11-17. .NET 11 is STS and .NET 10 is LTS, each supported until November 2028.
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
* **Worker Service**: A project template and hosting pattern for long-running background tasks or services, such as message queue processors.
* **Console application**: A command-line text input/output program used for utilities, scripts, batch processing, or entry-level tests.
* **Class library**: A reusable project type containing compiled types and logic intended to be consumed by other applications rather than run directly.
* **WebAssembly workload**: An optional SDK workload that compiles .NET code to run client-side in web browsers via WebAssembly (Blazor WebAssembly).
* **Optional SDK workload**: Additional feature packs (such as mobile or web assembly tools) that can be installed on top of the base .NET SDK via CLI tools.
* **Cross-platform application**: Software designed to compile and run across multiple operating systems (such as Linux, macOS, and Windows) without code changes.
* **Windows-only application framework**: Frameworks (such as Windows Forms and WPF) that depend on native Windows APIs and cannot run natively on non-Windows operating systems.
* **Architecture target: x64**: A compilation and deployment target for 64-bit Intel and AMD processor architectures.
* **Architecture target: Arm64**: A compilation and deployment target for 64-bit ARM processor architectures (such as Apple Silicon or ARM64 servers).
* **Single-file deployment**: A publishing option that bundles the application and its dependencies into a single binary file to ease distribution.
* **ReadyToRun publishing**: A publish option that stores precompiled native code alongside IL. The runtime can use that code and tiered compilation may later replace frequently used methods with JIT-compiled code; it is not equivalent to removing the JIT.
* **Native AOT publishing**: A self-contained publish mode that compiles application code to native code without runtime JIT and includes required runtime libraries. Startup/memory benefits and artifact size depend on the app; dynamic loading, code generation, trimming, and reflection compatibility have limitations.
* **RID-specific deployment**: A Runtime Identifier-specific deployment that targets a precise operating system and architecture combination (e.g., `linux-x64`).
* **Runtime roll-forward**: Runtime selection rules for a framework-dependent app when choosing installed runtimes. Patch roll-forward is normally automatic; minor/major behavior can be configured and should be checked against current runtime documentation.
* **SDK roll-forward**: The behavior configured by SDK resolution rules (including `global.json`) to select an installed SDK when the requested version is missing or later versions are permitted.
* **Global.json SDK selection**: A configuration file mechanism (`global.json`) used to lock down a specific .NET SDK version for a repository or directory.
* **Container-based .NET deployment**: Packaging an app and its dependencies in a container image. Depending on the selected base image and deployment mode, the runtime can be in the image or bundled with the app.
* **Operating system support versus API support**: The boundary between whether an OS can host the runtime versus whether a specific framework API (like Windows UI APIs) is available.
* **Application stack versus base runtime**: The distinction between the specialized domain libraries you write against (web, desktop) and the foundational virtual machine execution environment.

---

# Cross-item comparison

* **Single-file deployment** vs **Native AOT publishing**: Single-file bundles application-dependent files into one file and can be framework-dependent or self-contained; it does not by itself remove the JIT runtime. Native AOT produces self-contained native code without runtime JIT, with limitations including dynamic loading, code generation, and trimming-sensitive reflection. Size and startup effects depend on the app and configuration.
* **Runtime roll-forward** vs **SDK roll-forward**: Runtime selection controls execution of framework-dependent apps (patch roll-forward is normally automatic); SDK selection controls the CLI/toolchain and may be configured in `global.json`. They are separate policies.
* **Windows-only application framework** (e.g., Windows Forms, WPF) vs **Cross-platform application** (e.g., Console application, Worker Service, .NET MAUI): Windows Forms and WPF target Windows. Cross-platform support still depends on the selected workload, TFM, dependencies, native components, and host environment; an application type is not automatically portable merely because the base runtime is cross-platform.
* **Application stack versus base runtime**: The base runtime provides memory management, type safety, and JIT compilation common to all programs. An application stack builds on top of this runtime to provide specific patterns, like HTTP routing for ASP.NET Core or window management for WPF.

---

# Examples

### Example 1: Selecting a Target Stack and Architecture via MSBuild/CLI properties
*(Unverified snippet)*

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <!-- This project defines an ASP.NET Core Web API cross-platform application stack -->
  <PropertyGroup>
    <TargetFramework>net11.0</TargetFramework>
    <RuntimeIdentifier>linux-x64</RuntimeIdentifier>
    <SelfContained>true</SelfContained>
  </PropertyGroup>
</Project>
```
*Expected result:* Configures the project to target the `net11.0` API surface and publish for `linux-x64` with the runtime included. The output requires a compatible Linux x64 host and native dependencies; it is not host-independent.

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
*Expected result:* Requires the exact SDK version `11.0.100` under the `disable` policy; if that version is unavailable, SDK resolution fails rather than selecting another installed SDK.

---

# Common mistakes

* **Confusing Operating System Support with API Support:** Assuming that because a machine can install the .NET runtime, a Windows-only application framework (like Windows Forms) will execute on Linux. The runtime works cross-platform, but UI frameworks may rely on OS-specific subsystems [https://learn.microsoft.com/en-us/dotnet/core/introduction](https://learn.microsoft.com/en-us/dotnet/core/introduction).
* **Misunderstanding Native AOT Reflection Limits:** Assuming Native AOT publishing works out-of-the-box with heavy dynamic assembly generation or complex reflection frameworks without configuration. Native AOT requires trimming compatibility and explicit code annotations.
* **Ignoring Roll-Forward Configuration:** Confusing SDK pinning with runtime selection, or assuming a framework-dependent app requires an exact patch version. Check deployment mode and runtime configuration before diagnosing version compatibility.

---

# Knowledge checks with answers

1. **Question:** What is the fundamental difference between a Windows-only application framework like WPF and a cross-platform stack like ASP.NET Core?  
   **Answer:** WPF relies on native Windows APIs (such as DirectX and Win32 windowing) and cannot run on non-Windows operating systems, whereas ASP.NET Core is built on cross-platform abstractions capable of running on Linux, macOS, and Windows [https://learn.microsoft.com/en-us/dotnet/core/introduction](https://learn.microsoft.com/en-us/dotnet/core/introduction).

2. **Question:** How does Native AOT publishing differ from standard single-file deployment regarding runtime execution?  
   **Answer:** Single-file deployment bundles application binaries into a single file but still uses the standard JIT runtime to execute. Native AOT compiles code directly to native machine code ahead-of-time, eliminating the JIT compiler and managed runtime startup overhead.

3. **Question:** What does a `global.json` file configure regarding SDK behavior?  
   **Answer:** It locks down or guides **SDK roll-forward** and exact version selection, forcing the .NET CLI to use a specified SDK version when building code in that directory tree.

4. **Question:** Why would you choose a Worker Service instead of a Console application?  
   **Answer:** The Worker Service template provides a Generic Host-based starting point for a long-running background process. A console application can also use the Generic Host and run background work; the distinction is project setup and conventions, not an inability of console apps to host services.
