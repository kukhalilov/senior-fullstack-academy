
# delegates events lambdas closures and expression trees — Big-picture orientation and mental model

# Problem and purpose
In C#, you often need to pass "behavior" (code) to other parts of your program, or notify multiple parts of your program when something happens. Hard-coding these interactions makes your code rigid and difficult to reuse.

Delegates, events, lambdas, and expression trees provide a flexible way to decouple components. They allow you to:
*   Pass methods as arguments to other methods.
*   Create notification systems where objects can "listen" for changes.
*   Represent code as data that can be inspected or translated into other languages (like SQL).

# Plain-language mental model
Think of these concepts as a hierarchy of "code-as-a-value":

1. **Delegate**: A type-safe reference object whose invocation list contains callable targets matching a delegate signature; it is more than a raw function pointer.
2.  **Event**: A "subscription service." It uses delegates to allow other parts of your program to sign up for notifications without the sender needing to know who the listeners are.
3.  **Lambda**: A "shortcut." It is a quick way to write a method inline without giving it a formal name.
4.  **Closure**: A "memory-keeper." When a lambda uses a variable from its surrounding scope, it "closes over" that variable, keeping it alive even after the original scope finishes.
5.  **Expression Tree**: A "blueprint." Instead of running the code immediately, it stores the code as a data structure (a tree of nodes) that can be analyzed or converted into something else, like a database query.

# How the parts fit together
These features work in layers:
*   **Delegates** are the foundation. They define the signature (input/output types) that methods must match.
*   **Lambdas** are the most common way to create instances of delegates.
*   **Events** wrap delegates to provide a safe, controlled way for objects to communicate.
*   **Expression Trees** use the same syntax as lambdas but, instead of creating a runnable delegate, they create a data structure that represents the logic.

# Concept map
*   **Delegates**: Type-safe objects representing callable methods.
*   **Events**: Controlled notification mechanisms.
*   **Lambdas**: Anonymous functions used to create delegates or expression trees.
*   **Closures**: Lambdas that capture outer variables, extending their lifetime.
*   **Expression Trees**: Data representations of code, used by providers (like database drivers) to translate C# logic into other formats.

# End-to-end walkthrough
Imagine a `Button` class in a user interface:

1.  **The Delegate**: You define a delegate type `void ClickHandler()` to represent the signature of any method that handles a click.
2.  **The Event**: The `Button` exposes an `event ClickHandler OnClick`. This allows other parts of the app to say `button.OnClick += MyMethod;`.
3.  **The Lambda**: Instead of writing a full method, you use a lambda: `button.OnClick += () => Console.WriteLine("Clicked!");`.
4.  **The Closure**: If you need to track clicks, you might write:
    ```csharp
    int count = 0;
    button.OnClick += () => { count++; Console.WriteLine(count); };
    ```
    Here, the lambda "captures" the `count` variable, creating a **closure**.
5.  **The Expression Tree**: For a provider-backed query, an expression tree such as `Expression<Func<Row, bool>>` can represent a predicate for translation. Whether a provider translates a particular node or captured value depends on that provider; a local UI callback is not automatically a database query.

# When to use it and tradeoffs
*   **Use Delegates** when you need to pass a specific behavior to a method (e.g., a custom sorting rule).
*   **Use Events** when you have a "one-to-many" relationship where multiple objects need to react to a single action.
*   **Use Lambdas** for short, one-off logic to keep code concise.
*   Use expression trees when code must be inspected, transformed, or translated. They add construction/compilation costs relative to direct delegate use; Native AOT interprets expression trees because runtime code generation is unavailable.

**Tradeoffs:**
*   **Allocations**: Capturing lambdas extend captured-variable lifetimes and commonly use compiler-generated storage; exact allocations and caching are implementation/optimization dependent, so measure hot paths.
*   **Complexity**: Expression trees are powerful but carry overhead for compilation and are limited to specific syntax patterns.
*   **Memory**: Events can cause "memory leaks" if a subscriber forgets to unsubscribe, as the event delegate can retain its subscriber target while subscribed.

# What later lessons cover
*   **Delegate mechanics**: How to combine multiple methods into one delegate (multicast) and handle return values.
*   **Event patterns**: Best practices for defining `EventArgs` and implementing the standard .NET event pattern.
*   **Advanced Lambdas**: Using `static` lambdas to prevent accidental memory captures and using attributes on parameters.
*   **Expression Tree API**: How to manually build and traverse trees using the `System.Linq.Expressions` namespace.

*Source: [Microsoft C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/delegates-lambdas)*
