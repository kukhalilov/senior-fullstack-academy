<!-- Generated with gemini-3.1-flash-lite; automated review only; source and code verification pending. -->

This revised draft improves technical accuracy, clarifies the relationship between these concepts, and corrects minor omissions regarding how these features interact in modern C#.

---

## Simple explanation

In C#, these four concepts form a hierarchy of how we handle code as data:

1.  **Delegates**: Think of a delegate as a **"type-safe function pointer."** It is a type that defines a method signature. It allows you to treat methods as objects that can be passed as arguments, stored in variables, or returned from other methods.
2.  **Events**: An event is a **"publisher-subscriber mechanism."** It is a wrapper around a delegate that provides encapsulation. It allows an object to notify other objects when something happens, while restricting external classes from clearing the entire invocation list or invoking the event directly.
3.  **Lambdas**: A lambda is a **"concise syntax for anonymous functions."** Instead of defining a named method, you write a quick, inline block of code. It is the standard way to provide the logic for delegates and expression trees.
4.  **Expression Trees**: An expression tree is **"code as data."** Instead of compiling a lambda into executable IL (Intermediate Language) immediately, the compiler turns it into an abstract syntax tree (a data structure). This allows programs to inspect, modify, or translate the logic at runtime (e.g., converting C# code into SQL for Entity Framework).

---

## How it works

*   **Delegates**: You define a signature (input/output types). You then create an instance of that delegate and assign a method (or lambda) to it. When you "invoke" the delegate, it executes the assigned method(s).
*   **Events**: They use the `event` keyword to restrict access to the underlying delegate. Only the declaring class can invoke the event or clear the list; external classes can only subscribe (`+=`) or unsubscribe (`-=`).
*   **Lambdas**: The compiler translates `(x) => x * x` into either an anonymous method (if assigned to a `Delegate`) or an `Expression` object (if assigned to an `Expression<T>`).
*   **Expression Trees**: When you assign a lambda to an `Expression<T>`, the compiler generates a tree of objects (e.g., `BinaryExpression`, `ParameterExpression`). This tree can be traversed or compiled into a `Delegate` at runtime using the `.Compile()` method.

---

## Examples

### Delegate and Lambda
```csharp
// Using built-in Func delegate (no need to define a custom delegate type)
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(5, 3)); // Output: 8
```

### Event
```csharp
public class Alarm {
    public event Action OnRing; // The event
    public void Trigger() => OnRing?.Invoke(); // Safely invoke if listeners exist
}
```

### Expression Tree
```csharp
using System.Linq.Expressions;

Expression<Func<int, int>> expr = x => x + 1;
// We can inspect the tree structure
var binary = (BinaryExpression)expr.Body;
Console.WriteLine(binary.Left); // Output: x
// We can compile it to executable code
var compiled = expr.Compile();
Console.WriteLine(compiled(10)); // Output: 11
```

---

## Tradeoffs and comparisons

| Feature | Delegate | Event | Lambda | Expression Tree |
| :--- | :--- | :--- | :--- | :--- |
| **Purpose** | Method reference | Notification | Concise logic | Code analysis |
| **Performance** | High | Medium | High | Low (compilation overhead) |
| **Flexibility** | High | Restricted | High | Very High (inspectable) |

**Common Misconception**: People often think Lambdas are only for LINQ. In reality, they are just a syntax for creating delegates or expression trees. Another misconception is that events are "slow"—they are fast, but they can cause memory leaks if the subscriber is not removed (`-=`) when the subscriber's lifecycle is shorter than the publisher's.

---

## Interview questions and answers

**Q: What is the difference between `Action` and `Func`?**
*   **A:** Both are built-in delegate types. `Action` represents a method that returns `void`. `Func` represents a method that returns a value.

**Q: Why use an Expression Tree instead of a Lambda?**
*   **A:** Use an Expression Tree when you need to "read" the code logic at runtime. For example, Entity Framework uses them to translate C# LINQ queries into SQL queries. You cannot "read" the logic inside a standard `Delegate`.

**Q: What is a memory leak in events?**
*   **A:** If a long-lived object (the publisher) holds a reference to a short-lived object (the subscriber) via an event, the subscriber cannot be garbage collected. Always unsubscribe (`-=`) when the subscriber is disposed or no longer needed.

---

## Exercises and solutions

**Exercise 1**: Create a delegate using `Func` that takes two strings and returns their combined length.
*   **Solution**: `Func<string, string, int> lengthSum = (s1, s2) => s1.Length + s2.Length;`

**Exercise 2 (DSA)**: Given an array of integers, use a lambda to filter out numbers greater than 10.
*   **Solution**:
    ```csharp
    int[] nums = { 5, 12, 8, 20 };
    var result = nums.Where(n => n <= 10).ToArray();
    // Complexity: O(n) time, O(n) space.
    ```

---

## Review questions

1.  Can an event be invoked from outside the class that defines it? (No, only the owner can invoke it).
2.  What is the primary difference between `Func<T>` and `Expression<Func<T>>`? (One is a compiled delegate ready for execution; the other is a data structure representing the logic).
3.  How do you prevent memory leaks with events? (Unsubscribe using `-=` or use the Weak Event Pattern).

---

## Sources and limitations

*   **Uncertainty**: The performance impact of Expression Trees can vary significantly depending on whether you interpret them or call `.Compile()`.
*   **Limitations**: This guide covers standard C# behavior. It does not cover advanced topics like `Delegate.GetInvocationList`, the `WeakEventManager`, or complex Expression Tree visitors.
*   **Sources**: Information is based on standard Microsoft C# documentation and common industry patterns.
