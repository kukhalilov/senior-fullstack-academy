
# .NET platform vs runtime vs SDK vs framework and alternatives — Big-picture orientation and mental model

# Problem and purpose
When starting with .NET, developers often encounter a confusing array of terms: SDK, runtime, framework, and platform. These terms represent different parts of the development lifecycle. Without understanding these boundaries, it is difficult to know why a project builds on one machine but fails on another, or how to properly deploy an application to a server. This lesson clarifies these roles to help you make informed decisions about development environments and deployment strategies.

# Plain-language mental model
Think of .NET as a **construction site**:
*   **The SDK (Software Development Kit)** is your **toolbox and blueprints**. It contains everything you need to build, test, and package your application.
*   **The Runtime** is the **factory floor**. It is the environment where your finished application actually runs.
*   **The Target Framework** is the **set of building codes**. It defines which tools and materials (APIs) you are allowed to use.
*   **The Platform** is the **entire organization** that provides the tools, the factory, and the building codes to ensure your application works consistently.

# How the parts fit together
The .NET platform is a collection of components that work in a sequence:
1.  **Development:** You use the **.NET SDK** (which includes the compiler and CLI tools) to write code against a specific **Target Framework**.
2.  **Build:** The compiler turns your code into **Intermediate Language (IL)**.
3.  **Execution:** In the usual JIT-based deployment, the .NET runtime loads the IL and JIT-compiles methods to native machine code as needed. Other deployment modes, such as ReadyToRun and Native AOT, change when and how native code is produced.
4.  **Deployment:** You decide whether to include the runtime with your app (**Self-contained**) or rely on a runtime already installed on the host machine (**Framework-dependent**).

# Concept map
*   **Platform:** The umbrella for all .NET components.
*   **SDK vs. Runtime:** The SDK is for building; the runtime is for executing.
*   **Target Framework (TFM):** A label (e.g., `net11.0`) that tells the compiler which APIs are available.
*   **Runtime Identifier (RID):** A label that tells the system which specific operating system and processor architecture (e.g., `linux-x64`) your app targets.
*   **Deployment:** The choice between bundling the runtime or expecting it to be present.

# End-to-end walkthrough
Imagine you are building a simple console application:
1.  **Setup:** You install the .NET SDK. Running `dotnet --list-sdks` confirms your tools are ready.
2.  **Project Creation:** You create a project file (`.csproj`) and set the `TargetFramework` to `net11.0`. This tells the compiler to use the API contract for .NET 11.
3.  **Build:** You run the build command. The SDK uses the compiler to turn your C# code into IL.
4.  **Run:** You execute the app. The `dotnet` executable invokes the runtime, which loads your IL and executes it.
5.  **Publish:** You decide to deploy. A self-contained publish includes the .NET runtime needed by the app, so a separate shared .NET runtime installation is not required. It still depends on a compatible operating system, architecture, native dependencies, and configuration.

# When to use it and tradeoffs
*   **Modern .NET:** It is Microsoft's primary cross-platform implementation and a common choice for new applications; verify workload, platform, library, and lifecycle requirements for the specific project.
*   **.NET Framework:** It remains a supported Windows implementation for existing applications and Windows-specific workloads; evaluate migration requirements rather than treating it as an unsupported product.
*   **LTS vs. STS:** As of 2026-11-20, .NET 10 is LTS and .NET 11 is STS; both are supported through November 2028. STS support is 24 months, while LTS is at least 3 years or one year after the next LTS ships if later. Microsoft states the release quality is the same; choose from lifecycle and application upgrade needs.
*   **Tradeoff:** Self-contained deployments include the runtime and are usually larger; framework-dependent deployments rely on a compatible installed runtime and can simplify centralized runtime servicing. Neither packaging mode makes an app portable across incompatible OSes or architectures.

# What later lessons cover
*   **C# Syntax and Source Structure:** How to write the actual code (t01-002).
*   **Tooling and CLI:** Detailed commands for building and managing projects.
*   **Runtime Internals:** How the JIT (Just-In-Time) compiler and memory management work (t01-019).
*   **Application Stacks:** Specifics for ASP.NET Core, MAUI, and desktop frameworks.

*Source: [Microsoft .NET architecture, framework targeting, deployment, and lifecycle documentation](https://learn.microsoft.com/en-us/dotnet/core/introduction)*
