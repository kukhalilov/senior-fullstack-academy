<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine a restaurant. 

A **Controller-based API** is like a traditional, formal restaurant. There is a head waiter (the Controller class) who takes your order. The restaurant has strict rules: you must sit in specific zones (routing attributes like `[Route("api/[controller]")]`), and the waiter handles many types of requests (GET, POST, PUT, DELETE) through different actions inside that same room. It is structured, highly organized, and has been the industry standard for a long time.

A **Minimal API** is like a modern food truck. There are no formal seating areas, no complex rules, and no heavy waiters. You walk up, ask for a specific item at a specific window, and the cook hands it to you directly. In ASP.NET Core, Minimal APIs let you write HTTP endpoints using short, direct lambda expressions (e.g., `app.MapGet("/users", () => "Get users");`) without needing heavy controller classes.

*Technical terms explained:*
*   **API (Application Programming Interface):** A messenger that takes requests from a client (like a website or mobile app) and tells the server what to do, then brings the response back.
*   **Endpoint:** A specific URL (like `/api/products`) where your API can be accessed by clients.
*   **Lambda expression:** A short, anonymous function used in C# to write code inline without naming a method (e.g., `x => x * 2`).
*   **Boilerplate:** Repetitive blocks of code that you have to write over and over again to make a framework work.

---

## How it works

### Controllers (The Traditional Approach)
Controllers inherit from a base class (usually `ControllerBase`) and use attributes (metadata tags enclosed in square brackets `[]`) to define routes and HTTP methods.

1. **Routing:** ASP.NET Core scans your project for classes tagged with `[ApiController]` and `[Route]`.
2. **Model Binding:** The framework automatically reads incoming JSON from the HTTP request body and converts it into a C# object.
3. **Action Execution:** The specific method (action) runs, interacts with services or databases, and returns an `IActionResult` (like `Ok()`, `BadRequest()`, or `NotFound()`).

### Minimal APIs (The Modern Approach)
Minimal APIs remove the `ControllerBase` class entirely. You define routes directly on the `WebApplication` instance in your `Program.cs` file.

1. **Mapping:** You map HTTP verbs directly to endpoints using methods like `app.MapGet()`, `app.MapPost()`, `app.MapPut()`, and `app.MapDelete()`.
2. **Dependency Injection (DI):** Instead of using constructor injection (passing services into the class constructor), Minimal APIs allow you to inject services directly into the endpoint's method parameters.
3. **Execution:** The code runs inside a lightweight lambda expression and returns results directly (often using `Results.Ok()` or `TypedResults.Ok()`).

---

## Examples

### Example 1: Controller-based API

```csharp
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    // Simulate a database with a static list
    private static readonly List<string> products = new() { "Laptop", "Mouse", "Keyboard" };

    [HttpGet]
    public IActionResult GetProducts()
    {
        return Ok(products);
    }

    [HttpPost]
    public IActionResult AddProduct([FromBody] string newProduct)
    {
        if (string.IsNullOrWhiteSpace(newProduct))
        {
            return BadRequest("Product name cannot be empty.");
        }

        products.Add(newProduct);
        return CreatedAtAction(nameof(GetProducts), new { id = products.Count - 1 }, newProduct);
    }
}
```

### Example 2: Minimal API

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Simulate a database
var products = new List<string> { "Laptop", "Mouse", "Keyboard" };

// GET endpoint
app.MapGet("/api/products", () => Results.Ok(products));

// POST endpoint with direct service/parameter binding
app.MapPost("/api/products", (string newProduct) =>
{
    if (string.IsNullOrWhiteSpace(newProduct))
    {
        return Results.BadRequest("Product name cannot be empty.");
    }

    products.Add(newProduct);
    return Results.Created($"/api/products/{products.Count - 1}", newProduct);
});

