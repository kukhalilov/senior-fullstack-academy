<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# statements, control flow, and exception-handling statement forms — Reference: Exception-handling statements

*This is an automatically generated draft.*

# Scope and version
This lesson covers the exception-handling statement forms in C# 15, running on .NET 11 GA. Exception handling allows a program to manage runtime errors gracefully by transferring control from the point of failure to a designated handler. This reference is based on the C# language specification and Microsoft Learn documentation (checked 2026-11-14).

# How this group fits the mental model
In C#, statements perform actions. While most code executes linearly, errors (exceptions) can disrupt this flow. Exception-handling statements provide a structured way to "catch" these disruptions, perform cleanup tasks, and ensure the application remains in a stable state. They act as a safety net that separates the "happy path" of your logic from the error-recovery logic.

# Supplied names explained

* `try-catch statement`: A block that attempts to execute code; if an exception occurs, control transfers to the associated `catch` clause.
* `try-finally statement`: A block that executes code and guarantees that the `finally` block runs regardless of whether an exception was thrown or the code completed normally.
* `try-catch-finally statement`: A combination that attempts code, catches specific exceptions, and executes a `finally` block for cleanup.
* `catch clause`: A block that defines the logic to execute when a specific type of exception is caught.
* `exception filter`: A `when` clause added to a `catch` clause that evaluates a boolean expression to determine if the catch block should execute.
* `finally clause`: A block containing code that must run after the `try` or `catch` blocks, typically used to release resources.

# Cross-item comparison
The exception-handling statements are hierarchical:
* The `try-catch` and `try-finally` forms are specialized versions of the `try-catch-finally` structure.
* A `catch clause` is the functional unit of error recovery, while a `finally clause` is the functional unit of resource cleanup.
* An `exception filter` acts as a gatekeeper for a `catch clause`, allowing for more granular control than catching by exception type alone.

# Examples
```csharp
// Example of a try-catch-finally structure with an exception filter
try
{
    // Attempt risky operation
    int denominator = 0;
    if (denominator == 0)
        throw new DivideByZeroException();
    int result = 10 / denominator;
}
catch (DivideByZeroException)
{
    // Exception filter evaluates the condition before entering the catch block
    Console.WriteLine("Caught division by zero.");
}
finally
{
    // Runs as control leaves try/catch unless process termination prevents it.
    Console.WriteLine("Cleanup complete.");
}
```

# Common mistakes
* **Ignoring the `finally` block:** `finally` runs as control leaves `try`/`catch` in ordinary execution, including a return path; abrupt termination can prevent it.
* **Over-catching:** Catching the base `Exception` type can hide bugs that you did not intend to handle. Always catch the most specific exception type possible.
* **Empty catch blocks:** Swallowing exceptions without logging or handling them makes debugging nearly impossible.

# Knowledge checks with answers
1. **Question:** Does the `finally` block execute if no exception is thrown?
   **Answer:** In normal control flow it executes after the `try` or `catch` completes, whether or not an exception occurred. Abrupt process termination can prevent execution.

2. **Question:** What is the purpose of an `exception filter`?
   **Answer:** It allows you to specify a condition (using `when`) that must be true for the `catch` block to execute, providing finer control over which exceptions are handled.

3. **Question:** Can you use a `try` block without a `catch` or `finally` clause?
   **Answer:** No, a `try` block must be followed by at least one `catch` clause or a `finally` clause.

*Source: [https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/)*
