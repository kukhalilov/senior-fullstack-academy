<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine you are building a modern car. A car engine needs fuel, air, and an electrical spark to run. 

In traditional programming, the engine might walk into a factory store, buy its own fuel, and build its own spark plugs. This tight coupling is bad: if you want to test the engine with electric power instead of gas, or if you want to run it without fuel in a laboratory test, you cannot. The engine is permanently glued to those specific parts.

**Dependency Injection (DI)** is a design pattern where an object does not create the things it needs to work. Instead, those things (called **dependencies**) are "injected" (passed) into the object from the outside, usually through its constructor. 

* **Dependency:** Something an object needs to do its job (e.g., a database connection, an email sender).
* **Injection:** Passing that need into the object rather than letting the object create it itself.
* **Configuration:** The settings (like database passwords or API URLs) that tell our app how to behave. In ASP.NET Core, configuration values are loaded from files like `appsettings.json` or environment variables.
* **Logging:** The practice of recording messages about what your program is doing so you can troubleshoot errors later.

Think of DI like a restaurant kitchen. The chef (your C# class) needs knives, ingredients, and a stove. The chef does not forge their own knives or grow their own wheat. The restaurant manager (the ASP.NET Core DI Container) supplies the knives and ingredients to the chef when they start their shift.

---

## How it works

ASP.NET Core has a built-in **Inversion of Control (IoC) Container**. An IoC container is a framework library that manages creating objects and wiring them together automatically.

### The Three Service Lifetimes
When you register a dependency in ASP.NET Core, you must choose its **lifetime**—how long the container should keep that object alive:

1. **Transient (`AddTransient`)**: 
   * A new instance is created *every single time* it is requested. 
   * *Mental model:* Renting a new taxi every time you need to move one block. Use this for lightweight, stateless services.
2. **Scoped (`AddScoped`)**: 
   * A new instance is created *once per HTTP request*. If three different classes ask for this service during the same web request, they all share that same single instance.
   * *Mental model:* Renting a car for the duration of a single road trip. Use this for things like Entity Framework database contexts, which are tied to a web request.
3. **Singleton (`AddSingleton`)**: 
   * A single instance is created the *first* time it is requested, and that exact same instance is used for the entire life of the application.
   * *Mental model:* Buying a house. Everyone in the house shares it forever. Use this for caching, configuration settings, or thread-safe loggers.

### Configuration
ASP.NET Core loads configuration values into a hierarchical tree, typically from `appsettings.json`. You can map these settings to strongly-typed C# classes using the **Options Pattern**, which makes your code safer and easier to test.

### Logging
ASP.NET Core includes a unified logging system (`ILogger<T>`). It supports multiple providers (Console, Debug, Azure App Service) so you can write code once and output logs to the terminal, a file, or a cloud service.

---

## Examples

Below is a complete, runnable ASP.NET Core console application snippet demonstrating Dependency Injection, Configuration, and Logging.

```csharp
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

class Program
{
    static async Task Main(string[] args)
    {
        // 1. Build the host, configuration, and DI container
        using IHost host = Host.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration((context, config) =>
            {
                // Load configuration settings (e.g., from appsettings.json)
                config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            })
            .ConfigureServices((context, services) =>
            {
                // Register configuration options using the Options Pattern
                services.Configure<AppSettings>(context.Configuration.GetSection("AppSettings"));

                // Register our custom services with different lifetimes
                services.AddTransient<IEmailSender, SmtpEmailSender>();
                services.AddScoped<IOrderProcessor, OrderProcessor>();
            })
            .Build();

        // 2. Resolve and run our application logic
        using var scope = host.Services.CreateScope();
        var processor = scope.ServiceProvider.GetRequiredService<IOrderProcessor>();
        await processor.ProcessOrderAsync("Item-123");

        await host.RunAsync();
    }
}

// --- Interfaces and Classes ---

public class AppSettings
{
    public string AdminEmail { get; set; } = "admin@example.com";
    public int MaxRetryAttempts { get; set; } = 3;
}

public interface IEmailSender
{
    void SendEmail(string recipient, string message);
}

public class SmtpEmailSender : IEmailSender
{
    private readonly ILogger<SmtpEmailSender> _logger;

    // Dependency Injection of Logger via Constructor
    public SmtpEmailSender(ILogger<SmtpEmailSender> logger)
    {
        _logger = logger;
    }

    public void SendEmail(string recipient, string message)
    {
        _logger.LogInformation("Sending email to {Recipient} with message: {Message}", recipient, message);
    }
}

public interface IOrderProcessor
{
    Task ProcessOrderAsync(string orderId);
}

public class OrderProcessor : IOrderProcessor
{
    private readonly IEmailSender _emailSender;
    private readonly ILogger<OrderProcessor> _logger;

    // Dependencies (IEmailSender, ILogger) are injected here automatically
    public OrderProcessor(IEmailSender emailSender, ILogger<OrderProcessor> logger)
    {
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task ProcessOrderAsync(string orderId)
    {
        _logger.LogInformation("Starting processing for order: {OrderId}", orderId);
        
        // Simulate work
        await Task.Delay(100);

        _emailSender.SendEmail("customer@example.com", $"Your order {orderId} is processed!");
        
        _logger.LogInformation("Successfully finished order: {OrderId}", orderId);
    }
}
```

---

## Tradeoffs and comparisons

| Approach | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Dependency Injection (DI)** | • Extremely easy to write unit tests (mock dependencies).<br>• Decoupled, maintainable code.<br>• Flexible configuration changes. | • Steeper learning curve for beginners.<br>• Can lead to "Constructor Bloat" if a class needs too many things. |
| **Hardcoded Dependencies (`new` keyword)** | • Simple to understand for tiny scripts.<br>• No setup framework required. | • Impossible to unit test effectively.<br>• Rigid code; changing an implementation requires editing many files. |
| **Singleton Lifetime** | • High performance (zero allocation overhead after creation). | • Dangerous if the service holds state (non-thread-safe state bugs). |
| **Transient Lifetime** | • Safe from state-pollution bugs. | • Higher memory pressure due to constant garbage collection of short-lived objects. |

---

## Interview questions and answers

### 1. What is the difference between `AddTransient`, `AddScoped`, and `AddSingleton`?
* **Answer:** 
  * **Transient:** A brand-new instance is provided every single time it is requested anywhere in the application.
  * **Scoped:** A single instance is created per client HTTP request. All components handling the same request share this instance.
  * **Singleton:** One single instance is created the first time it is requested and persists for the entire lifetime of the application.

### 2. What is a "Captured Dependency" (or Captive Dependency) bug in ASP.NET Core?
* **Answer:** This occurs when a longer-lived service (like a Singleton) depends on a shorter-lived service (like a Scoped service, such as a database context). Because the Singleton lives forever, it captures the Scoped service inside it, preventing that Scoped service from being disposed of properly, which leads to memory leaks and database connection bugs. ASP.NET Core's built-in container throws an exception in development mode if it detects this.

### 3. Why should we log using structured logging placeholders (e.g., `_logger.LogInformation("Processing {Id}", id)`) instead of string interpolation (`$"Processing {id}"`)?
* **Answer:** Structured logging preserves the variable name (`Id`) and its value as data inside log aggregators (like ELK, Datadog, or Azure Application Insights). String interpolation turns everything into a plain text string *before* logging, making it impossible to index, filter, or query logs efficiently by specific property values. Furthermore, avoiding string interpolation saves CPU cycles and memory allocations when logging levels are disabled.

---

## Exercises and solutions

### Exercise 1: Configured Notification Service
Write a C# program using ASP.NET Core DI and Configuration where an `INotificationService` reads a maximum message length setting from an options class. If a message exceeds this length, it logs a warning; otherwise, it logs an information message.

#### Solution
```csharp
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

class SolutionProgram
{
    static void Main(string[] args)
    {
        var inMemorySettings = new Dictionary<string, string?> {
            {"NotificationSettings:MaxLength", "10"}
        };

        IHost host = Host.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration(config => {
                config.AddInMemoryCollection(inMemorySettings);
            })
            .ConfigureServices((context, services) => {
                services.Configure<NotificationSettings>(
                    context.Configuration.GetSection("NotificationSettings"));
                services.AddTransient<INotificationService, NotificationService>();
            })
            .Build();

        var service = host.Services.GetRequiredService<INotificationService>();
        service.Notify("Hello World!"); // Exceeds length of 10
        service.Notify("Hi");             // Under length of 10
    }
}

public class NotificationSettings
{
    public int MaxLength { get; set; }
}

public interface INotificationService
{
    void Notify(string message);
}

public class NotificationService : INotificationService
{
    private readonly NotificationSettings _settings;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(IOptions<NotificationSettings> settings, ILogger<NotificationService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public void Notify(string message)
    {
        if (message.Length > _settings.MaxLength)
        {
            _logger.LogWarning("Message '{Message}' exceeds maximum length of {Max}", message, _settings.MaxLength);
        }
        else
        {
            _logger.LogInformation("Message sent successfully: '{Message}'", message);
        }
    }
}
```

---

## Review questions

1. What is the primary purpose of Dependency Injection in software design?
2. Explain why injecting a Scoped service into a Singleton service is dangerous.
3. How do you retrieve configuration values safely using strongly-typed classes in ASP.NET Core?
4. What is the advantage of structured logging over raw string concatenation?

---

## Sources and limitations

* **Sources:** Based on official Microsoft documentation principles for ASP.NET Core Dependency Injection, Configuration, and Logging. No external hyperlinks are verified or claimed.
* **Limitations:** This document is an introductory foundation. Advanced topics like custom IoC container factories, third-party container replacement (e.g., Autofac), or complex logging scopes are beyond this scope.
