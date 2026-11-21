<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# .NET platform vs runtime vs SDK vs framework and alternatives — Core concepts and how they fit together

*This is an automatically generated draft.*

# .NET Platform: Concepts and Architecture

## Learning objectives
* Distinguish between the .NET SDK, the .NET runtime, and the .NET platform.
* Understand the role of Target Framework Monikers (TFMs) in build and deployment.
* Identify the differences between modern .NET and legacy .NET Framework.
* Recognize how .NET compares to other ecosystems like Java, Node.js, and Go.

## Prerequisites
* Basic familiarity with the concept of a programming language (like C#) and a compiler.
* Understanding that software needs an environment (a "runtime") to execute instructions on a computer.

## Core concepts
The .NET platform brings together languages, compilers, libraries, runtimes, developer tools, and application stacks for building and running applications. Think of it like a kitchen:
* **The Language (C#):** The recipe.
* **The SDK (Software Development Kit):** The collection of tools (knives, pans, oven) used to prepare the meal.
* **The Runtime:** The execution engine that loads and runs the application.
* **Libraries and application frameworks:** Reusable ingredients and higher-level patterns used to build an app; they are related to the platform but are not the runtime itself.

### Key Components
1. **.NET SDK:** Contains everything you need to *develop* apps. It includes the compiler, the .NET CLI (command-line interface), and the runtime components needed to test your code.
2. **.NET Runtime:** The engine that executes your code. You only need this on a machine where you want to *run* an application, not necessarily develop one.
3. **Target Framework Moniker (TFM):** A string (e.g., `net11.0`) that tells the compiler which set of APIs your application is allowed to use.
4. **Modern .NET vs. .NET Framework:** Modern .NET is Microsoft's primary cross-platform implementation. .NET Framework is a distinct Windows implementation that remains supported under its own lifecycle and is used by existing and Windows-specific applications.

## Mechanisms and relationships
The relationship between these parts is defined by the build-to-run lifecycle:

1. **Build Time:** You use the **SDK** and a **TFM** (like `net10.0`) to compile your code into **Intermediate Language (IL)**. The TFM ensures you only use APIs available in that version.
2. **Deployment:** You choose between **Framework-dependent** (the user must have the runtime installed) or **Self-contained** (the runtime is bundled with your app).
3. **Runtime:** When the app starts, the **Common Language Runtime (CLR)** loads your IL, compiles it into machine code, and manages memory (garbage collection).

## Worked examples

### Example: Building a Console App
1. **Development:** You install the .NET SDK. You create a project file (`.csproj`) and set the `TargetFramework` to `net11.0`.
2. **Compilation:** You run the `dotnet build` command. The SDK uses the compiler to turn your C# code into an assembly (a `.dll` file containing IL).
3. **Execution:** You run `dotnet myapp.dll`. The `dotnet` executable finds the installed .NET runtime on the machine, which then executes your code.

*Note: A framework-dependent app targeting `net11.0` requires a compatible .NET 11 runtime; .NET 8 does not satisfy that target by default. Roll-forward rules do not generally make an older runtime execute an app targeting a newer framework. Verify the runtime selection policy and installed runtime on the host.*

## Misconceptions and edge cases
* **Misconception:** "I need the SDK to run an app."
    * **Correction:** You only need the **Runtime** to run an app. The SDK is only for developers.
* **Misconception:** ".NET Standard is a runtime."
    * **Correction:** .NET Standard is just an API specification. It ensures that libraries can be shared across different .NET implementations (like modern .NET and .NET Framework).
* **Runtime Identifier (RID):** A RID identifies a target platform and selects platform-specific package assets. Self-contained deployment commonly uses a RID, but RID usage is not limited to that mode and exact publishing requirements depend on SDK version and publish settings.

## Knowledge checks with answers

**1. What is the primary difference between the .NET SDK and the .NET Runtime?**
*Answer:* The SDK contains tools for building and developing applications (compilers, CLI), while the Runtime is strictly for executing compiled applications.

**2. Why would you use a Target Framework Moniker (TFM)?**
*Answer:* To define the set of APIs your application can access during build time and to ensure compatibility with the target environment.

**3. True or False: .NET Standard is a replacement for modern .NET.**
*Answer:* False. .NET Standard is an API specification for library compatibility, not a runtime or a replacement for modern .NET.

**4. What is the difference between an LTS and an STS release?**
*Answer:* As of 2026-11-20, .NET 10 LTS and .NET 11 STS are both supported until November 2028. Under Microsoft's current policy, STS lasts 24 months; LTS lasts at least three years or until one year after the next LTS release, whichever is later. Choose based on lifecycle and upgrade constraints; the support-track label does not imply that one release has higher quality.

*Source: [Microsoft .NET Architecture and Lifecycle Documentation](https://learn.microsoft.com/en-us/dotnet/core/introduction)*