app.Run();
```

---

## Tradeoffs and comparisons

| Feature / Aspect | Controller-based APIs | Minimal APIs |
| :--- | :--- | :--- |
| **Boilerplate Code** | High (requires classes, inheritance, attributes). | Low (written directly in `Program.cs` or extension methods). |
| **Performance** | Fast, but incurs minor overhead from MVC infrastructure. | Faster startup time and slightly lower memory footprint. |
| **Organization** | Natural organization by controller class. | Requires manual organization (e.g., using extension methods or `IEndpointRouteBuilder`). |
| **Filters & Middleware** | Uses Action Filters, Authorization Filters, etc. | Uses endpoint filters (`IEndpointFilter`) and standard ASP.NET middleware. |
| **OpenAPI / Swagger** | Mature tooling integration. | Uses newer native tooling (`Microsoft.AspNetCore.OpenAPI`). |
| **Best suited for** | Large enterprise apps with complex domain logic and legacy MVC habits. | Microservices, rapid prototyping, lightweight APIs, and high-performance endpoints. |

---

## Interview questions and answers

### Q1: What are the primary differences between Controller-based APIs and Minimal APIs in ASP.NET Core?
* **Answer:** Controller-based APIs rely on heavy object-oriented structures where routes are mapped to methods inside classes that inherit from `ControllerBase`. They use attributes for routing and action filters for cross-cutting concerns. Minimal APIs eliminate the need for controller classes entirely, allowing developers to map endpoints directly to lambda expressions or local functions inside `Program.cs`. Minimal APIs reduce boilerplate, have faster startup times, and consume less memory, making them ideal for microservices.
* **Follow-up question:** *Can you use Entity Framework Core or Dependency Injection in Minimal APIs just like you do in Controllers?*
* **Answer (Follow-up):** Yes. Dependency injection is fully supported in Minimal APIs. You can inject services either via the method parameters of the endpoint lambda or by using `[AsParameters]` for grouping parameters.

### Q2: How do you handle validation in Minimal APIs compared to Data Annotations in Controllers?
* **Answer:** In Controller-based APIs, model validation happens automatically via the `[ApiController]` attribute, which checks Data Annotations on the model and returns a `400 Bad Request` if invalid. In Minimal APIs, automatic validation out-of-the-box is not enabled by default in the same way, though you can use validation libraries like FluentValidation, or manually validate models inside the endpoint using `Validator.TryValidateObject`, or use third-party packages designed to bring filter-based validation to Minimal APIs.
* **Follow-up question:** *What is the advantage of using `TypedResults` over standard `Results` in Minimal APIs?*
* **Answer (Follow-up):** `TypedResults` returns concrete types that implement `IResult` (e.g., `Ok<T>` instead of just `IResult`). This improves unit testability because you can assert the exact return type directly without casting, and it helps OpenAPI generate more accurate API documentation schemas.

### Q3: When would you choose Controllers over Minimal APIs for a new project?
* **Answer:** You might choose Controllers if your team has extensive experience with the MVC pattern, if you are working on a very large monolithic application where strict architectural guidelines per controller are enforced, or if you rely heavily on legacy action filters, global authorization conventions, and established scaffolders that do not yet have full feature parity in the Minimal API ecosystem.

---

## Exercises and solutions

### Exercise 1: Minimal API CRUD implementation
**Problem:** Write a complete Minimal API in a single `Program.cs` file that manages a list of tasks (`TaskItem` with `Id` and `Title`). Implement a GET endpoint to list all tasks, a POST endpoint to create a task, and a DELETE endpoint to remove a task by `Id`.

**Complete Solution:**

```csharp
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// In-memory data store
var tasks = new List<TaskItem>
{
    new(1, "Learn Minimal APIs"),
    new(2, "Build an ASP.NET Core project")
};

// GET: /tasks
app.MapGet("/tasks", () => Results.Ok(tasks));

// POST: /tasks
app.MapPost("/tasks", (CreateTaskDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Title))
    {
        return Results.BadRequest("Task title is required.");
    }

    var newTask = new TaskItem(tasks.Count > 0 ? tasks.Max(t => t.Id) + 1 : 1, dto.Title);
    tasks.Add(newTask);
    return Results.Created($"/tasks/{newTask.Id}", newTask);
});

