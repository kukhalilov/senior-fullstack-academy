<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# .NET platform vs runtime vs SDK vs framework and alternatives — Interview questions and reasoning

*This is an automatically generated draft.*

# Core questions

*   **What is the difference between the .NET SDK and the .NET runtime?**
    The SDK (Software Development Kit) includes the tools required to build, test, and publish applications (compilers, CLI, NuGet package manager). The runtime is the minimal set of components required to execute an already-compiled application.
*   **What is a Target Framework Moniker (TFM)?**
    A TFM is a unique identifier (e.g., `net11.0`) that specifies the set of APIs available to your application at compile time. It ensures your code is compatible with the intended environment.
*   **What distinguishes modern .NET from .NET Framework?**
    Modern .NET is the open-source, cross-platform successor to .NET Core. .NET Framework is a legacy, Windows-only implementation maintained for existing applications.
*   **What is the difference between Framework-dependent and Self-contained deployment?**
    Framework-dependent deployment relies on a shared runtime installed on the host machine, resulting in smaller binaries. Self-contained deployment includes the runtime within the application folder, allowing it to run on machines without .NET installed.

# Concise interview answers

*   **Why use .NET Standard?**
    Use .NET Standard only when you need to share a library across different .NET implementations (e.g., both modern .NET and .NET Framework). For new applications, target modern .NET directly.
*   **What is the role of the Runtime Identifier (RID)?**
    The RID specifies the target operating system and CPU architecture (e.g., `win-x64`, `linux-arm64`). It is used for platform-specific builds and self-contained deployments.
*   **What is the difference between LTS and STS releases?**
    LTS (Long Term Support) releases receive support for three years, making them ideal for stable, long-term production environments. STS (Standard Term Support) releases receive support for 18 months, providing faster access to new features.

# Deep follow-up answers

*   **How does the build chain handle compatibility?**
    At build time, the compiler uses the TFM to reference the correct Base Class Library (BCL) contracts. During execution, the runtime uses a "roll-forward" policy to determine if the installed runtime version is compatible with the version the application was built against.
*   **When should you choose Native AOT?**
    Native AOT (Ahead-of-Time) compilation compiles code to native machine code during the build process. This is ideal for scenarios requiring fast startup times and low memory footprints, such as serverless functions or CLI tools, though it imposes constraints on dynamic features like reflection.

# Scenario questions

*   **Scenario:** You are deploying a web service to a containerized environment. Which deployment model do you choose?
    **Answer:** Framework-dependent deployment is usually preferred for containers because the runtime can be included in the base container image, keeping the application image small and allowing for easier security patching of the runtime.
*   **Scenario:** You need to build a library that works on both legacy Windows apps and modern cloud services. What do you target?
    **Answer:** You should target a .NET Standard version (e.g., `netstandard2.0`) to ensure the widest compatibility across implementation families.

# Tradeoffs and alternatives

| Comparison | Tradeoff |
| :--- | :--- |
| **.NET vs. Java/JVM** | .NET offers a unified language/tooling experience (C#); Java/JVM has a massive, mature ecosystem with diverse language support (Kotlin, Scala). |
| **.NET vs. Node.js** | .NET provides high-performance, multi-threaded execution; Node.js excels at I/O-bound tasks with a non-blocking, event-driven model. |
| **.NET vs. Go** | Go produces simple, static binaries with fast compilation; .NET offers a richer standard library and more robust object-oriented features. |

# Common weak answers

*   **"The SDK and runtime are the same thing."** (Weak: Ignores that the SDK is for development and the runtime is for execution.)
*   **"I should always use the latest STS release."** (Weak: Ignores the stability benefits of LTS releases for production environments.)
*   **"Targeting .NET Standard is always the best practice."** (Weak: .NET Standard is for library compatibility; modern applications should target a specific .NET version.)

# Self-check rubric

*   **Can you explain the difference between build-time (SDK) and run-time (Runtime)?** If not, review the "platform-components-and-build-chain" section.
*   **Do you understand why you would choose LTS over STS?** If not, review the "implementations-frameworks-and-targets" section.
*   **Can you describe the purpose of a TFM?** If not, review the "implementations-frameworks-and-targets" section.
*   **Are you able to identify when to use Native AOT?** If not, review the "app-stacks-and-deployment-shapes" section.

*Source: [Microsoft .NET architecture, framework targeting, deployment, and lifecycle documentation](https://learn.microsoft.com/en-us/dotnet/core/introduction), [Frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks), [Releases and support](https://learn.microsoft.com/en-us/dotnet/core/releases-and-support).*
