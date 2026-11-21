
# delegates events lambdas closures and expression trees — Interview questions and reasoning

# Core questions
To understand delegates, events, lambdas, and expression trees, think of them as tools for passing behavior around your code.
*   **Delegates** are type-safe function pointers. They allow you to treat a method as a value.
*   **Events** are a specialized use of delegates that implement the Observer pattern, allowing objects to notify others when something happens.
*   **Lambdas** are concise, anonymous functions that can be converted into either delegates (for execution) or expression trees (for data analysis).
*   **Expression trees** represent code as a data structure, allowing libraries like Entity Framework to translate your C# logic into other languages like SQL.

# Concise interview answers
*   **What is a delegate?** A delegate is a type-safe object that represents one or more callable methods. It allows an API to accept behavior as a value.
*   **What is the difference between a delegate and an event?** A delegate is a type; an event is a member that provides controlled subscription to a notification. Only the declaring type can raise an event, whereas any holder of a delegate can invoke it.
*   **What is a closure?** A closure is a function combined with its captured outer variables. It extends the lifetime of those variables so they remain accessible even after the original scope has exited.
*   **What is an expression tree?** An expression tree is a data representation of code. Unlike a delegate, which is executable, an expression tree can be inspected, modified, or translated by a provider (e.g., `IQueryProvider`).

# Deep follow-up answers
*   **How do multicast delegates handle return values?** When a multicast delegate (a delegate with multiple methods in its invocation list) is invoked, it returns the result of the *last* method in the list. Previous results are discarded.
*   **Why use `static` lambdas?** A `static` lambda prohibits capture of enclosing local variables and instance state. This makes the boundary explicit and can prevent a particular accidental retention path, but is not a general memory-leak fix.
*   **What are the limitations of expression trees?** Not all C# code can be represented as an expression tree. They are limited to specific node types (e.g., `BinaryExpression`, `MethodCallExpression`). Complex logic, such as certain loops or `async` methods, cannot be easily converted into an expression tree.
*   **How does `Expression<TDelegate>.Compile` work?** It translates the data structure of the expression tree into an executable delegate at runtime. This process has a performance cost and may face constraints in environments using Native AOT (Ahead-of-Time compilation) or aggressive trimming.

# Scenario questions
*   **Scenario:** You need to notify multiple UI components when a data property changes.
    *   **Approach:** Use an `event` with `PropertyChangedEventHandler`. This enforces the publisher-subscriber pattern and prevents external classes from raising the event directly.
*   **Scenario:** You are writing a library that translates C# queries into SQL.
    *   **Approach:** Use `Expression<TDelegate>`. By accepting an expression tree instead of a delegate, your library can inspect the `LambdaExpression.Body` to generate the corresponding SQL query.
*   **Scenario:** You need to pass a simple calculation to a sorting method.
    *   **Approach:** Use a `lambda` expression. It is more concise than defining a named method and can be implicitly converted to a `Comparison<T>` or `Func<T, TResult>`.

# Tradeoffs and alternatives
*   **Delegate vs. Event:** Use a delegate when you need a callback (the caller expects a return value or a specific action). Use an event for a notification contract, commonly with multiple subscribers and `void` handlers; a return-valued event is legal but has multicast semantics that often make results ambiguous.
*   **Expression Tree vs. Delegate:** Use a delegate for high-performance execution. Use an expression tree only when you need to analyze or transform the code logic (e.g., LINQ providers).
*   **Closure vs. Static Lambda:** Closures can retain captured objects while the delegate remains reachable. Use `static` lambdas when capture is not intended; they prohibit access to enclosing locals and instance state, while allowing static members and constants.

# Common weak answers
*   **"Events are just delegates."** This is imprecise. While events use delegates, they provide encapsulation. A weak answer fails to mention that only the declaring type can raise the event.
*   **"Lambdas are always faster."** Captured lambdas extend captured-state lifetimes and commonly use generated storage; exact allocation and performance depend on context and implementation.
*   **"Expression trees are just a way to run code."** This misses the point. Expression trees are for *inspecting* code. If you just want to run code, use a delegate.

# Self-check rubric
*   **Can you explain the difference between `Expression<T>` and `Func<T>`?** (One is data, one is executable).
*   **Do you know how to prevent memory leaks with events?** (Unsubscribe using `-=` when the subscriber is disposed).
*   **Can you identify when a lambda becomes a closure?** (When it references a variable from the surrounding scope).
*   **Are you aware of the C# version improvements?** (e.g., C# 10+ natural function types, C# 12 default parameters in lambdas).

*Sources:*
[Microsoft C# Delegates](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/)
[Microsoft C# Events](https://learn.microsoft.com/en-us/dotnet/csharp/events-overview)
[Microsoft C# Lambda Expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions)
[Microsoft C# Expression Trees](https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/)
