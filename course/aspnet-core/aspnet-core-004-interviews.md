<!-- Generated with gemini-3.1-flash-lite; automated review only; source and code verification pending. -->

Here is the revised version of your draft. I have corrected technical inaccuracies (specifically regarding the "Onion Model" and the role of `UseRouting`), improved clarity, and expanded the solutions section.

---

## Simple explanation

In ASP.NET Core, **Middleware** is a series of components that form a "pipeline." Think of it like a security checkpoint at an airport. When a request comes in, it passes through several checkpoints (middleware) before reaching its destination (the endpoint). Each checkpoint can either:
1. **Pass the request** to the next component by calling `next()`.
2. **Stop the request** (short-circuit) by *not* calling `next()` (e.g., if authentication fails).
3. **Perform an action** both before and after the request reaches the destination.

**Routing** is the process of matching an incoming URL (like `/api/users/1`) to a specific piece of code (an **Endpoint**) that knows how to handle that request.

---

## How it works

The ASP.NET Core pipeline uses a **"Request Delegate"** chain.

1. **Request Pipeline:** When a request arrives, it travels through the middleware components in the order they were added in `Program.cs`.
2. **Routing Middleware:** This component inspects the request to determine which endpoint matches the URL. It does not execute the endpoint; it merely "selects" it.
3. **Endpoint Middleware:** This component executes the code associated with the selected endpoint (e.g., a Controller action or Minimal API handler).
4. **Response Pipeline:** After the endpoint finishes, the response travels back through the middleware in **reverse order**, allowing you to modify the response before it reaches the client.

**Key Terms:**
*   **`app.Use(...)`**: Adds middleware to the pipeline.
*   **`next()`**: A delegate that calls the next middleware in the chain.
*   **`app.Map(...)`**: Creates a branch in the pipeline for specific URL paths, isolating that logic from the rest of the app.

---

## Examples

### Basic Middleware
```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Custom Middleware
app.Use(async (context, next) => {
    // Logic before the endpoint
    await next(); 
    // Logic after the endpoint (e.g., logging response status)
});

app.MapGet("/", () => "Hello World!");

app.Run();
```

### Routing
```csharp
// Routing matches the URL to the code
app.MapGet("/users/{id}", (int id) => $"User ID is {id}");
```

---

## Tradeoffs and comparisons

| Feature | Middleware | Endpoint (Controller/Minimal API) |
| :--- | :--- | :--- |
| **Scope** | Global (runs for every request). | Specific (runs only for matched routes). |
| **Purpose** | Cross-cutting concerns (Logging, Auth, CORS). | Business logic and data processing. |
| **Performance** | High impact (runs on every request). | Low impact (runs only when needed). |

**Tradeoff:** Middleware is powerful but expensive. Since it executes for every request, heavy logic (like database calls) in middleware can significantly degrade performance. Keep middleware "thin."

---

## Interview questions and answers

**Q: What is the difference between `app.Use` and `app.Run`?**
*   **Answer:** `app.Use` adds middleware that can call `next()` to continue the pipeline. `app.Run` is a "terminal" middleware; it does not accept a `next` parameter and ends the pipeline, preventing subsequent middleware from executing.

**Q: Why is the order of middleware important?**
*   **Answer:** The pipeline is sequential. If you place `Authentication` middleware *after* your `Endpoint` execution, the endpoint will run before the user is authenticated, creating a security vulnerability.

**Q: How does `app.Map` differ from `app.Use`?**
*   **Answer:** `app.Map` branches the pipeline based on the request path. It creates a separate sub-pipeline for that specific path, whereas `app.Use` adds to the main global pipeline that every request traverses.

---

## Exercises and solutions

### Exercise 1: Create a Timing Middleware
**Task:** Write a middleware that calculates how long an endpoint takes to execute and logs it.

**Solution:**
```csharp
app.Use(async (context, next) => {
    var watch = System.Diagnostics.Stopwatch.StartNew();
    await next(); // Wait for the rest of the pipeline
    watch.Stop();
    Console.WriteLine($"Request {context.Request.Path} took {watch.ElapsedMilliseconds}ms");
});
```

### Exercise 2: Global Exception Handling
**Task:** Create a middleware that catches exceptions and returns a 500 status code.

**Solution:**
```csharp
app.Use(async (context, next) => {
    try {
        await next();
    } catch (Exception ex) {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("An internal error occurred.");
    }
});
```

---

## Review questions

1. **What happens if you forget to call `await next()` in a middleware?**
   * *Answer:* The request pipeline is "short-circuited." Subsequent middleware and the final endpoint will never execute.
2. **Can you have multiple endpoints for the same URL?**
   * *Answer:* Generally, no. Routing will throw an ambiguity exception if multiple endpoints match the same route pattern.
3. **Why should you place `UseRouting()` before `UseEndpoints()`?**
   * *Answer:* `UseRouting` identifies the endpoint, and `UseEndpoints` executes it. If you don't identify it first, the endpoint cannot be executed.
4. **How do you handle exceptions globally in the middleware pipeline?**
   * *Answer:* Use the `UseExceptionHandler` middleware at the very beginning of the pipeline to catch exceptions thrown by any subsequent middleware or endpoints.

---

## Sources and limitations

*   **Sources:** Based on official Microsoft ASP.NET Core documentation (Middleware and Routing sections).
*   **Limitations:** This guide covers the standard `Microsoft.AspNetCore` implementation. It does not cover advanced custom routing providers or complex dependency injection scenarios.
