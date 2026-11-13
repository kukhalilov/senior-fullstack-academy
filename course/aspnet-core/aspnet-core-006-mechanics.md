<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine a restaurant. You are the customer (the client, such as a web browser or mobile app), and the kitchen is the server (the backend application). You cannot walk into the kitchen to prepare your own food. Instead, you need a waiter to take your order, bring it to the kitchen, and return your food. 

In web development, **REST APIs** (Representational State Transfer Application Programming Interfaces) and **ASP.NET Core APIs** act as that waiter. They let different software systems talk to each other over the internet using standard HTTP (Hypertext Transfer Protocol) requests.

ASP.NET Core gives developers two primary ways to write these API waiters:
1. **Controllers (The Traditional Way):** Grouped inside large classes. Think of this like a restaurant with distinct stations (a Dessert Station, a Grill Station) where each station manages its own set of recipes.
2. **Minimal APIs (The Modern, Lightweight Way):** Written as direct, standalone instruction lines. Think of this like a fast-food counter where a single clerk takes your order and hands it right back to you without paperwork.

---

## How it works

### The Anatomy of an HTTP Request
Every time a client communicates with an ASP.NET Core API, it sends an **HTTP Request**. This request contains:
* **Method (Verb):** What do you want to do? (`GET` to read, `POST` to create, `PUT`/`PATCH` to update, `DELETE` to remove).
* **Route (Path):** Where do you want to do it? (e.g., `/api/products`).
* **Headers:** Metadata about the request (e.g., authentication tokens, content type).
* **Body (Optional):** Data sent *to* the server (usually in JSON format).

The server processes this request and returns an **HTTP Response**, containing a **Status Code** (e.g., `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`) and usually a payload (the data).

### Mechanics: Controllers vs. Minimal APIs

#### 1. Controllers (`ControllerBase`)
Controllers rely on **convention** and **attributes** (annotations wrapped in brackets like `[HttpGet]`). 
* The framework automatically scans your project for classes inheriting from `ControllerBase`.
* It uses **Model Binding** to inspect incoming query parameters, headers, or JSON bodies and automatically map them to C# method parameters.
* It uses **Dependency Injection (DI)** through the class constructor to inject services (like databases or loggers).

#### 2. Minimal APIs
Minimal APIs bypass heavy class structures. Instead of writing a class and attributes, you map routes directly to lambda expressions or methods inside your program startup file (`Program.cs`) or organized extension classes.
* They use a fluent routing system (e.g., `app.MapGet()`).
* They rely on **Parameter Binding**, which inspects the types of your lambda parameters and automatically extracts data from the route, query string, or request body.

---

## Examples

### Scenario: Managing a Product Catalog

Here is how you implement a simple "Get Product by ID" endpoint using both approaches in ASP.NET Core.

#### Approach A: Controllers

```csharp
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")] // Route becomes /api/products
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    // Dependency Injection via Constructor
    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProductById(int id)
    {
        var product = await _productService.GetByIdAsync(id);

        if (product == null)
        {
            return NotFound(new { Message = $"Product with ID {id} not found." });
        }

        return Ok(product); // Returns HTTP 200 with JSON body
    }
}
```

#### Approach B: Minimal APIs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Register services for Dependency Injection
builder.Services.AddScoped<IProductService, ProductService>();

var app = builder.Build();

// Map route directly using a lambda expression
app.MapGet("/api/products/{id:int}", async (int id, IProductService productService) =>
{
    var product = await productService.GetByIdAsync(id);

    // Minimal APIs automatically serialize objects to JSON when returned directly
    return product is not null 
        ? Results.Ok(product) 
        : Results.NotFound(new { Message = $"Product with ID {id} not found." });
});

