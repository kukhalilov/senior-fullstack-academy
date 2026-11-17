<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# .NET platform vs runtime vs SDK vs framework and alternatives — Interview questions and reasoning

*This is an automatically generated draft.*

# Core questions

*   **What is the difference between the .NET SDK and the .NET runtime?**
    The SDK (Software Development Kit) includes the tools required to build, test, and publish applications (compilers, CLI, NuGet package manager). The runtime is the minimal set of components required to execute an already-compiled application.
*   **What is a Target Framework Moniker (TFM)?**
    A TFM is a unique identifier (e.g., `net11.0`) that specifies the set of APIs available to your application at compile time. It ensures your code is compatible with the intended environment.
*   **What distinguishes modern .NET from .NET Framework?**
    Modern .NET is Microsoft's primary cross-platform implementation. .NET Framework is a separate Windows-only implementation that remains supported under its lifecycle and is commonly encountered in existing or Windows-specific applications.
*   **What is the difference between Framework-dependent and Self-contained deployment?**
    Framework-dependent deployment requires a compatible shared runtime on the host and often reduces app-specific runtime payload. Self-contained deployment includes the runtime for its target platform, but still requires a compatible OS, architecture, and native dependencies; neither mode guarantees the app will run on arbitrary machines.

# Concise interview answers

*   **Why use .NET Standard?**
    Use .NET Standard only when you need to share a library across different .NET implementations (e.g., both modern .NET and .NET Framework). For new applications, target modern .NET directly.
*   **What is the role of the Runtime Identifier (RID)?**
    The RID specifies the target operating system and CPU architecture (e.g., `win-x64`, `linux-arm64`). It is used for platform-specific builds and self-contained deployments.
*   **What is the difference between LTS and STS releases?**
    Under current Microsoft policy, STS releases have 24 months of support. LTS releases have a minimum of three years or one year after the next LTS release, whichever is later. As of 2026-11-17, .NET 10 LTS and .NET 11 STS are both supported until November 2028.

# Deep follow-up answers

*   **How does the build chain handle compatibility?**
    At build time, the TFM determines the API surface and package assets used. At execution, framework-dependent apps use runtime selection and roll-forward rules to find an acceptable installed runtime; self-contained apps carry the selected runtime. SDK selection is a separate policy.
*   **When should you choose Native AOT?**
    Native AOT (Ahead-of-Time) compilation compiles code to native machine code during the build process. This is ideal for scenarios requiring fast startup times and low memory footprints, such as serverless functions or CLI tools, though it imposes constraints on dynamic features like reflection.

# Scenario questions

*   **Scenario:** You are deploying a web service to a containerized environment. Which deployment model do you choose?
    **Answer:** Framework-dependent deployment is usually preferred for containers because the runtime can be included in the base container image, keeping the application image small and allowing for easier security patching of the runtime.
*   **Scenario:** You need to build a library that works on both legacy Windows apps and modern cloud services. What do you target?
    **Answer:** First identify the actual consumer implementations and APIs required. If the library must share one API contract with .NET Framework and modern .NET, `netstandard2.0` may fit; otherwise multi-targeting specific TFMs can expose a more suitable API surface. `.NET Standard` is not automatically the widest or best choice.

# Tradeoffs and alternatives

| Comparison | Tradeoff |
| :--- | :--- |
| **.NET vs. Java/JVM** | Both offer managed runtimes, garbage collection, mature libraries, and multiple language choices. Compare concrete framework, deployment, support, interoperability, and team needs. |
| **.NET vs. Node.js** | Node.js is an asynchronous event-driven JavaScript runtime designed for network applications. .NET offers several execution and concurrency models. Benchmark the actual workload and account for libraries and operations. |
| **.NET vs. Go** | Go is statically typed and compiles to machine code with a garbage-collected runtime; .NET provides managed IL/JIT and AOT options. Startup, throughput, artifact size, and ecosystem fit are workload-dependent. |

# Common weak answers

*   **"The SDK and runtime are the same thing."** (Weak: Ignores that the SDK is for development and the runtime is for execution.)
*   **"STS only has 18 months of support, so it is always riskier than LTS."** (Weak: Support windows change; check the current policy and actual release dates.)
*   **"Targeting .NET Standard is always the best practice."** (Weak: .NET Standard is for library compatibility; modern applications should target a specific .NET version.)

# Self-check rubric

*   **Can you explain the difference between build-time (SDK) and run-time (Runtime)?** If not, review the "platform-components-and-build-chain" section.
*   **Do you understand why you would choose LTS over STS?** If not, review the "implementations-frameworks-and-targets" section.
*   **Can you describe the purpose of a TFM?** If not, review the "implementations-frameworks-and-targets" section.
*   **Are you able to identify when to use Native AOT?** If not, review the "app-stacks-and-deployment-shapes" section.

*Source: [Microsoft .NET architecture, framework targeting, deployment, and lifecycle documentation](https://learn.microsoft.com/en-us/dotnet/core/introduction), [Frameworks](https://learn.microsoft.com/en-us/dotnet/standard/frameworks), [Releases and support](https://learn.microsoft.com/en-us/dotnet/core/releases-and-support).*
