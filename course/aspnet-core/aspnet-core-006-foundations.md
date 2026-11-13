<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine you are ordering food at a restaurant. You do not go into the kitchen to cook your meal. Instead, you look at a menu, tell the waiter what you want, and the waiter brings your food back to your table. 

In software development, **REST API controllers** and **Minimal APIs** act like that waiter. They are the middlemen between a client (such as a website, a mobile app, or another server) and your application's core logic and database.

*   **API** stands for *Application Programming Interface*. It is a set of rules that lets different software programs talk to each other.
*   **REST** stands for *Representational State Transfer*. It is a style of architecture that uses standard HTTP verbs (like `GET`, `POST`, `PUT`, `DELETE`) to manage data.
*   **Controller-based APIs** are the traditional ASP.NET Core way of organizing this communication. You group related endpoints into classes called "Controllers."
*   **Minimal APIs** are a newer, lightweight way to write endpoints directly in your program startup file with very little boilerplate (extra setup code) code.

---

## How it works

ASP.NET Core is the framework used to build these APIs in C#. Behind the scenes, the framework handles receiving network requests, reading the data, routing the request to the correct piece of C# code, and sending a response back.

### Prerequisites and Mental Models
*   **HTTP Protocol:** You must understand how the web works via requests and responses, headers, status codes (`200 OK`, `404 Not Found`, `400 Bad Request`), and JSON data formatting.
*   **Dependency Injection (DI):** ASP.NET Core relies heavily on DI to supply services (like databases or loggers) to your endpoints.
*   **Mental Model (Controllers):** Think of a Controller as a department store manager. The manager oversees a specific department (e.g., `ProductsController`) and handles all customer requests related to that department.
*   **Mental Model (Minimal APIs):** Think of a Minimal API as a pop-up shop. You set up a specific table right at the front door to handle one specific task quickly, without needing a full management structure.

### Controller-Based APIs
In a controller-based API, you create a class that inherits from `ControllerBase` and decorate it with attributes (metadata annotations in square brackets).

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private static readonly List<string> products = ["Apple", "Banana", "Cherry"];

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(products); // Returns HTTP 200 with JSON list
    }
}
```

### Minimal APIs
In a Minimal API, you skip the class definition and map routes directly onto the web application instance (`WebApplication`).

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var products = new List<string> { "Apple", "Banana", "Cherry" };

app.MapGet("/api/products", () => Results.Ok(products));

app.Run();
```

---

## Examples

Below is a complete, runnable example comparing both approaches for a simple resource management system (Managing books).

### 1. Controller-Based Implementation
```csharp
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    private static readonly List<Book> _books = new()
    {
        new Book(1, "C# in Depth"),
        new Book(2, "Clean Code")
    };

    [HttpGet]
    public ActionResult<IEnumerable<Book>> GetBooks() => Ok(_books);

    [HttpGet("{id:int}")]
    public ActionResult<Book> GetBook(int id)
    {
        var book = _books.FirstOrDefault(b => b.Id == id);
        if (book == null) return NotFound();
        return Ok(book);
    }

    [HttpPost]
    public ActionResult<Book> CreateBook(Book newBook)
    {
        _books.Add(newBook);
        return CreatedAtAction(nameof(GetBook), new { id = newBook.Id }, newBook);
    }
}

public record Book(int Id, string Title);
```

### 2. Minimal API Implementation
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var books = new List<Book>
{
    new(1, "C# in Depth"),
    new(2, "Clean Code")
};

app.MapGet("/api/books", () => Results.Ok(books));

app.MapGet("/api/books/{id:int}", (int id) =>
{
    var book = books.FirstOrDefault(b => b.Id == id);
    return book is not null ? Results.Ok(book) : Results.NotFound();
});

app.MapPost("/api/books", (Book newBook) =>
{
    books.Add(newBook);
    return Results.Created($"/api/books/{newBook.Id}", newBook);
});

app.Run();