app.Run();
```

---

## Tradeoffs and comparisons

| Feature / Aspect | Controllers (`ControllerBase`) | Minimal APIs |
| :--- | :--- | :--- |
| **Boilerplate Code** | High (Requires class declarations, attributes, constructors). | Low (Writes directly to `Program.cs` or extension files). |
| **Performance** | Fast, but carries slight overhead from heavy MVC infrastructure. | Faster startup time and lower memory footprint. |
| **Organization** | Natural for large, complex APIs (groups actions by resource). | Can become cluttered in large apps if not organized into extension methods or API endpoint classes. |
| **Filters & Validation** | Built-in robust filter pipeline, `ActionFilters`, and `ModelState`. | Uses Endpoint Filters (introduced in .NET 7) and lightweight validation. |
| **Best Suited For** | Large enterprise apps, teams migrating from traditional ASP.NET MVC. | Microservices, rapid prototyping, high-performance APIs. |

### Common Misconceptions
* **Misconception:** *"Minimal APIs are only for tiny, toy applications and cannot scale."*
  * **Fact:** Minimal APIs share the exact same underlying routing engine and web server (`Kestrel`) as Controllers. You can organize Minimal APIs cleanly into modular files using extension methods (`IEndpointRouteBuilder`) or implementing the `IEndpoint` pattern.
* **Misconception:** *"Controllers perform automatic model validation better."*
  * **Fact:** While Controllers validate using `ModelState` automatically via `[ApiController]`, Minimal APIs can achieve the exact same behavior using third-party validation libraries (like FluentValidation), endpoint filters, or manual validation checks inside the lambda parameters.

---

## Interview questions and answers

### 1. What is the difference between Controllers and Minimal APIs in ASP.NET Core, and when should you choose one over the other?
**Answer:** Controllers use an attribute-routed, class-based architecture inherited from the MVC pattern, making them heavily structured and ideal for large, enterprise-grade monolithic applications with deeply nested routes. Minimal APIs use a lightweight, functional routing style mapped directly in `Program.cs`, resulting in faster startup times and less boilerplate code. Choose Minimal APIs for microservices and performance-critical apps; choose Controllers if your team heavily relies on traditional MVC filters and structured class inheritance.

### 2. How does Dependency Injection work differently between Controllers and Minimal APIs?
**Answer:** In Controllers, dependencies are injected into the class constructor via Dependency Injection, making them available to all action methods inside that class. In Minimal APIs, dependencies are injected **directly into the method parameters** of the route handler lambda expression (framework parameter injection), or retrieved using `HttpContext.RequestServices`.

### 3. Explain how content negotiation works in an ASP.NET Core API.
**Answer:** Content negotiation is the process where the client and server agree on the format of the response data. The client sends an `Accept` header (e.g., `application/json` or `application/xml`). The ASP.NET Core API checks its registered formatters and serializes the response data into the format requested by the client. By default, ASP.NET Core uses `System.Text.Json` to output JSON.

---

## Exercises and solutions

### Coding Exercise: The In-Memory Task Manager API

#### Problem Statement
Build a Minimal API that acts as a simple Task Manager. It must support:
1. `GET /tasks`: Retrieve all tasks.
2. `POST /tasks`: Create a new task (expects a JSON body with a `Title`).
3. `DELETE /tasks/{id}`: Delete a task by its integer ID.

#### Progressive Hints
* **Hint 1:** Use a thread-safe collection (like a `ConcurrentDictionary<int, string>` or synchronization primitives) if you want to handle multi-threaded requests safely, though a standard list inside a demo app requires careful handling or locking.
* **Hint 2:** For the `POST` endpoint, define a C# `record` or `class` for the incoming payload: `record CreateTaskDto(string Title);`.
* **Hint 3:** Use `Results.Created(...)` for successful creation, returning the newly created resource's location and object.

#### Working C# Solution

```csharp
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Thread-safe in-memory data store for demonstration
var tasks = new ConcurrentDictionary<int, TaskItem>();
tasks.TryAdd(1, new TaskItem(1, "Learn ASP.NET Core Minimal APIs"));
tasks.TryAdd(2, new TaskItem(2, "Understand HTTP Status Codes"));
int idCounter = 3;

// 1. GET all tasks
app.MapGet("/tasks", () => Results.Ok(tasks.Values));

// 2. POST create a task
app.MapPost("/tasks", (CreateTaskDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Title))
    {
        return Results.BadRequest(new { Error = "Task title cannot be empty." });
    }

    int newId = Interlocked.Increment(ref idCounter) - 1;
    var newTask = new TaskItem(newId, dto.Title);
    
    if (tasks.TryAdd(newId, newTask))
    {
        return Results.Created($"/tasks/{newTask.Id}", newTask);
    }

    return Results.StatusCode(StatusCodes.Status500InternalServerError);
});

// 3. DELETE a task
app.MapDelete("/tasks/{id:int}", (int id) =>
{
    if (tasks.TryRemove(id, out var task))
    {
        return Results.NoContent(); // HTTP 204
    }

    return Results.NotFound(new { Error = $"Task {id} not found." });
});

app.Run();

// Data models
public record TaskItem(int Id, string Title);
public record CreateTaskDto(string Title);
```

#### Example Usage
* **Request:** `POST /tasks` with Body `{"Title": "Write unit tests"}`
* **Response:** Status `201 Created` with Body `{"id": 3, "title": "Write unit tests"}`

#### Edge Cases Considered
* Empty or null titles handled with a `400 Bad Request`.
* Non-existent IDs handled gracefully with a `404 Not Found`.
* Thread safety addressed using `ConcurrentDictionary` and `Interlocked.Increment` to prevent race conditions during concurrent data modification.

#### Complexity Analysis
* **Time Complexity:** $O(1)$ on average for search, insertion, and deletion operations backed by `ConcurrentDictionary`.
* **Space Complexity:** $O(n)$ where $n$ is the number of active tasks stored in memory.

---

## Review questions

1. What HTTP status code should your API return when a resource is successfully created?
2. How do you extract an integer route parameter named `id` inside a Minimal API lambda handler?
3. What is the primary architectural difference between organizing endpoints via `ControllerBase` classes versus `app.MapGet` expressions?
4. How does ASP.NET Core decide whether to map an incoming JSON request body to a C# method parameter?

---

## Sources and limitations

* **Sources:** Based on official Microsoft documentation and architectural guidelines for ASP.NET Core (.NET 6/7/8/9). No external links are claimed or verified.
* **Limitations:** This lesson focuses purely on core routing, request mechanics, and basic endpoint implementation. Advanced topics like Authentication/Authorization (JWT tokens), OpenAPI/Swagger integration, and Global Exception Handling are intentionally omitted for brevity.
