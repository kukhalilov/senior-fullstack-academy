<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# delegates events lambdas closures and expression trees — Exercises and worked solutions

# Goals

This lesson covers the foundational C# mechanisms for passing behavior as data and managing notifications. By the end, you will understand:
* How to use `delegate` types to pass methods as arguments.
* How to implement the observer pattern using `event`.
* How to write concise logic using `lambda` expressions.
* How to capture state using `closure` mechanics.
* How to represent code as data using `Expression<TDelegate>`.

# Worked example

Imagine a system that processes a list of numbers. We want to filter them and notify a logger when a number is processed.

```csharp
using System;
using System.Collections.Generic;

public class Processor {
    // Event: Notification mechanism
    public event EventHandler<int> NumberProcessed;

    public void Process(List<int> numbers, Predicate<int> filter) {
        foreach (var n in numbers) {
            if (filter(n)) { // Delegate usage
                NumberProcessed?.Invoke(this, n); // Null-conditional event invocation
            }
        }
    }
}

// Usage
var proc = new Processor();
proc.NumberProcessed += (sender, n) => Console.WriteLine($"Processed: {n}");
proc.Process(new List<int> { 1, 2, 3 }, n => n > 1); // Lambda expression
```

**Step-by-step:**
1. **Delegate**: `Predicate<int>` is a built-in delegate type representing a method that takes an `int` and returns `bool`.
2. **Event**: `NumberProcessed` allows external code to subscribe to notifications.
3. **Lambda**: `n => n > 1` is an anonymous function passed as the `filter` argument.
4. **Closure**: If the lambda used a local variable from the outer scope (e.g., `int threshold = 1; n => n > threshold`), it would form a **closure**.

# Exercises

1. **Delegate Practice**: Create a `Func<int, int, int>` variable that performs multiplication. Use it to multiply two numbers.
2. **Event Practice**: Define a class `Counter` with an event `ThresholdReached`. Raise it when a count exceeds 10.
3. **Lambda Practice**: Use a `List<string>` and the `FindAll` method with a lambda to filter strings longer than 5 characters.
4. **Expression Tree**: Create an `Expression<Func<int, bool>>` that represents the logic `x => x > 5`. Compile it into a delegate and invoke it.

# Progressive hints

* **Hint 1 (Delegates)**: `Func<T, T, TResult>` takes two inputs and returns one. Assign a lambda directly to it: `Func<int, int, int> multiply = (a, b) => a * b;`.
* **Hint 2 (Events)**: Use `EventHandler<TEventArgs>` for standard patterns. Remember to use `?.Invoke` to avoid `NullReferenceException` if no one is subscribed.
* **Hint 3 (Lambdas)**: If you need to capture a variable, ensure it isn't a `ref` or `out` parameter, as these cannot be captured.
* **Hint 4 (Expression Trees)**: Use `Expression.Lambda<Func<int, bool>>(...)` to build the tree manually, or simply assign a lambda to an `Expression<T>` variable to have the compiler build it for you.

# Complete solutions

```csharp
// 1. Delegate
Func<int, int, int> multiply = (a, b) => a * b;
int result = multiply(5, 10);

// 2. Event
public class Counter {
    public event EventHandler ThresholdReached;
    public void Add() { ThresholdReached?.Invoke(this, EventArgs.Empty); }
}

// 3. Lambda
var words = new List<string> { "apple", "banana", "kiwi" };
var longWords = words.FindAll(w => w.Length > 5);

// 4. Expression Tree
Expression<Func<int, bool>> expr = x => x > 5;
var compiled = expr.Compile();
bool check = compiled(10); // true
```

# Tests and edge cases

* **Null Delegates**: Always use `?.Invoke()` or check for `null` before calling a delegate to prevent `NullReferenceException`.
* **Multicast Exceptions**: If a multicast delegate (a delegate with multiple methods in its invocation list) throws an exception, subsequent methods in the list will not execute.
* **Closure Lifetime**: Be careful with closures in loops. In older C# versions, capturing a loop variable could lead to unexpected behavior; always capture a local copy inside the loop if needed.
* **Expression Trees**: Not all C# syntax is supported in expression trees (e.g., `async` lambdas or complex blocks). Attempting to convert unsupported code to an expression tree will cause a compile-time error.

# Reflection questions

1. When should you choose an `event` over a simple `delegate`? (Consider: Who should be allowed to invoke the behavior?)
2. Why does an `Expression<T>` behave differently than a `Func<T>` even if they look the same in code?
3. What is the performance impact of creating a `closure`? (Consider: Does it create an object on the heap?)
4. How does `Delegate.GetInvocationList` help you debug multicast delegates?

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/delegates-lambdas)*
