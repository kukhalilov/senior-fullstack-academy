<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# statements, control flow, and exception-handling statement forms — Exercises and worked solutions

*This is an automatically generated draft.*

# Goals
* Understand the distinction between statements (actions) and expressions (values).
* Master control flow using selection, iteration, and jump statements.
* Learn how to manage resources and handle exceptions safely.
* Practice using C# 15 features like labeled jump statements.

# Worked example
In C#, a `Block statement` `{ ... }` defines a scope. Within this scope, we can use `if-else` for selection and `foreach` for iteration.

```csharp
// Example: Processing a collection with resource management
var items = new List<int> { 1, 2, 3 };

try {
    foreach (var item in items) {
        if (item % 2 == 0) {
            Console.WriteLine($"Even: {item}");
            continue; // Jump to next iteration
        }
        
        // Using a declaration for resource management
        using var reader = new StringReader("data");
        Console.WriteLine($"Odd: {item}");
    }
} catch (Exception ex) {
    Console.WriteLine(ex.Message);
} finally {
    // Cleanup logic
}
```
**Step-by-step:**
1. The `try-catch-finally` block ensures that if an error occurs, the `finally` clause executes.
2. The `foreach` statement iterates through the list.
3. The `if` statement checks the condition.
4. The `continue` statement skips the remainder of the current loop iteration.
5. The `using declaration` is scoped inside the `foreach` body, so its `StringReader` is disposed when that body iteration exits, including via `continue` or an exception.

# Exercises
1. **Selection:** Write a `switch statement` that evaluates an integer and uses a `when guard` to check if the number is greater than 10.
2. **Iteration:** Convert a `for statement` into a `while statement` that processes an array of strings.
3. **Jumps:** Create a nested loop structure and use a `Labeled break statement` (C# 15) to exit the outer loop from the inner loop.
4. **Resources:** Compare the usage of a `using statement` (block-scoped) versus a `using declaration` (scope-scoped).

# Progressive hints
* **Exercise 1:** Remember that a `switch section` requires a `case pattern label` or `case constant label`. The `when guard` follows the pattern.
* **Exercise 2:** A `for iteration clause` usually contains initialization, condition, and iterator. In a `while statement`, move the initialization outside and the iterator to the end of the block.
* **Exercise 3:** To use a `Labeled break statement`, prefix your outer loop with an identifier followed by a colon (e.g., `OuterLoop: for(...)`). Then use `break OuterLoop;`.
* **Exercise 4:** A `using statement` may use a block or a single embedded statement. A `using declaration` ends with a semicolon and disposes the object when its enclosing scope exits.

# Complete solutions
1. **Selection:**
   ```csharp
   switch (x) {
       case int n when n > 10: Console.WriteLine("Large"); break;
       default: Console.WriteLine("Small"); break;
   }
   ```
2. **Iteration:**
   ```csharp
   int i = 0;
   while (i < arr.Length) { Console.WriteLine(arr[i]); i++; }
   ```
3. **Jumps:**
   ```csharp
   Outer: for(int i=0; i<5; i++) {
       for(int j=0; j<5; j++) {
           if (i+j > 5) break Outer; // Exits both loops
       }
   }
   ```
4. **Resources:** `using statement` limits the scope explicitly to the block; `using declaration` is cleaner for simple scenarios where the variable is needed until the end of the current method or block.

# Tests and edge cases
* **Empty statement:** A lone `;` is valid but often indicates a logic error (e.g., `if (x > 0);`).
* **Labeled statements:** Ensure labels are unique within the same scope.
* **Exception filters:** Prefer filters on stable exception properties or application state rather than message text, which may change or be localized. A filter condition that throws is treated as false.
* **Unsafe:** Pointer declarations and operations require an unsafe context and the project must enable unsafe blocks. `fixed` is needed when a pointer must keep movable managed storage pinned; not every pointer requires `fixed` (for example, stack-allocated memory).

# Reflection questions
1. Why does C# provide both `using statement` and `using declaration`? How does the scope differ?
2. In what scenario would you prefer a `goto statement` over a structured loop? (Hint: Usually, you wouldn't, but consider complex state machines).
3. How do `checked statement` and `unchecked statement` affect arithmetic operations in your code?
4. What is the difference between `break statement` and `yield break statement`? (Hint: One exits a loop, the other exits an iterator).

*Source: [Microsoft Learn C# statements reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/)*