// DELETE: /tasks/{id}
app.MapDelete("/tasks/{id}", (int id) =>
{
    var task = tasks.FirstOrDefault(t => t.Id == id);
    if (task is null)
    {
        return Results.NotFound($"Task with ID {id} not found.");
    }

    tasks.Remove(task);
    return Results.NoContent();
});

app.Run();

// Records for data representation
public record TaskItem(int Id, string Title);
public record CreateTaskDto(string Title);
```

### Data Structures & Algorithms (DSA) Interview Problem

**Problem Statement:**
You are given an array of integers representing request processing times in milliseconds received by an API gateway. Write a C# method that finds the contiguous subarray of request times that has the largest sum, and return that sum (Kadane’s Algorithm). This simulates finding the heaviest peak load window in an API monitor log.

* **Progressive Hint 1:** Think about whether you need to check every single possible subarray (which would take $O(n^2)$ or $O(n^3)$ time). Can you solve it by making a single pass through the array?
* **Progressive Hint 2:** Maintain two variables: `currentSum` (the maximum sum ending at the current position) and `maxSoFar` (the maximum sum found overall).
* **Progressive Hint 3:** At each element, decide whether to add the current element to the existing running sum, or start a new running sum from the current element (`Math.Max(current + x, x)`).

**Working C# Solution:**

```csharp
using System;

public class ApiLoadAnalyzer
{
    public static int MaxSubarraySum(int[] requestTimes)
    {
        if (requestTimes == null || requestTimes.Length == 0)
        {
            throw new ArgumentException("Request times array cannot be null or empty.");
        }

        int currentSum = requestTimes[0];
        int maxSoFar = requestTimes[0];

        for (int i = 1; i < requestTimes.Length; i++)
        {
            // Decide: extend the previous subarray or start a new one
            currentSum = Math.Max(requestTimes[i], currentSum + requestTimes[i]);
            
            // Update the overall maximum found so far
            maxSoFar = Math.Max(maxSoFar, currentSum);
        }

        return maxSoFar;
    }

    public static void Main()
    {
        int[] logs = { -2, 1, -3, 4, -1, 2, 1, -5, 4 };
        int result = MaxSubarraySum(logs);
        Console.WriteLine($"Maximum contiguous load sum: {result}"); // Output: 6 ([4, -1, 2, 1])
    }
}
```

* **Edge Cases Handled:**
  1. *All negative numbers:* The algorithm correctly returns the single largest negative number because `Math.Max` properly compares elements.
  2. *Single element array:* The loop is bypassed and the single element is returned.
  3. *Null or empty arrays:* Throws an `ArgumentException`.
* **Complexity Analysis:**
  * **Time Complexity:** $O(n)$, where $n$ is the number of elements in the array. We iterate through the array exactly once.
  * **Space Complexity:** $O(1)$, as we only use two integer variables (`currentSum` and `maxSoFar`) regardless of input size.

---

## Review questions

1. What are the key architectural differences between routing in Controller-based APIs and Minimal APIs?
2. How do you achieve separation of concerns in a large Minimal API project where putting all endpoints in `Program.cs` becomes messy?
3. What is the role of `IEndpointFilter` in Minimal APIs, and how does it compare to Action Filters in MVC Controllers?
4. Why does returning `TypedResults` improve unit testing compared to returning generic `IResult` implementations?

---

## Sources and limitations

* **Sources:** Based directly on official Microsoft ASP.NET Core documentation, framework conventions, and standard industry practices for .NET API development up to .NET 8/9. External website links and specific third-party benchmarks are not referenced to avoid broken links or unverified claims.
* **Limitations:** Performance metrics between Controllers and Minimal APIs can vary based on specific hosting configurations, middleware pipelines, and payload sizes. Developers should perform benchmark testing (e.g., using BenchmarkDotNet) on their specific workloads for absolute verification.
