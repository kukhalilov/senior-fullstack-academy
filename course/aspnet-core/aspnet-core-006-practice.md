<!-- Generated with gemini-3.1-flash-lite; automated review only; source and code verification pending. -->

The provided draft was accurate in its core concepts but lacked nuance regarding modern .NET features (like `MapGroup` for organization) and slightly understated the feature parity between the two approaches. I have refined the text for clarity, technical accuracy, and completeness.

---

## Simple explanation

In ASP.NET Core, **Controllers** and **Minimal APIs** are two distinct programming models used to build HTTP-based web services.

*   **Controllers:** A "Class-based" approach. You group related endpoints into a single class that inherits from `ControllerBase`. It is the traditional, feature-rich framework that relies on conventions and attributes.
*   **Minimal APIs:** A "Functional" approach. You define endpoints directly in the `Program.cs` file (or extension methods) using lambda expressions. It is designed for reduced boilerplate and high performance, making it ideal for microservices and cloud-native applications.

---

## How it works

### Controllers
Controllers rely on **Attribute Routing** and **Convention-based discovery**.
*   **Dependency Injection (DI):** Services are injected via the class constructor.
*   **Structure:** Typically requires a structured folder layout (e.g., `Controllers/`) to keep code maintainable.
*   **Features:** Built-in support for complex model binding, action filters, and automatic validation.

### Minimal APIs
Minimal APIs use **Route Handlers** defined directly in the request pipeline.
*   **Dependency Injection:** Services are injected directly into the handler's parameters (method injection).
*   **Structure:** While they can live in `Program.cs`, they can be organized using `MapGroup` or extension methods to prevent clutter.
*   **Features:** Supports most features (Filters, OpenAPI, Authorization), but requires more explicit configuration compared to the "magic" of Controllers.

---

## Examples

### Controller Approach
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase {
    [HttpGet("{id}")]
    public IActionResult GetUser(int id) => Ok($"User {id}");
}
```

### Minimal API Approach
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Using MapGroup for better organization
var userGroup = app.MapGroup("/users");
userGroup.MapGet("/{id}", (int id) => Results.Ok($"User {id}"));

app.Run();
```

---

## Tradeoffs and comparisons

| Feature | Controllers | Minimal APIs |
| :--- | :--- | :--- |
| **Boilerplate** | High (Classes, Attributes) | Low (Inline lambdas) |
| **Performance** | High (but slightly more overhead) | Highest (minimal abstraction) |
| **Organization** | Built-in (Class-based) | Requires manual effort (MapGroup) |
| **Validation** | Automatic (`[ApiController]`) | Manual or Middleware-based |

**When to use:** Use **Controllers** for large, complex enterprise applications where you benefit from established patterns and automatic features. Use **Minimal APIs** for small services, prototypes, or performance-critical microservices.

---

## Interview questions and answers

**Q1: Why would you choose Minimal APIs over Controllers?**
*   **Answer:** Minimal APIs have a smaller memory footprint and faster startup time. They reduce the "ceremony" of creating classes for every endpoint, making them ideal for lightweight microservices.

**Q2: Can you use Filters in Minimal APIs?**
*   **Answer:** Yes. Since .NET 7, Minimal APIs support `IEndpointFilter`, which provides a way to intercept and modify requests, similar to Action Filters in Controllers.

**Q3: How do you handle Model Validation in Minimal APIs?**
*   **Answer:** While Controllers have `[ApiController]` to trigger automatic `ModelState` validation, Minimal APIs require you to either perform manual validation inside the handler or use a library like `FluentValidation` via an `EndpointFilter` or custom middleware.

---

## Exercises and solutions

### Exercise 1: Create a "Product" endpoint
Create a Minimal API endpoint that accepts a `productId` and returns a string "Product details for [id]".

**Solution:**
```csharp
app.MapGet("/products/{id}", (int id) => $"Product details for {id}");
```

### Exercise 2: Controller Dependency Injection
Inject an `ILogger` into a Controller and log a message when a GET request is made.

**Solution:**
```csharp
[ApiController]
[Route("[controller]")]
public class ProductsController : ControllerBase {
    private readonly ILogger<ProductsController> _logger;
    public ProductsController(ILogger<ProductsController> logger) => _logger = logger;

    [HttpGet]
    public IActionResult Get() {
        _logger.LogInformation("Getting products");
        return Ok();
    }
}
```

---

## Review questions

1.  What feature allows you to group Minimal API endpoints under a common route prefix to keep `Program.cs` clean?
2.  What is the primary difference in how dependencies are injected between Controllers and Minimal APIs?
3.  Why might a large enterprise team still prefer Controllers over Minimal APIs despite the performance benefits of the latter?

---

## Sources and limitations

*   **Sources:** Based on official Microsoft ASP.NET Core documentation.
*   **Limitations:** This guide covers core concepts. Advanced topics like complex Middleware pipelines, custom Model Binders, and specific Authentication schemes are beyond the scope of this lesson.
*   **Note:** Performance differences are often negligible for standard I/O-bound web applications; choose the model that best fits your team's architectural preferences.
