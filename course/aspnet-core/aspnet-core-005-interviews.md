<!-- Generated with gemini-3.1-flash-lite; automated review only; source and code verification pending. -->

The draft has been reviewed for technical accuracy, clarity, and completeness. Key improvements include clarifying the "Captive Dependency" explanation, adding the missing solution for the review question, and refining the DI/Service Locator comparison.

---

## Simple explanation

**Dependency Injection (DI)** is a design pattern where a class receives the objects it needs (its "dependencies") from an external source rather than creating them itself. Think of it like a restaurant: the chef doesn't grow their own vegetables; they are provided by suppliers. This makes the code easier to test and change because you can swap the "supplier" (implementation) without changing the "chef" (class).

**Logging** is the practice of recording events, errors, or data points during the execution of an application. It is essential for troubleshooting when things go wrong in production.

In ASP.NET Core, these two concepts are built into the framework. You configure them in the `Program.cs` file, allowing your services to "ask" for a logger or a database connection without needing to know how those things are created.

---

## How it works

### Dependency Injection
ASP.NET Core uses an **IoC (Inversion of Control) Container**.
1. **Registration:** You tell the container which interface maps to which concrete class (e.g., "Whenever someone asks for `IMyService`, give them `MyService`").
2. **Resolution:** When a class (like a Controller) needs a service, it requests it via its **Constructor**. The container automatically creates the instance and injects it.

### Logging
Logging is provided via the `ILogger<T>` interface. The framework automatically injects a logger configured with the category `T` (usually the name of the class). You can then call methods like `LogInformation()`, `LogWarning()`, or `LogError()`.

---

## Examples

### DI Configuration
In `Program.cs`:
```csharp
var builder = WebApplication.CreateBuilder(args);

// Registering a service
// Transient: Created every time it is requested
builder.Services.AddTransient<IMyService, MyService>();

var app = builder.Build();
```

### Using DI and Logging in a Controller
```csharp
public class HomeController : Controller
{
    private readonly IMyService _service;
    private readonly ILogger<HomeController> _logger;

    // Constructor Injection
    public HomeController(IMyService service, ILogger<HomeController> logger)
    {
        _service = service;
        _logger = logger;
    }

    public IActionResult Index()
    {
        _logger.LogInformation("Index page accessed.");
        var data = _service.GetData();
        return View(data);
    }
}
```

---

## Tradeoffs and comparisons

| Feature | DI (Dependency Injection) | Service Locator Pattern |
| :--- | :--- | :--- |
| **Visibility** | Dependencies are explicit in the constructor. | Dependencies are hidden inside the method. |
| **Testability** | Easy to mock dependencies. | Hard to mock; requires global state. |
| **Coupling** | Low coupling. | High coupling to the container. |

**Logging Tradeoffs:**
* **Structured Logging:** Using templates (e.g., `_logger.LogInformation("User {Id} logged in", userId)`) allows tools like ELK or Azure Monitor to index the `Id` property for efficient searching.
* **Performance:** Excessive logging can slow down an application and increase storage costs. Always use log levels (`Debug`, `Information`, `Error`) to filter noise.

---

## Interview questions and answers

**Q1: What are the three service lifetimes in ASP.NET Core DI?**
* **Answer:** 
    1. **Transient:** Created every time they are requested.
    2. **Scoped:** Created once per client request (HTTP request).
    3. **Singleton:** Created once the first time they are requested and reused throughout the app's lifetime.

**Q2: What is the "Captive Dependency" problem?**
* **Answer:** This occurs when a service with a longer lifetime (e.g., Singleton) holds a reference to a service with a shorter lifetime (e.g., Scoped). Because the Singleton lives for the entire application duration, it "captures" the Scoped service, preventing it from being disposed of correctly and potentially leading to stale data or memory leaks.

**Q3: Why should we use `ILogger<T>` instead of `Console.WriteLine`?**
* **Answer:** `ILogger` supports multiple "sinks" (destinations like files, cloud logs, or databases), allows for dynamic log filtering by level, and provides structured data for better searching and analysis.

---

## Exercises and solutions

**Problem:** Create a `Scoped` service that generates a unique ID. Inject it into a controller and verify that the ID remains the same during one request but changes across different requests.

**Solution:**
1. **Interface:** `public interface IGuidService { Guid Id { get; } }`
2. **Implementation:** `public class GuidService : IGuidService { public Guid Id { get; } = Guid.NewGuid(); }`
3. **Registration:** `builder.Services.AddScoped<IGuidService, GuidService>();`
4. **Verification:** Inject `IGuidService` into a controller. Refresh the page; the ID will remain constant for that specific request, but will change upon the next page refresh.

---

## Review questions

1. **Can you inject a service into a static class?**
   * **Answer:** No. Static classes cannot be instantiated, and therefore cannot have constructors for dependency injection. You must use a non-static class or a different pattern (like the Service Locator, though it is generally discouraged).
2. **What happens if you try to resolve a service that hasn't been registered?**
   * **Answer:** The DI container will throw an `InvalidOperationException` at runtime when it attempts to instantiate the class requiring the missing dependency.
3. **How do you change the minimum log level in `appsettings.json`?**
   * **Answer:** Modify the `Logging` section:
     ```json
     "Logging": {
       "LogLevel": {
         "Default": "Warning",
         "Microsoft.AspNetCore": "Information"
       }
     }
     ```

---

## Sources and limitations

* **Sources:** This content is based on standard ASP.NET Core documentation and common industry practices.
* **Uncertainty:** DI container performance can vary based on the complexity of the object graph. While `Microsoft.Extensions.DependencyInjection` is standard, third-party containers (like Autofac) offer more advanced features but add complexity.
* **Limitations:** This guide covers the basics. Advanced topics like "Service Decorators," "Keyed Services" (introduced in .NET 8), and "Factory Registration" are not covered here.