public record Book(int Id, string Title);
```

---

## Tradeoffs and comparisons

| Feature / Aspect | Controller-Based APIs | Minimal APIs |
| :--- | :--- | :--- |
| **Boilerplate Code** | High (requires classes, inheritance, attributes) | Low (direct mapping, fewer files) |
| **Performance** | Fast, but slightly heavier memory footprint | Faster startup time, lower memory footprint |
| **Organization** | Rigid, enforced structure (by controller class) | Flexible, developer decides how to group endpoints |
| **Feature Richness** | Built-in filter pipelines, model validation attributes, API Explorer integration out-of-the-box | Relies on extension methods and middleware; filters added via newer APIs |
| **Learning Curve** | Traditional, well-documented over many years | Requires understanding modern C# lambdas and delegate types |

---

## Interview questions and answers

**Q1: What is the primary difference between Controller-based APIs and Minimal APIs in ASP.NET Core?**
*Answer:* Controller-based APIs use heavy object-oriented structures with classes inheriting from `ControllerBase` and rely heavily on attributes for routing and model binding. Minimal APIs use a functional, routing-centric approach where lambda expressions or local functions are mapped directly to HTTP verbs using the `WebApplication` instance, drastically reducing boilerplate code and improving startup performance.

**Q2: When should you choose a Controller-based architecture over a Minimal API?**
*Answer:* You should choose Controllers when building very large, enterprise applications where strict architectural guidelines, built-in model state validation attributes, and robust filter pipelines are heavily utilized across a large team of developers who are already familiar with the MVC/Controller pattern.

**Q3: How does dependency injection differ in Minimal APIs compared to Controllers?**
*Answer:* In Controllers, dependencies are typically injected via constructor injection. In Minimal APIs, dependencies can be injected directly into the route handler method parameters as arguments, and the ASP.NET Core framework will automatically resolve them from the DI container.

---

## Exercises and solutions

### Exercise 1: Building a Minimal API Todo List
**Problem:** Write a Minimal API that manages a list of "Todo" items. It must support getting all items (`GET /todos`) and adding a new item (`POST /todos`). Use a C# `record` for the Todo item containing `int Id` and `string Task`.

#### Solution
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var todos = new List<Todo>
{
    new(1, "Learn Minimal APIs"),
    new(2, "Build a portfolio project")
};

// GET all todos
app.MapGet("/todos", () => Results.Ok(todos));

// POST a new todo
app.MapPost("/todos", (Todo newTodo) =>
{
    todos.Add(newTodo);
    return Results.Created($"/todos/{newTodo.Id}", newTodo);
});

app.Run();

public record Todo(int Id, string Task);
```

### Exercise 2: Data Structure Algorithm (API Rate Limiter Mock)
*Note: In system design, APIs often require checking recent requests to prevent abuse. Let's solve a foundational algorithmic problem related to tracking requests over time windows.*

**Problem:** Given an array of integers representing request timestamps in seconds, write a C# method that counts how many requests fall within a sliding window of the last `3 seconds` up to a given current timestamp `T`.

#### Progressive Hints
1. **Hint 1:** Sort the timestamps if they are not already sorted, or assume they arrive in chronological order.
2. **Hint 2:** Use a binary search (`Array.BinarySearch` or custom pointer logic) or filter using LINQ to find timestamps $\ge (T - 3)$.
3. **Hint 3:** For high performance, binary search for the lower bound is $O(\log N)$.

#### Working C# Solution
```csharp
using System;
using System.Collections.Generic;

public class RateLimiterUtility
{
    public static int CountRequestsInWindow(List<int> sortedTimestamps, int currentTime, int windowSizeSeconds = 3)
    {
        int lowerBound = currentTime - windowSizeSeconds;
        
        // Find index of the first request that is >= lowerBound using Binary Search
        int index = sortedTimestamps.BinarySearch(lowerBound);
        
        if (index < 0)
        {
            // Bitwise complement indicates the index of the next larger element
            index = ~index;
        }
        
        // All elements from 'index' to the end of the list are within the window
        return sortedTimestamps.Count - index;
    }
}
```

#### Example
```csharp
var timestamps = new List<int> { 1, 2, 4, 6, 7 }; // Sorted timestamps
int currentTime = 8;
int count = RateLimiterUtility.CountRequestsInWindow(timestamps, currentTime, 3);
// Window is [5, 8]. Timestamps falling in [5, 8] are 6 and 7.
// Expected output: 2
```

#### Edge Cases
*   **Empty List:** Returns `0`.
*   **All requests outside window (too old):** Binary search places index at the end of the list, returns `0`.
*   **All requests inside window:** Returns total count of the list.

#### Complexity
*   **Time Complexity:** $O(\log N)$ due to binary search on the sorted list.
*   **Space Complexity:** $O(1)$ auxiliary memory since we use pointers/indices.

---

## Review questions

1. What HTTP status code should typically be returned when a resource is successfully created via a `POST` request?
   * **Answer:** `201 Created`.
2. What is the role of the `[ApiController]` attribute in a controller-based ASP.NET Core application?
   * **Answer:** It enables framework features that improve the developer experience for building APIs, such as automatic model state validation, binding source parameter inference, and problem details for error responses.
3. How do Minimal APIs handle dependency injection for parameters compared to traditional constructor injection?
   * **Answer:** While Minimal APIs can use constructor-like injection via services attached to types or closures, they primarily support service injection directly as parameters in the route handler lambda/method, which the framework automatically resolves from the DI container at runtime.
4. What is the time complexity of searching for a value in a sorted array using Binary Search?
   * **Answer:** $O(\log N)$.

---

## Sources and limitations

*   **Uncertainty / Limitations:** ASP.NET Core evolves rapidly with each .NET release. While core concepts of REST controllers and Minimal APIs remain stable, new performance features and routing optimizations are added regularly. External verification of framework internals should always cross-reference official Microsoft documentation.
*   *External links are omitted as per instructions.*
