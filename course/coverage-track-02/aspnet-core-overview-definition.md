> **Pilot failed quality review.** This generated sample contains outdated version claims and/or technical errors. It is not ready for study.

<!-- Generated with gemini-3.6-flash; automated review only; source and code verification pending. -->

## Scope and version
This lesson covers the fundamental architecture of ASP.NET Core, including the distinction between the runtime, SDK, and framework. It explores the startup process, dependency injection, middleware, and hosting environments.
*   **Latest Stable Version:** .NET 9.0.
*   **Preview Version:** .NET 10.0 (Introduced early 2025; features are subject to change).
*   **Major Recent Changes:** Transition to the "Minimal Hosting Model" (using `WebApplication`), the introduction of `MapStaticAssets` in .NET 9 for optimized asset delivery, and the integration of Blazor Web Apps as a unified UI model.
*   **Source Check Date:** May 2024 (Updated with .NET 10 preview context from provided sources).

## Simple explanation
To understand ASP.NET Core, you must distinguish between four main components:
1.  **The .NET Runtime:** The "engine" that runs the code. It manages memory (Garbage Collection) and executes intermediate language (IL) code by translating it into instructions the computer's processor understands via a Just-In-Time (JIT) compiler.
2.  **The .NET SDK (Software Development Kit):** The "toolbox" for developers. It includes the runtime plus compilers (like the C# compiler `csc`) and command-line tools (like the `dotnet` CLI) used to build, test, and package applications.
3.  **ASP.NET Core Framework:** A collection of libraries (APIs) specifically designed for building web features, such as handling HTTP requests, rendering HTML, and creating APIs.
4.  **Hosting:** The "environment" where the app lives. This includes the web server (like Kestrel) that listens for incoming internet traffic and manages the application's lifecycle.

**Analogy:** If you are building a car, the **Runtime** is the engine, the **SDK** is the factory and tools used to build it, the **ASP.NET Core Framework** is the blueprint for the car's specific features (GPS, air conditioning), and **Hosting** is the garage and the road where the car actually drives.

## How it works
ASP.NET Core operates as a modular "pipeline." When a user visits your website, the following sequence occurs:

1.  **Initialization:** The `Program.cs` file runs. It uses `WebApplication.CreateBuilder(args)` to set up the "Host."
2.  **Service Registration:** You tell the app which "tools" (services) it will need (e.g., Database access, Logging, Email services). This is called **Dependency Injection (DI)**.
3.  **Building the Pipeline:** You define **Middleware**. Middleware are small pieces of code that handle the request sequentially. One piece might check if the user is logged in; another might log the time of the request.
4.  **The Server (Kestrel):** ASP.NET Core includes a built-in, high-performance server called **Kestrel**. It picks up the HTTP request from the internet, wraps it in an `HttpContext`, and hands it to the middleware pipeline.
5.  **Endpoint Mapping:** The request travels through the pipeline until it matches a "Route" (e.g., `/home` or `/api/products`). The app then executes the specific code for that route and sends a response back.

## Examples

### 1. Minimal API (The modern standard)
This example shows the simplest way to start a web server in .NET 9/10.
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// A simple "Route"
app.MapGet("/", () => "Hello World!");

app.Run();
```

### 2. Dependency Injection (Constructor Injection)
This is how you share logic across your app without creating "spaghetti code."
```csharp
// 1. Define a service
public class WeatherService {
    public string GetWeather() => "Sunny";
}

var builder = WebApplication.CreateBuilder(args);
// 2. Register the service
builder.Services.AddSingleton<WeatherService>(); 

var app = builder.Build();

// 3. Inject and use the service
app.MapGet("/weather", (WeatherService weather) => weather.GetWeather());

app.Run();
```

## API and feature inventory

### WebApplicationBuilder (The Setup)
*   **Purpose:** Configures services and the host.
*   **Key Properties:**
    *   `Services`: An `IServiceCollection` used to register dependencies.
    *   `Configuration`: Used to read settings from `appsettings.json`, environment variables, and command-line arguments.
    *   `Environment`: Checks if the app is in "Development," "Staging," or "Production."

### WebApplication (The App)
*   **Purpose:** Defines the request pipeline and routes.
*   **Key Methods:**
    *   `UseHttpsRedirection()`: Forces the browser to use secure HTTPS.
    *   `MapGet(string pattern, Delegate handler)`: Handles HTTP GET requests.
    *   `MapPost(string pattern, Delegate handler)`: Handles HTTP POST requests.
    *   `Run()`: Starts the application and blocks the calling thread until the host shuts down.
    *   *(Note: Explicit calls to `UseRouting()` are typically omitted in modern Minimal APIs as routing is implicitly managed by endpoint mapping).*

### Hosting Servers (Source: [Introduction to ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/introduction-to-aspnet-core))
*   **Kestrel:** Cross-platform, default server. High performance.
*   **IIS HTTP Server:** Windows-only, runs inside the Internet Information Services process (often used in a reverse-proxy configuration where IIS forwards requests to Kestrel).
*   **HTTP.sys:** Windows-only, used for specific scenarios like kernel-mode authentication, port sharing, or raw performance on Windows without IIS.

## Tradeoffs and comparisons

| Feature | ASP.NET Core (Modern) | ASP.NET (Legacy/Framework) |
| :--- | :--- | :--- |
| **Platform** | Cross-platform (Windows, Linux, macOS) | Windows Only |
| **Performance** | High (Top of TechEmpower benchmarks) | Moderate |
| **Hosting** | Self-hosted (Kestrel) or IIS (as reverse proxy) | Requires IIS (`System.Web`) |
| **Architecture** | Modular (NuGet packages) | Monolithic (Large DLLs) |
| **Startup** | `Program.cs` (Unified) | `Global.asax` and `Web.config` |

**Minimal APIs vs. Controllers:**
*   **Minimal APIs:** Best for small microservices and performance-critical endpoints. Less "boilerplate" code.
*   **Controllers (MVC):** Best for large, complex applications where grouping related actions (like all "Account" actions) into one class is beneficial for organization.

## Interview questions and answers

**Q1: What is the difference between the .NET SDK and the .NET Runtime?**
*   **Answer:** The Runtime is required to *run* an existing application; it includes the virtual machine, Just-In-Time compiler, and garbage collector. The SDK includes the Runtime plus the tools (compilers, CLI) required to *build* and compile applications. You cannot develop apps with just the Runtime.

**Q2: What is Middleware in ASP.NET Core?**
*   **Answer:** Middleware is software assembled into an app pipeline to handle requests and responses. Each component chooses whether to pass the request to the next component in the pipeline and can perform work before and after the next component is invoked.

**Q3: Explain the "Dependency Injection" lifetimes.**
*   **Answer:** 
    *   **Transient:** A new instance is created every time it is requested.
    *   **Scoped:** A new instance is created once per client request (e.g., once per HTTP web request in web applications).
    *   **Singleton:** One single instance is created the first time it is requested and shared everywhere for the lifetime of the app.

## Exercises and solutions

### Exercise 1: Custom Middleware
**Task:** Create a piece of middleware that prints "Request Received" to the console for every incoming request.

**Solution:**
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Custom Middleware
app.Use(async (context, next) => 
{
    Console.WriteLine("Request Received");
    await next.Invoke(); // Call the next piece of middleware
});

app.MapGet("/", () => "Check your console!");
app.Run();
```

### Exercise 2: DSA Problem (C# Collection Processing)
**Problem:** Given a list of integers representing request response times in milliseconds, write a function to find the "Moving Average" of the last $k$ requests (e.g., the last 3 requests).
*   **Input:** `int[] times = { 100, 200, 300, 400, 500 };`, `int k = 3;`
*   **Expected Output for the last 3:** `(300 + 400 + 500) / 3 = 400.0`

**Solution:**
```csharp
public double GetMovingAverage(int[] times, int k) {
    if (times == null || k <= 0 || times.Length < k) return 0.0;
    double sum = 0;
    for (int i = times.Length - k; i < times.Length; i++) {
        sum += times[i];
    }
    return sum / k;
}
```
*   **Complexity:** $O(k)$ time complexity where $k$ is the window size, and $O(1)$ auxiliary space.
*   **Edge Case:** If the array is null, $k \le 0$, or the array length is less than $k$, return `0.0` to prevent exceptions or incorrect calculations.

## Review questions
1.  Which server is the default, cross-platform server for ASP.NET Core?
2.  In which file are services and the middleware pipeline typically configured in modern .NET?
3.  True or False: ASP.NET Core requires IIS to run on Linux.
4.  What is the purpose of `app.UseHttpsRedirection()`?

## Sources and limitations
*   [Overview of ASP.NET Core - Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/introduction-to-aspnet-core)
*   [ASP.NET Core Fundamentals - Microsoft Learn](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/)

**Limitations:** This lesson does not cover Entity Framework Core (Database) or specific Authentication providers (like IdentityServer or ASP.NET Core Identity), as these are separate deep-dive tracks.

## Gaps and follow-up
*   **Unexamined Members:** This lesson did not detail the `IHostApplicationLifetime` interface or advanced `Kestrel` socket configuration.
*   **Follow-up:** To continue your journey, study **Entity Framework Core** for data persistence and **ASP.NET Core Identity** for user management.
