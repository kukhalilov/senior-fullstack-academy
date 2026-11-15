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
The .NET platform is a collection of tools, libraries, and runtime environments that allow you to build and run applications. Think of it like a kitchen:
* **The Language (C#):** The recipe.
* **The SDK (Software Development Kit):** The collection of tools (knives, pans, oven) used to prepare the meal.
* **The Runtime:** The actual environment where the meal is cooked and served.
* **The Framework:** A pre-made set of ingredients (libraries) you can use so you don't have to start from scratch.

### Key Components
1. **.NET SDK:** Contains everything you need to *develop* apps. It includes the compiler, the .NET CLI (command-line interface), and the runtime components needed to test your code.
2. **.NET Runtime:** The engine that executes your code. You only need this on a machine where you want to *run* an application, not necessarily develop one.
3. **Target Framework Moniker (TFM):** A string (e.g., `net11.0`) that tells the compiler which set of APIs your application is allowed to use.
4. **Modern .NET vs. .NET Framework:** Modern .NET is the current, cross-platform, open-source implementation. .NET Framework is an older, Windows-only implementation kept for legacy support.

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

*Note: If you try to run an app targeting `net11.0` on a machine that only has the `net8.0` runtime, it may fail unless a "roll-forward" policy is configured to allow newer runtimes to execute older code.*

## Misconceptions and edge cases
* **Misconception:** "I need the SDK to run an app." 
    * **Correction:** You only need the **Runtime** to run an app. The SDK is only for developers.
* **Misconception:** ".NET Standard is a runtime."
    * **Correction:** .NET Standard is just an API specification. It ensures that libraries can be shared across different .NET implementations (like modern .NET and .NET Framework).
* **Edge Case:** **Runtime Identifiers (RID).** While the TFM handles API compatibility, the RID handles platform-specific details (e.g., `linux-x64` vs `win-arm64`). You need an RID if you are doing a "Self-contained" deployment.

## Knowledge checks with answers

**1. What is the primary difference between the .NET SDK and the .NET Runtime?**
*Answer:* The SDK contains tools for building and developing applications (compilers, CLI), while the Runtime is strictly for executing compiled applications.

**2. Why would you use a Target Framework Moniker (TFM)?**
*Answer:* To define the set of APIs your application can access during build time and to ensure compatibility with the target environment.

**3. True or False: .NET Standard is a replacement for modern .NET.**
*Answer:* False. .NET Standard is an API specification for library compatibility, not a runtime or a replacement for modern .NET.

**4. What is the difference between an LTS and an STS release?**
*Answer:* LTS (Long Term Support) releases are supported for a longer duration (typically 3 years), making them ideal for stable, long-term projects. STS (Standard Term Support) releases have a shorter support lifecycle and are for users who want the latest features quickly.

*Source: [Microsoft .NET Architecture and Lifecycle Documentation](https://learn.microsoft.com/en-us/dotnet/core/introduction)*
