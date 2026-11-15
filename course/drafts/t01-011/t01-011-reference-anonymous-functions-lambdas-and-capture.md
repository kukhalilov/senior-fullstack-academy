<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# delegates events lambdas closures and expression trees — Reference: Lambda forms, typing, capture, attributes, and async callbacks

*This is an automatically generated draft.*

# Scope and version
This lesson covers the syntax, typing, and capture mechanics of anonymous functions in C# 15 / .NET 11. It focuses on how lambdas behave as delegates or expression trees and how they interact with lexical scope. This content is based on the official C# language reference and .NET API documentation as of 2026-11-14.

# How this group fits the mental model
In C#, you often need to pass "behavior" as data. A **delegate** is the type-safe object that holds this behavior. A **lambda** is the concise syntax used to create that behavior. 

The items below define the "how" of lambdas:
1. **Structure:** How you write the code (Expression vs. Statement).
2. **Typing:** How the compiler understands what the lambda represents (Target typing vs. Natural types).
3. **Capture:** How the lambda remembers variables from its surroundings (Closures).
4. **Capabilities:** Advanced features like `async`, `static`, and parameter attributes.

# Supplied names explained

* `Lambda expression`: The general term for an anonymous function that can be used to create a delegate or an expression tree.
* `Expression lambda`: A lambda with a single expression body (e.g., `x => x + 1`). The result is returned automatically.
* `Statement lambda`: A lambda with a block body `{ ... }`. It requires an explicit `return` statement.
* `Parenthesized lambda parameter list`: Using parentheses `(x, y) => ...` to define parameters, required for zero, multiple, or typed parameters.
* `Implicitly typed lambda parameter`: Parameters where the compiler infers the type from the context (e.g., `x => ...`).
* `Explicitly typed lambda parameter`: Parameters where you define the type (e.g., `(int x) => ...`).
* `Lambda return type inference`: The compiler determining the return type based on the expression body or return statements.
* `Explicit lambda return type`: Using syntax to force a specific return type, useful for complex inference scenarios.
* `Lambda target typing`: The process where the compiler uses the expected delegate type to infer the lambda's signature.
* `Natural function type of a lambda`: The type the compiler assigns to a lambda when no specific delegate type is provided.
* `Lambda overload resolution`: How the compiler chooses between multiple methods when a lambda is passed as an argument.
* `lambda conversion to delegate`: The process of turning a lambda into an executable delegate object.
* `Lambda conversion to expression tree`: The process of turning a lambda into a data structure (`Expression<T>`) for inspection or translation.
* `Anonymous method expression`: An older syntax using the `delegate` keyword to define an anonymous function.
* `delegate anonymous-function operator`: The keyword used to define anonymous methods.
* `Lambda default parameter value`: Assigning a default value to a parameter in a lambda (C# 12+).
* `Lambda params parameter`: Using the `params` keyword in a lambda parameter list.
* `Lambda parameter attribute`: Applying attributes to lambda parameters (C# 11+).
* `Lambda return attribute`: Applying attributes to the return value of a lambda (C# 11+).
* `Lambda discard parameter`: Using `_` as a parameter name to ignore it.
* `Lambda discard parameters`: Using multiple `_` parameters to ignore multiple inputs.
* `static lambda`: A lambda marked `static` to prevent it from capturing outer variables.
* `async lambda`: A lambda marked `async` to allow `await` inside its body.
* `async void lambda`: An `async` lambda that returns `void`, typically used for event handlers.
* `ref return lambda`: A lambda that returns a reference to a variable.
* `ref parameter lambda`: A lambda that accepts parameters by reference.
* `Outer variable capture`: The mechanism where a lambda accesses variables defined in its enclosing scope.
* `Captured local variable`: A local variable that remains alive because a lambda references it.
* `Captured instance state`: When a lambda accesses `this`, keeping the object instance alive.
* `Closure`: The combination of a function and the environment (captured variables) it references.
* `Closure variable lifetime`: The rule that captured variables live as long as the delegate that references them.
* `Captured variable mutation visibility`: Changes to a captured variable are visible to both the lambda and the outer scope.
* `Loop variable capture`: A common pitfall where a lambda captures the variable reference rather than the value at a specific iteration.
* `Cannot capture ref parameter`: A restriction preventing lambdas from capturing `ref` parameters.
* `Cannot capture in parameter`: A restriction preventing lambdas from capturing `in` parameters.
* `Cannot capture out parameter`: A restriction preventing lambdas from capturing `out` parameters.
* `Static lambda capture restriction`: The compiler error triggered if a `static` lambda attempts to access outer variables.
* `Lambda lexical scope`: The region of code where the lambda is defined and where it can "see" variables.
* `Lambda return does not return from containing method`: A `return` inside a lambda only exits the lambda, not the method that contains it.
* `Lambda jump statement boundary`: The rule that `break` or `continue` cannot jump out of a lambda into the outer scope.

# Cross-item comparison
* **Expression vs. Statement:** Use `Expression lambda` for simple logic; use `Statement lambda` for complex logic requiring multiple lines or control flow.
* **Captured vs. Static:** Use `static lambda` when you want to guarantee no accidental memory leaks or performance overhead from capturing state.
* **Delegate vs. Expression Tree:** A delegate is for *execution*; an expression tree is for *analysis* (e.g., converting C# to SQL).

# Examples
```csharp
// Expression lambda
Func<int, int> square = x => x * x;

// Statement lambda
Func<int, int> addOne = x => {
    return x + 1;
};

// Static lambda (no capture)
Func<int, int> addTwo = static x => x + 2;
```

# Common mistakes
1. **Loop variable capture:** In older C# versions, capturing a loop variable often resulted in all lambdas seeing the final value of the loop. Always define a local copy inside the loop if you need the specific iteration value.
2. **Memory leaks:** Because a `Closure` keeps captured variables alive, a long-lived delegate can prevent large objects from being garbage collected.
3. **Confusing `async void`:** Avoid `async void` except for event handlers, as exceptions in `async void` methods cannot be caught by the caller.

# Knowledge checks with answers
1. **Question:** Can a `static lambda` capture a local variable?
   **Answer:** No, the `static` modifier explicitly prohibits capturing outer variables.
2. **Question:** Does a `return` statement inside a lambda exit the enclosing method?
   **Answer:** No, it only exits the lambda itself.
3. **Question:** What is the difference between an `Expression lambda` and a `Statement lambda`?
   **Answer:** An `Expression lambda` has a single expression and returns it implicitly; a `Statement lambda` has a block body and requires an explicit `return`.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions)*
