<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# delegates events lambdas closures and expression trees — Reference: Delegate declarations, instances, invocation lists, and built-in families

# Scope and version
This reference lesson covers the delegate types, instances, invocation lists, and built-in delegate families for C# 15 / .NET 11 stable surface checked on 2026-11-14, based on the Microsoft C# language reference, programming guide, .NET API reference, and release notes. For further reading, consult the [C# delegates programming guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/) and the [delegates and lambdas fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/delegates-lambdas).

# How this group fits the mental model
In C#, a delegate is a type-safe object that represents one or more callable methods, letting an API accept behavior as a value. The inventory items in this group form the core vocabulary for declaring those types, instantiating them from named methods or lambdas, combining them into multicast chains, inspecting their metadata, and utilizing the standard built-in functional delegate families (`Func`, `Action`, `Predicate`, `Comparison`, `Converter`). Understanding these primitives is a prerequisite for handling events, passing callbacks, and transforming behaviors before advancing to lambda closures and expression trees.

# Supplied names explained
* `Delegate type declaration`: The syntax that defines a new delegate type by specifying its return type, parameter list, and accessibility. It establishes a distinct reference type derived from `System.Delegate`.
* `Delegate signature`: The exact contract defined by a delegate type—comprising its return type and parameter types—that candidate methods must match (subject to delegate variance).
* `Delegate instance`: An instantiated object of a delegate type that holds a reference to one or more methods to invoke.
* `Named method delegate conversion`: The conversion of a compatible existing method into a delegate instance by referencing its name directly.
* `Delegate invocation`: The execution of the methods wrapped by a delegate instance, matching the parameter signature of the delegate type.
* `Delegate Invoke method`: The compiler-generated or explicitly exposed method on a delegate type (`Invoke`) that executes the underlying invocation list synchronously.
* `Null delegate invocation`: Attempting to invoke a delegate reference whose value is `null`, which throws a `NullReferenceException` at runtime (per the accuracy facts).
* `Null-conditional delegate invocation`: `?.Invoke()` calls the delegate only when non-null; it does not catch exceptions thrown by targets.
* `Multicast delegate`: A delegate instance that holds an ordered invocation list containing more than one target method.
* `Invocation list`: The ordered sequence of delegate entries invoked by a multicast delegate; its concrete internal representation is an implementation detail.
* `Delegate combination operator +`: Combines compatible delegates of the same delegate type into a multicast delegate; invocation-list entries retain order.
* `Delegate removal operator -`: An operator used to construct a new delegate instance by removing occurrences of a target delegate's methods from another delegate's invocation list.
* `Delegate combination assignment +=`: A shorthand assignment operator that appends a method or delegate instance to an existing delegate variable's invocation list.
* `Delegate removal assignment -=`: A shorthand assignment operator that removes a method or delegate instance from an existing delegate variable's invocation list.
* `Delegate equality`: The comparison semantics for delegates; two delegate instances are generally considered equal if they have the same invocation lists in the same order, or under specific method/target match rules.
* `Delegate.GetInvocationList`: Returns an array of individual delegate entries in invocation order; a single-cast delegate yields one entry.
* `Delegate.Method`: A property returning the `MethodInfo` reflection object representing the method invoked by the delegate (for single-target delegates or the representative entry).
* `Delegate.Target`: A property returning the object instance (or `null` for static methods) on which the delegate invokes its target method.
* `Delegate.DynamicInvoke`: Invokes a delegate using runtime argument objects and late signature checking; it may box value types and is less type-safe and generally slower than direct invocation. Target exceptions are surfaced through reflection-style exception behavior.
* `Func<TResult>`: A built-in generic delegate family member representing a method that takes no parameters and returns a value of type `TResult`.
* `Func<T,TResult>`: A built-in generic delegate representing a method that takes one parameter of type `T` and returns a value of type `TResult`.
* `Action`: A built-in non-generic delegate representing a method that takes no parameters and returns `void`.
* `Action<T>`: A built-in generic delegate representing a method that takes one parameter of type `T` and returns `void`.
* `Predicate<T>`: A built-in generic delegate representing a method that defines a set of criteria and determines whether the specified object of type `T` meets those criteria, returning a `bool`.
* `Comparison<T>`: A built-in generic delegate representing a method that compares two objects of the same type (`T` and `T`), returning an integer indicating their relative order.
* `Converter<TInput,TOutput>`: A built-in generic delegate representing a method that converts an object from one type (`TInput`) to another (`TOutput`).
* `Custom delegate versus Func/Action`: The architectural choice between defining a custom named delegate type versus reusing generic `Func` and `Action` variants based on readability, semantic intent, and API stability.
* `Delegate return value from multicast invocation`: The behavioral rule where invoking a multicast delegate with a non-void return value returns the return value of the *final* invoked method in the list, discarding all intermediate return values.
* `Exception propagation in multicast invocation`: In ordinary invocation, an unhandled exception from an entry propagates and later entries are not invoked; explicitly enumerate entries to isolate failures.
* `Delegate variance boundary`: The set of rules governing covariance (returning more derived types) and contravariance (accepting less derived parameter types) for delegate types, managed under .NET type safety rules.

