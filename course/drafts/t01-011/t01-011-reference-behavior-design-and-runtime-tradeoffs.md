<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# delegates events lambdas closures and expression trees — Reference: Callback versus notification, allocations, async and provider boundaries

*This is an automatically generated draft.*

# Scope and version
This lesson covers the behavioral design and runtime tradeoffs for delegates, events, lambdas, and expression trees in C# 15 / .NET 11. It focuses on the architectural decisions required when choosing between callbacks and notifications, managing allocations, and navigating provider boundaries.

# How this group fits the mental model
In C#, you often need to pass logic as data. A **delegate** is a type-safe callable object representing one or more targets. An **event** is a specialized wrapper around a delegate that enforces a "publisher-subscriber" pattern, preventing external code from clearing the invocation list. **Lambdas** provide a concise syntax to create these delegates, while **expression trees** allow code to be treated as data structures for translation (e.g., to SQL). Understanding the tradeoffs in this group helps you decide whether to use a simple callback or a robust event, and when to avoid the performance overhead of closures or expression tree compilation.

# Supplied names explained

* `Callback delegate`: A delegate used to pass a specific unit of work to a method. It is typically used for a single operation where the caller expects a result or a specific action.
* `Event notification`: A mechanism where an object signals that something has happened. Unlike a callback, the publisher does not necessarily care who is listening or how many listeners exist.
* `Delegate versus event API boundary`: The design decision to expose a delegate directly (allowing external invocation and clearing) versus wrapping it in an `event` (restricting access to `+=` and `-=` only).
* `Single-cast callback contract`: A design pattern where a delegate is expected to hold exactly one target method.
* `Multicast callback contract`: A design pattern where a delegate holds an invocation list of multiple methods, all of which are executed when the delegate is invoked.
* `Event handler ordering`: The sequence in which subscribers are notified. While the runtime maintains an invocation list, relying on specific execution order is generally discouraged as it creates tight coupling.
* `Event handler exception policy`: The behavior when a subscriber throws an exception. In a multicast delegate, an unhandled exception in one subscriber typically prevents subsequent subscribers from being notified.
* `Synchronous event delivery`: The default behavior where the publisher waits for all subscribers to finish executing before continuing.
* `Asynchronous event delivery`: A pattern where the publisher invokes subscribers via a task-based approach to prevent blocking the main execution flow.
* `Event reentrancy`: A scenario where an event handler triggers another event or calls back into the publisher, potentially leading to stack overflows or inconsistent state.
* `Lambda allocation considerations`: The performance impact of creating lambda objects. Capturing variables commonly uses compiler-generated storage, but exact allocations depend on code and runtime/compiler optimization.
* `Closure allocation considerations`: The memory overhead incurred when a lambda captures local variables, extending their lifetime beyond the scope of the method.
* `Static lambda allocation boundary`: Using `static` to prohibit capture; this can enable optimizations, but does not guarantee allocation-free delegate creation.
* `Delegate caching`: Storing a delegate instance to reuse it, reducing the allocation frequency of repeated lambda expressions.
* `Expression tree construction cost`: The overhead of building a data structure representing code at runtime, which is significantly higher than creating a simple delegate.
* `Expression tree compilation cost`: The cost of converting an expression tree into an executable delegate at runtime using `Compile()`.
* `Expression tree provider translation limits`: The constraint that not all C# syntax can be translated by providers (like LINQ-to-SQL); complex logic inside a lambda may fail to translate.
* `Expression tree trimming and Native AOT constraints`: Trimming can require care around dynamically accessed members; Native AOT does not support runtime code generation and uses the interpreted expression-tree implementation.
* `Prefer named method for complex behavior`: A best practice to improve readability and debuggability by replacing long, complex lambdas with named methods.
* `Prefer event when subscribers are independent`: A design guideline suggesting events when multiple, unrelated components need to react to a state change.
* `Prefer callback when caller supplies one operation`: A design guideline suggesting delegates when the caller is providing a specific strategy or transformation for a single task.
* `Avoid event for required return value`: A rule of thumb because events are designed for notifications; if you need a return value from the logic, use a delegate/callback instead.

# Cross-item comparison
* **Delegate vs. Event**: Use a delegate for a direct callback; use an event for a broadcast notification where the publisher shouldn't be controlled by the subscriber.
* **Callback vs. Observer-style event**: A callback is a direct "do this for me" request; an observer-style event is a "something happened, react if you want" notification.
* **Lambda (Delegate) vs. Lambda (Expression Tree)**: A delegate lambda is executable code; an expression tree lambda is a data structure that can be inspected or translated.
* **Captured vs. Static Lambda**: Captured lambdas extend captured-state lifetime and commonly require generated storage; static lambdas prohibit capture. Neither form guarantees a particular allocation profile.

# Examples
* **Callback**: `Action<int> callback = x => Console.WriteLine(x);` (Simple, single-cast).
* **Event**: `public event EventHandler Changed;` (Encapsulated notification).
* **Static Lambda**: `Func<int, int> square = static x => x * x;` (No closure, no allocation).

# Common mistakes
* **Exception handling**: Assuming that if one event subscriber throws an error, the others will still run. (They won't).
* **Memory leaks**: Subscribing to an event on a long-lived object without unsubscribing, which prevents the subscriber from being garbage collected.
* **Overusing Expression Trees**: Using expression trees when a simple delegate would suffice, incurring unnecessary performance costs.

# Knowledge checks with answers
1. **Question**: Why should you use `static` on a lambda?
   **Answer**: To prohibit access to enclosing locals and instance state; any allocation or caching effect depends on the generated delegate and use context.
2. **Question**: Can you get a return value from an event?
   **Answer**: No, events are designed for notifications. Use a delegate if you need to return a value from the invoked logic.
3. **Question**: What happens to subsequent subscribers if one subscriber in a multicast delegate throws an exception?
   **Answer**: The execution of the invocation list is interrupted, and subsequent subscribers are not notified.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/delegates-lambdas)*
