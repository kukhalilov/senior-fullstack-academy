<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# .NET platform vs runtime vs SDK vs framework and alternatives — Big-picture orientation and mental model

# .NET Platform, Runtime, SDK, and Framework Overview

*Draft: Automatically generated.*

### Problem and purpose
When building software, developers often confuse the tools used to write code with the environment required to run it. The .NET ecosystem consists of multiple layers—compilers, runtimes, SDKs, and frameworks—that serve different purposes at different stages of the development lifecycle. This lesson clarifies these boundaries to help you understand how to build, target, and deploy applications effectively.

### Plain-language mental model
Think of .NET as a construction site:
*   **The SDK (Software Development Kit)** is your **toolbox**. It contains the compiler, the command-line interface (CLI), and the tools needed to build your project.
*   **The Runtime** is the **engine** that powers your application once it is built. It manages memory, handles garbage collection, and executes your code.
*   **The Target Framework** is the **blueprint**. It defines which set of APIs (the "contract") your application is allowed to use.
*   **The Application Framework** (like ASP.NET Core) is the **pre-built structure** (like a kitchen or bathroom) that provides specialized functionality for specific types of apps.

### How the parts fit together
The development process follows a clear flow:
1.  **Build Time:** You use the **.NET SDK** to compile your source code into **Intermediate Language (IL)**. During this phase, you specify a **Target Framework Moniker (TFM)** (e.g., `net10.0`) to tell the compiler which APIs are available.
2.  **Deployment:** You decide how to package your app. In **Framework-dependent deployment**, the app relies on a runtime installed on the host machine. In **Self-contained deployment**, you bundle the runtime with your app.
3.  **Runtime:** When the user runs the app, the **.NET Runtime** (such as CoreCLR) loads the IL, translates it into machine code, and executes it.

### Concept map
*   **Platform:** The umbrella term for the entire ecosystem (modern .NET vs. .NET Framework).
*   **SDK vs. Runtime:** The SDK is for developers (building); the runtime is for execution (running).
*   **TFM (Target Framework Moniker):** A label that ensures your code uses compatible APIs.
*   **Deployment:** The choice between requiring a pre-installed runtime or bundling one.
*   **Lifecycle:** The distinction between **LTS (Long Term Support)** releases (stable for years) and **STS (Standard Term Support)** releases (faster innovation).

### End-to-end walkthrough
1.  **Initialization:** You create a project using the **.NET CLI**. The project file (`.csproj`) defines the `TargetFramework`.
2.  **Restore:** The **NuGet package manager** downloads the necessary libraries based on your TFM.
3.  **Build:** The **C# compiler** turns your code into IL.
4.  **Publish:** You create a deployment folder. If you choose **Self-contained**, the SDK copies the necessary runtime files into your output folder.
5.  **Execution:** The user runs the `dotnet` executable, which invokes the runtime to execute your application.

### When to use it and tradeoffs
*   **Modern .NET:** Use for all new cross-platform development. It is open-source and receives regular updates.
*   **.NET Framework:** Use only for maintaining legacy Windows-only applications.
*   **LTS vs. STS:** Choose **LTS** (e.g., .NET 10) for enterprise stability; choose **STS** (e.g., .NET 11) if you need the latest features and can update frequently.
*   **Deployment:** **Framework-dependent** results in smaller file sizes but requires the user to have the runtime installed. **Self-contained** makes the app portable but increases the file size significantly.

### What later lessons cover
*   **C# Syntax and Structure:** How to write the actual code (t01-002).
*   **Tooling:** Detailed usage of the .NET CLI and MSBuild properties.
*   **Runtime Internals:** Deep dives into JIT (Just-In-Time) compilation, AOT (Ahead-Of-Time) compilation, and memory management (t01-019).
*   **Workloads:** Specific guides for ASP.NET Core, MAUI, and other application stacks.

*Source: [Microsoft .NET architecture, framework targeting, deployment, and lifecycle documentation](https://learn.microsoft.com/en-us/dotnet/core/introduction)*
