<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# delegates events lambdas closures and expression trees — Core concepts and how they fit together

*This is an automatically generated draft.*

# Learning objectives
* Understand how to pass behavior as data using delegates.
* Distinguish between simple callbacks and observer-style events.
* Master lambda expressions, closures, and the impact of variable capture.
* Learn how to represent code as data using expression trees for translation (e.g., to SQL).

# Prerequisites
* Basic understanding of C# types and methods.
* Familiarity with object-oriented concepts like classes and instances.
* Knowledge of generic types (e.g., `List<T>`).

# Core concepts
In C#, code is usually static. However, to build flexible systems, you often need to pass "behavior" to other parts of your program.

1.  **Delegates**: A `Delegate type declaration` is a type-safe object that acts as a placeholder for a method. It allows an API to accept a method as a parameter.
2.  **Events**: An `Event` is a specialized wrapper around a delegate. It allows a "publisher" to notify "subscribers" when something happens, while restricting who can trigger the notification.
3.  **Lambdas**: A `Lambda expression` is a concise way to write an anonymous function. Depending on how you use it, it can become a delegate (executable code) or an expression tree (data representing code).
4.  **Closures**: A `Closure` occurs when a lambda "captures" variables from its surrounding scope, keeping them alive even after the original scope finishes.
5.  **Expression Trees**: An `Expression tree` is a data structure that represents code. Unlike a delegate, you cannot "run" an expression tree directly; you must inspect it or compile it into a delegate first.

# Mechanisms and relationships
Think of these concepts as a hierarchy of flexibility:
* **Delegates** are the foundation. They define the "signature" (input/output) of the behavior.
* **Events** use delegates to provide a safe, one-to-many communication channel.
* **Lambdas** are the syntax used to create these behaviors on the fly.
* **Expression Trees** are a special interpretation of lambdas used when you need to analyze the code (like translating a C# query into a database query) rather than just running it.

# Worked examples

### 1. Using a Delegate
```csharp
// Define a delegate type
public delegate int MathOperation(int x, int y);

// A method that accepts the delegate
public int Execute(int a, int b, MathOperation op) => op(a, b);

// Usage
MathOperation add = (x, y) => x + y;
int result = Execute(5, 3, add); // result is 8
```

### 2. Understanding Closures
```csharp
int factor = 10;
// The lambda captures 'factor'
Func<int, int> multiplier = x => x * factor;
factor = 20;
// The closure observes the current value of the captured variable
Console.WriteLine(multiplier(2)); // Outputs 40
```

### 3. Expression Trees vs. Delegates
```csharp
// Delegate: Executable code
Func<int, bool> isPositive = x => x > 0;

// Expression Tree: Data representing code
Expression<Func<int, bool>> isPositiveTree = x => x > 0;

// You can inspect the tree
var body = (BinaryExpression)isPositiveTree.Body;
Console.WriteLine(body.NodeType); // Outputs "GreaterThan"
```

# Misconceptions and edge cases
* **Events vs. Delegates**: Use a `Delegate` when you want a single callback. Use an `Event` when you want to allow multiple independent subscribers to listen to a notification.
* **Closure Lifetime**: Capturing a variable extends its lifetime at least until the delegate or expression tree that references it becomes eligible for garbage collection. This can lead to memory leaks if not managed carefully.
* **Static Lambdas**: Use `static lambda` to make the no-capture rule explicit. This can prevent closure capture, but does not guarantee a particular allocation or performance result.
* **Expression Tree Limitations**: Not all C# code can be converted to an `Expression tree`. Complex logic, such as `async` methods or certain loops, cannot be represented as data.

# Knowledge checks with answers

1. **Question**: What is the primary difference between a `Delegate` and an `Event`?
   * **Answer**: A `Delegate` is a type that represents a method; an `Event` is a wrapper that provides controlled access (add/remove) to a delegate, typically used for notifications.

2. **Question**: Why would you use an `Expression tree` instead of a `Delegate`?
   * **Answer**: You use an `Expression tree` when you need to analyze or translate the code (e.g., converting a C# query to SQL) rather than just executing it.

3. **Question**: What happens to captured variables in a closure?
   * **Answer**: The closure extends the lifetime of the captured variables, and subsequent invocations of the lambda will see the current state of those variables.

4. **Question**: Can you invoke an `Event` from outside the class that declared it?
   * **Answer**: No, only the declaring type can raise a field-like event.

*Source: [Microsoft C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/delegates-lambdas)*
