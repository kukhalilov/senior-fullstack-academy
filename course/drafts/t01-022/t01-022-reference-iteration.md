<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# statements, control flow, and exception-handling statement forms — Reference: Iteration statements

*This is an automatically generated draft.*

# Scope and version
This lesson covers iteration statements in C# 15, running on .NET 11 GA. The scope is limited to the language constructs used for repeating blocks of code. All information is based on the C# language specification and Microsoft Learn documentation as of 2026-11-14.

# How this group fits the mental model
In C#, statements perform actions. Iteration statements are a specific category of statements that allow a program to repeat a block of code multiple times. They act as the "engine" for processing collections of data or repeating logic until a specific condition is met. They rely on the concept of blocks to define the scope of the repeated work.

# Supplied names explained
* `for statement`: A loop with optional initializer, condition, and iterator clauses; any clause can be omitted, and initializer/iterator clauses can contain multiple expressions.
* `foreach statement`: A loop that iterates over an array or type supported by C#'s enumerator pattern; the type need not implement `IEnumerable`.
* `await foreach statement`: An asynchronous iteration form for types supported by the async-enumerator pattern, commonly `IAsyncEnumerable<T>`.
* `while statement`: A loop that repeats a block of code as long as a specified boolean expression evaluates to `true`. The condition is checked before the loop body executes.
* `do statement`: A loop that executes a block of code once, then repeats it as long as a specified boolean expression evaluates to `true`. The condition is checked after the loop body executes.
* `foreach iteration variable`: The read-only variable that represents the current element being processed during a `foreach` or `await foreach` loop.
* `for iteration clause`: The specific part of a `for` statement that contains the initialization, condition, and iterator logic.

# Cross-item comparison
* `while` vs `do`: The `while` statement checks the condition before the first iteration (the loop might never run), whereas the `do` statement guarantees the loop body runs at least once because it checks the condition after the body.
* `for` vs `foreach`: The `for` statement is best for indexed access or numeric counting, while the `foreach` statement is designed for traversing collections without needing to manage an index or counter.
* `foreach` vs `await foreach`: The `await foreach` statement is required when the collection being iterated produces its elements asynchronously.

# Examples
```csharp
// for statement example
for (int i = 0; i < 5; i++) { Console.WriteLine(i); }

// foreach statement example
var list = new List<int> { 1, 2, 3 };
foreach (var item in list) { Console.WriteLine(item); }

// while statement example
int count = 0;
while (count < 5) { count++; }

// do statement example
int x = 0;
do { x++; } while (x < 5);
```

# Common mistakes
* Modifying the collection inside a `foreach` loop: Some enumerators (such as `List<T>`'s) are invalidated by structural changes and throw when advanced; behavior depends on the collection.
* Off-by-one errors in `for` loops: Using `<=` instead of `<` when the loop condition is intended to run exactly `n` times.
* Forgetting to update the loop variable in a `while` loop, leading to an infinite loop.

# Knowledge checks with answers
1. **Question:** Which loop is guaranteed to execute at least once?
   **Answer:** The `do` statement.
2. **Question:** What is the primary difference between `foreach` and `await foreach`?
   **Answer:** `await foreach` is used for asynchronous collections that require awaiting each element retrieval.
3. **Question:** Can you modify the `foreach iteration variable` inside the loop?
   **Answer:** No, the iteration variable is read-only.

*Source: [https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/iteration-statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/iteration-statements)*
