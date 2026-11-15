<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# delegates events lambdas closures and expression trees — Reference: Expression tree construction, inspection, translation, and execution

*This is an automatically generated draft.*

# Scope and version
This lesson covers the construction, inspection, translation, and execution of expression trees in C# 15 / .NET 11. It focuses on the boundary between code as data and code as executable logic.

# How this group fits the mental model
In C#, a **delegate** is executable code. An **expression tree** is a data structure that represents code. When you assign a lambda to a `Delegate` type, the compiler generates executable code. When you assign that same lambda to an `Expression<TDelegate>` type, the compiler generates a tree of objects representing the logic. This allows libraries (like database providers) to inspect your code and translate it into other languages, such as SQL.

# Supplied names explained

* `Expression tree`: A hierarchical data structure representing code logic as objects.
* `Expression<TDelegate>`: A generic class that wraps a lambda expression as an expression tree.
* `LambdaExpression`: The non-generic base class for all expression tree lambdas.
* `Expression tree versus delegate`: The conceptual distinction: delegates are for execution; expression trees are for inspection and translation.
* `Expression tree lambda conversion`: The compiler process that turns a lambda into an `Expression` object rather than a `Delegate`.
* `Expression tree node`: An individual element in the tree (e.g., a constant, a parameter, or an operator).
* `ExpressionType`: An enumeration defining the type of an expression node (e.g., `Add`, `Equal`).
* `ConstantExpression`: A node representing a literal value.
* `ParameterExpression`: A node representing a variable or parameter.
* `BinaryExpression`: A node representing an operation with two operands (e.g., `a + b`).
* `UnaryExpression`: A node representing an operation with one operand (e.g., `!a`).
* `MethodCallExpression`: A node representing a method invocation.
* `MemberExpression`: A node representing a field or property access.
* `ConditionalExpression`: A node representing a ternary or conditional operation.
* `NewExpression`: A node representing the creation of an object (`new T()`).
* `MemberInitExpression`: A node representing object initialization (`new T { P = v }`).
* `BlockExpression`: A node representing a sequence of expressions.
* `InvocationExpression`: A node representing the invocation of a delegate or lambda.
* `LambdaExpression.Body`: The property containing the expression tree logic.
* `LambdaExpression.Parameters`: The collection of parameters defined by the lambda.
* `Expression.Parameter`: Factory method to create a `ParameterExpression`.
* `Expression.Constant`: Factory method to create a `ConstantExpression`.
* `Expression.Lambda`: Factory method to create a `LambdaExpression`.
* `Expression.Call`: Factory method to create a `MethodCallExpression`.
* `Expression.Property`: Factory method to create a `MemberExpression` for a property.
* `Expression.Add`: Factory method to create a `BinaryExpression` for addition.
* `Expression.Equal`: Factory method to create a `BinaryExpression` for equality.
* `Expression.AndAlso`: Factory method to create a `BinaryExpression` for logical AND.
* `Expression.OrElse`: Factory method to create a `BinaryExpression` for logical OR.
* `Expression.Condition`: Factory method to create a `ConditionalExpression`.
* `Expression.New`: Factory method to create a `NewExpression`.
* `Expression.Block`: Factory method to create a `BlockExpression`.
* `Expression.Invoke`: Factory method to create an `InvocationExpression`.
* `ExpressionVisitor`: A base class for traversing and modifying expression trees.
* `ExpressionVisitor.Visit`: The entry point for traversing a tree.
* `ExpressionVisitor.VisitParameter`: A method to override for handling parameters during traversal.
* `ExpressionVisitor.VisitMethodCall`: A method to override for handling method calls during traversal.
* `ExpressionVisitor.VisitBinary`: A method to override for handling binary operations during traversal.
* `Expression<TDelegate>.Compile`: Converts the expression tree into an executable delegate.
* `LambdaExpression.Compile`: Converts the expression tree into a non-generic delegate.
* `Expression tree translation`: The process of converting an expression tree into another format (e.g., SQL).
* `IQueryable<T> expression provider`: The component that handles expression trees for data sources.
* `IQueryProvider.CreateQuery`: Method used by providers to create a new query from an expression.
* `IQueryProvider.Execute`: Method used by providers to execute an expression tree.
* `Queryable versus Enumerable lambda binding`: The difference between processing data in-memory (`IEnumerable`) versus translating logic to a remote source (`IQueryable`).
* `Expression tree unsupported syntax boundary`: The limit of what can be represented in an expression tree (e.g., complex loops or `async` methods are often unsupported).
* `Expression tree interpretation versus compilation`: The choice between walking the tree manually (interpretation) or turning it into IL code (compilation).

# Cross-item comparison

| Comparison | Key Difference |
| :--- | :--- |
| `Expression tree` vs `Delegate` | Data structure vs Executable code. |
| `Queryable` vs `Enumerable` | Remote translation vs In-memory execution. |
| `Interpretation` vs `Compilation` | Walking the tree vs Generating IL. |

# Examples

```csharp
// Creating an expression tree manually: (a, b) => a + b
var a = Expression.Parameter(typeof(int), "a");
var b = Expression.Parameter(typeof(int), "b");
var body = Expression.Add(a, b);
var lambda = Expression.Lambda<Func<int, int, int>>(body, a, b);

// Compiling to a delegate
var func = lambda.Compile();
int result = func(5, 10); // Result: 15
```
*Note: This code is unverified.*

# Common mistakes
1. **Trying to use unsupported syntax:** Not all C# features (like `await` or `yield`) can be represented as expression trees.
2. **Confusing `IQueryable` and `IEnumerable`:** Using `IEnumerable` with a database provider forces the entire table into memory, whereas `IQueryable` translates the expression into a SQL `WHERE` clause.
3. **Ignoring performance:** Compiling an expression tree is expensive; cache the resulting delegate if you plan to call it repeatedly.

# Knowledge checks with answers
1. **Question:** Can you execute an `Expression<TDelegate>` directly?
   **Answer:** No, you must call `.Compile()` first to turn it into a delegate.
2. **Question:** Why would you use an expression tree instead of a standard lambda?
   **Answer:** To inspect the logic (e.g., for SQL generation) rather than just executing it.
3. **Question:** What is the role of `ExpressionVisitor`?
   **Answer:** It provides a pattern to traverse and potentially modify the nodes within an expression tree.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/expression-trees/)*