# Cross-item comparison
No within-group comparison applies beyond the conceptual distinctions already outlined among the inventory items (such as single versus multicast invocation behaviors, and custom delegates versus built-in `Func`/`Action` families).

# Examples

```csharp
using System;

// 1. Delegate type declaration and signature
public delegate void StatusLogHandler(string message);

public class Program
{
    public static void Main()
    {
        // 2. Named method delegate conversion and instance creation
        StatusLogHandler logger = LogToConsole;

        // 3. Multicast combination assignment += and delegate invocation
        logger += LogToPrefix;

        // 4. Null-conditional delegate invocation
        logger?.Invoke("System starting up.");

        // 5. Inspecting the invocation list and target metadata
        Delegate[] list = logger.GetInvocationList();
        Console.WriteLine($"Total handlers in chain: {list.Length}");
        foreach (Delegate d in list)
        {
            Console.WriteLine($"Target method: {d.Method.Name}, Target object: {d.Target ?? (object)"static"}");
        }

        // 6. Built-in Func and Action families usage
        Action<string> printAction = msg => Console.WriteLine($"[Action]: {msg}");
        printAction("Executing lambda via built-in Action.");

        Func<int, int, int> addFunc = (a, b) => a + b;
        int sum = addFunc(5, 10);
        Console.WriteLine($"Func result: {sum}");

        // 7. Delegate removal assignment -=
        logger -= LogToPrefix;
        logger?.Invoke("Only console logger remains.");
    }

    public static void LogToConsole(string message)
    {
        Console.WriteLine($"[Console]: {message}");
    }

    public static void LogToPrefix(string message)
    {
        Console.WriteLine($"[Prefix]: >>> {message}");
    }
}
```

Expected output (outside code fences):
```text
[Console]: System starting up.
[Prefix]: >>> System starting up.
Total handlers in chain: 2
Target method: LogToConsole, Target object: static
Target method: LogToPrefix, Target object: static
[Action]: Executing lambda via built-in Action.
Func result: 15
[Console]: Only console logger remains.
```

# Common mistakes
* Forgetting that invoking a `null` delegate reference throws a `NullReferenceException`, which can be avoided using null-conditional invocation (`?.Invoke()`).
* Assuming that a multicast delegate with a return value aggregates all results; recall that only the final invoked method's return value is returned, and intermediate values are discarded.
* Expecting a multicast invocation chain to continue executing after an exception is thrown; an exception in any handler halts the entire invocation list.
* Using reflection-heavy `Delegate.DynamicInvoke` in performance-critical paths instead of direct delegate invocation.

# Knowledge checks with answers
1. **Question:** What happens when you invoke a multicast delegate that returns a non-void value?
   * **Answer:** It executes all methods in the invocation list sequentially, but the final return value returned to the caller is solely from the last method in the list; intermediate return values are discarded.
2. **Question:** How does a null-conditional delegate invocation (`delegateInstance?.Invoke(...)`) help prevent errors?
   * **Answer:** It checks whether the delegate reference is `null` before attempting invocation, skipping the call safely instead of throwing a `NullReferenceException`.
3. **Question:** What occurs during a multicast invocation if the first method in the invocation list throws an exception?
   * **Answer:** The exception propagates immediately, halting normal progression through the remaining methods in the invocation list.
4. **Question:** What is the primary difference between `Action` and `Func<TResult>`?
   * **Answer:** `Action` represents a method that returns `void` (no return value), whereas `Func<TResult>` represents a method that returns a value of type `TResult`.
