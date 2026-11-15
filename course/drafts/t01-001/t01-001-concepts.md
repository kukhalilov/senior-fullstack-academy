<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# .NET platform vs runtime vs SDK vs framework and alternatives — Core concepts and how they fit together

*This is an automatically generated draft.*

# .NET Platform: Concepts, Runtimes, and SDKs

## Learning objectives
* Distinguish between the .NET SDK, the .NET runtime, and the .NET platform.
* Understand the role of Target Framework Monikers (TFMs) in build and deployment.
* Identify the differences between modern .NET and legacy .NET Framework.
* Recognize how .NET compares to other ecosystems like Java, Node.js, and Go.

## Prerequisites
* Basic familiarity with the concept of "compiling" code (turning human-readable text into machine-executable instructions).
* Awareness that software requires an environment (a "runtime") to execute.

## Core concepts
The .NET platform is a collection of tools, libraries, and runtime environments that allow you to build and run applications. To understand how it works, think of it like a **construction site**:

1.  **The .NET SDK (The Construction Crew):** This is the toolkit you install on your computer. It includes the compiler (which turns your code into Intermediate Language or IL), the `dotnet` command-line interface (CLI), and tools to package your code for distribution.
2.  **The .NET Runtime (The Engine):** This is the environment that actually executes your code. It manages memory, handles security, and translates the IL into machine-specific instructions.
3.  **The Base Class Library (BCL):** A massive collection of pre-written code (for file access, networking, math, etc.) that comes with the platform so you don't have to write everything from scratch.
4.  **Target Framework (The Blueprint):** When you build an app, you specify a "Target Framework" (e.g., `net11.0`). This tells the compiler which set of APIs you are allowed to use.

## Mechanisms and relationships
The relationship between these parts is defined by the **Build-time vs. Runtime** boundary:

*   **At Build-time:** You use the **SDK**. You define a **Target Framework Moniker (TFM)** in your project file (e.g., `<TargetFramework>net11.0</TargetFramework>`). This ensures your code is compatible with the libraries available in that version.
*   **At Runtime:** The **Runtime** executes your application. You can choose to use a "Framework-dependent" deployment (where the user must have the .NET runtime installed) or a "Self-contained" deployment (where you bundle the runtime with your app).

**Key distinction:** The SDK version you use to build your app does not have to match the runtime version on the server, provided your code is compatible with the target framework you selected.

## Worked examples
Imagine you are building a simple console application:

1.  **Development:** You use the **.NET SDK** to create a project. You set your `TargetFramework` to `net10.0`.
2.  **Compilation:** You run the `dotnet build` command. The **C# compiler** reads your code and produces an assembly (a file containing IL).
3.  **Deployment:** You choose **Self-contained deployment**. The SDK bundles your assembly *plus* the necessary **.NET runtime** files into a single folder.
4.  **Execution:** You move that folder to a computer that has *no* .NET installed. Because you bundled the runtime, the application runs perfectly.

## Misconceptions and edge cases
*   **Misconception: ".NET Standard is a runtime."**
    *   *Correction:* .NET Standard is just an API specification. It is a "contract" that libraries use to ensure they can run on multiple different .NET implementations (like modern .NET or .NET Framework). It does not execute code.
*   **Misconception: "I need to install the SDK on my production server."**
    *   *Correction:* You only need the **Runtime** on production servers. The SDK is for developers; the Runtime is for users/servers.
*   **Edge Case: Roll-forward policy.**
    *   By default, if you target .NET 10, the runtime might "roll-forward" to a newer patch version (like 10.0.1) if it is available, as these are generally compatible.

## Knowledge checks with answers

**1. What is the primary difference between the .NET SDK and the .NET Runtime?**
*   *Answer:* The SDK contains the tools to build and develop applications (compiler, CLI), while the Runtime is the engine that executes the application.

**2. Why would you use a Target Framework Moniker (TFM)?**
*   *Answer:* To specify which set of APIs your application is built against, ensuring compatibility between your code and the libraries you use.

**3. What is the difference between modern .NET and .NET Framework?**
*   *Answer:* Modern .NET (formerly .NET Core) is the current, cross-platform, open-source implementation. .NET Framework is a legacy, Windows-only implementation kept in maintenance mode.

**4. If you want your application to run on a machine without .NET pre-installed, which deployment type should you choose?**
*   *Answer:* A self-contained deployment.

*Source: [Microsoft .NET Architecture Documentation](https://learn.microsoft.com/en-us/dotnet/core/introduction)*
