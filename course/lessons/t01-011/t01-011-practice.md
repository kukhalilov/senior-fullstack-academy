
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

public sealed class Processor
{
    public event EventHandler<int>? NumberProcessed;

    public void Process(List<int> numbers, Predicate<int> filter)
    {
        foreach (int number in numbers)
        {
            if (filter(number))
                NumberProcessed?.Invoke(this, number);
        }
    }
}

public static class Program
{
    public static void Main()
    {
        var proc = new Processor();
        proc.NumberProcessed += (_, number) => Console.WriteLine($"Processed: {number}");
        proc.Process(new List<int> { 1, 2, 3 }, number => number > 1);
    }
}
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
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

public sealed class Counter
{
    private int count;
    public event EventHandler? ThresholdReached;

    public void Increment()
    {
        count++;
        if (count == 11)
            ThresholdReached?.Invoke(this, EventArgs.Empty);
    }
}

public static class Program
{
    public static void Main()
    {
        Func<int, int, int> multiply = (a, b) => a * b;
        int result = multiply(5, 10);

        var counter = new Counter();
        counter.ThresholdReached += (_, _) => Console.WriteLine("Threshold crossed");
        for (int i = 0; i < 11; i++) counter.Increment();

        var words = new List<string> { "apple", "banana", "kiwi" };
        List<string> longWords = words.FindAll(word => word.Length > 5);

        Expression<Func<int, bool>> expression = value => value > 5;
        Func<int, bool> predicate = expression.Compile();
        bool check = predicate(10);

        Console.WriteLine($"Product: {result}; long words: {longWords.Count}; predicate(10): {check}");
    }
}
```

# Tests and edge cases

* **Null Delegates**: Always use `?.Invoke()` or check for `null` before calling a delegate to prevent `NullReferenceException`.
* **Multicast Exceptions**: If a multicast delegate (a delegate with multiple methods in its invocation list) throws an exception, subsequent methods in the list will not execute.
* **Closure lifetime**: A captured `for` loop variable is one variable shared across iterations, so delegates invoked later can all observe its final value. Create a per-iteration local when each delegate must keep that iteration's value; `foreach` iteration-variable capture semantics differ in modern C#.
* **Expression trees**: The compiler cannot convert `async` or statement-bodied lambdas into `Expression<TDelegate>`. Expression trees represent supported expression-bodied lambda syntax; the expression-tree API can construct additional node shapes manually.

# Reflection questions

1. When should you choose an `event` over a simple `delegate`? (Consider: Who should be allowed to invoke the behavior?) **Suggested answer:** Use an event for publisher-owned notifications when external code may subscribe or unsubscribe but only the declaring type should raise the notification. Use a delegate property or parameter when callers are intended to control or invoke the callback directly.
2. Why does an `Expression<T>` behave differently than a `Func<T>` even if they look the same in code? **Suggested answer:** A `Func<T>` is executable behavior; an `Expression<TDelegate>` is a data structure describing supported code that can be inspected, transformed, or compiled into a delegate.
3. What is the performance impact of creating a `closure`? (Consider: Does it create an object on the heap?) **Suggested answer:** Capturing local state commonly requires a compiler-generated object that keeps the captured variables alive, but allocation depends on the code and compiler optimization; non-capturing lambdas can often be cached or represented without a per-call closure allocation.
4. How does `Delegate.GetInvocationList` help you debug multicast delegates? **Suggested answer:** It returns the individual handlers in invocation order so you can inspect their methods and targets, or invoke them separately when diagnosing which handler fails.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/delegates-lambdas)*
