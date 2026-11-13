<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine you are managing a restaurant:
* **Delegates** are like **job descriptions**. They define *what* a task looks like (e.g., "must be able to take an order and return a receipt") without caring *who* does it. 
* **Events** are like the **restaurant bell**. When food is ready, the chef rings the bell. Other staff (waiters) listen for the bell and react. The chef controls the bell; waiters can only listen, not ring it themselves.
* **Lambdas** are **quick sticky-note instructions**. Instead of writing a whole formal recipe (a named method), you write a fast, inline instruction on a sticky note: `(tableNumber) => ServeFood(tableNumber)`.
* **Expression Trees** are **blueprints or code written as data**. Instead of running the code immediately, C# turns your code into a data structure (a tree graph) that you can inspect, modify, or translate. For example, an Entity Framework (EF Core) library reads this blueprint and translates your C# logic into SQL to run on a database.

*Technical terms explained:*
* **Type-safe:** The compiler checks your code to make sure you don't pass the wrong type of data (e.g., passing text where a number is expected).
* **Encapsulation:** Hiding internal object details and restricting how outside code interacts with them.
* **Runtime:** The period when your program is actively running on the computer.

---

## How it works

### 1. Delegates
A delegate is a reference type that holds a signature (return type and parameters). 
* Under the hood, the C# compiler generates a sealed class that inherits from `System.MulticastDelegate` (which itself inherits from `System.Delegate`).
* It can point to one or multiple methods (called a multicast delegate).
* **Syntax:** `public delegate void Notify(string message);` 
* Modern C# usually uses built-in generic delegates like `Action` (returns `void`) and `Func<T, TResult>` (returns a value) instead of declaring custom delegate types.

### 2. Events
An event is a thin wrapper around a delegate field. It uses the `event` keyword to restrict access.
* **Why use them?** If you expose a public delegate, outside classes can overwrite all assigned methods (`myDelegate = SomeOtherMethod;`) or trigger the delegate directly. An event prevents this: outside classes can only use `+=` (subscribe) and `-=` (unsubscribe), and only the containing class can invoke the event.

### 3. Lambdas
A lambda expression is an anonymous (nameless) function.
* **Statement lambdas:** Contain a block of code `{ ... }`.
* **Expression lambdas:** Contain a single expression `x => x * 2`.
* **Closures:** If a lambda captures local variables from the outer method, C# automatically creates a hidden compiler-generated class (or struct in newer performance-optimized patterns, but traditionally a class instance) to hold those variables so they stay alive even after the outer method finishes. Capturing reference types or value types onto the heap via a closure incurs an allocation cost (heap allocation instead of stack allocation).

### 4. Expression Trees
An expression tree represents code in a tree-like data structure (`System.Linq.Expressions.Expression<TDelegate>`).
* While a lambda compiles into executable machine/IL instructions immediately, an expression tree compiles into **data** nodes (`BinaryExpression`, `ConstantExpression`, etc.).
* **Use case:** Translating C# logic into other languages (like SQL) or dynamic code generation.

---

## Examples

```csharp
using System;
using System.Linq.Expressions;

namespace DelegatesEventsLambdasDemo
{
    // 1. Delegate definition
    public delegate void LogHandler(string message);

    public class TemperatureSensor
    {
        // 2. Event definition using EventHandler
        public event EventHandler<double> TemperatureExceeded;

        private double _threshold;

        public TemperatureSensor(double threshold)
        {
            _threshold = threshold;
        }

        public void CheckTemperature(double currentTemp)
        {
            if (currentTemp > _threshold)
            {
                // Trigger the event safely
                OnTemperatureExceeded(currentTemp);
            }
        }

        protected virtual void OnTemperatureExceeded(double temp)
        {
            // Null-conditional operator prevents exceptions if no subscribers exist
            TemperatureExceeded?.Invoke(this, temp);
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            // --- DELEGATE EXAMPLE ---
            LogHandler logger = PrintToConsole;
            logger("Delegate initialized.");

            // --- EVENT EXAMPLE ---
            var sensor = new TemperatureSensor(75.0);

            // Using a lambda expression as an event subscriber
            sensor.TemperatureExceeded += (sender, temp) =>
            {
                Console.WriteLine($"[ALERT] Temperature too high! Current: {temp}C");
            };

            sensor.CheckTemperature(68.0); // Does nothing
            sensor.CheckTemperature(82.0); // Triggers event

            // --- EXPRESSION TREE EXAMPLE ---
            // Code as data
            Expression<Func<int, int, int>> addExpression = (a, b) => a + b;
            
            // Inspecting the expression tree
            BinaryExpression body = (BinaryExpression)addExpression.Body;
            Console.WriteLine($"Left: {body.Left}, Operator: {body.NodeType}, Right: {body.Right}");

            // Compiling and executing the expression tree
            var compiledFunc = addExpression.Compile();
            int result = compiledFunc(5, 10);
            Console.WriteLine($"Expression evaluated result: {result}");
        }

        private static void PrintToConsole(string msg)
        {
            Console.WriteLine($"Log: {msg}");
        }
    }
}
```

---

## Tradeoffs and comparisons

| Feature | Delegates | Events | Lambdas | Expression Trees |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Purpose** | Method pointers / callbacks | Publish-subscribe pattern | Concise inline methods | Code represented as inspectable data |
| **Encapsulation** | Low (can be reassigned or invoked externally) | High (restricted to `+=` and `-=`) | N/A (creates anonymous methods) | High |
| **Performance** | Fast (direct invocation) | Fast (slight overhead for wrapper) | Fast (similar to normal methods, unless closures allocate memory) | Slow to compile, fast to execute once compiled |
| **Flexibility** | Can hold multiple methods | Controlled multicast mechanism | Reduces boilerplate code | Can be translated to SQL, JSON, or IL at runtime |

---

## Interview questions and answers

### Q1: What is the difference between a delegate and an event?
* **Answer:** A delegate is a type that safely encapsulates a method signature (a pointer to a function). An event is an *instance* field wrapped by accessors restricted by the `event` keyword. Events provide encapsulation by ensuring that outside classes can only subscribe (`+=`) or unsubscribe (`-=`), preventing external classes from invoking the event or clearing the subscriber list.

### Q2: What is a closure in C#, and what are its performance implications?
* **Answer:** A closure occurs when a lambda expression or anonymous method references local variables from its outer enclosing method. The C# compiler generates a hidden background class to hold those variables so their lifespan matches the lambda. 
* *Tradeoff:* This causes memory allocation on the **managed heap** rather than the stack, which adds pressure to the Garbage Collector (GC). Excessive closure allocations in tight loops can cause performance degradation.

### Q3: When should you use an Expression Tree instead of a standard Lambda?
* **Answer:** You use an Expression Tree when you need to inspect or translate the structure of code at runtime. The most common example is ORMs like Entity Framework: an expression tree allows LINQ queries (`x => x.Age > 18`) to be read as data structures and translated into SQL statements executed on a database server, rather than running as raw C# code in memory.

### Q4: How do you prevent memory leaks when subscribing to events?
* **Answer:** A memory leak happens when a long-lived object (like a static service or a singleton) subscribes to an event on a short-lived object (like a UI window). The publisher holds a strong reference to the subscriber via the delegate list, keeping the short-lived object alive in memory. 
* *Solution:* Unsubscribe from the event using `-=` when the object is disposed, or use weak event patterns/`WeakReference`.

### Q5: Can a delegate have a return value when it has multiple methods chained together (multicast)?
* **Answer:** Yes, but be careful. When a multicast delegate returns a value, you will only receive the return value of the **last** method executed in the invocation list. The previous return values are overwritten. You can retrieve all return values manually by calling `GetInvocationList()`.

---

## Exercises and solutions

### Exercise 1: Event Publisher and Subscriber
**Problem:** Create a class named `ShoppingCart` that contains a public event named `ItemAdded`. Create a console application where a subscriber listens to this event and prints the name of the added item and the total price. Ensure the event follows the standard .NET framework design guidelines (`EventHandler<T>`).

#### Progressive Hints
1. Define a custom EventArgs class inheriting from `EventArgs` if you need to pass multiple properties (like `ItemName` and `Price`).
2. Declare the event using `public event EventHandler<CartItemEventArgs> ItemAdded;`.
3. Create a method `AddToCart(string name, decimal price)` that triggers the event if successful.

#### Complete C# Solution
```csharp
using System;

namespace ShoppingCartApp
{
    public class CartItemEventArgs : EventArgs
    {
        public string ItemName { get; }
        public decimal Price { get; }

        public CartItemEventArgs(string itemName, decimal price)
        {
            ItemName = itemName;
            Price = price;
        }
    }

    public class ShoppingCart
    {
        public event EventHandler<CartItemEventArgs> ItemAdded;

        public void AddItem(string name, decimal price)
        {
            // Business logic here...
            Console.WriteLine($"Cart: Successfully added {name}.");

            // Raise the event
            OnItemAdded(new CartItemEventArgs(name, price));
        }

        protected virtual void OnItemAdded(CartItemEventArgs e)
        {
            ItemAdded?.Invoke(this, e);
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var cart = new ShoppingCart();

            // Subscribe to the event
            cart.ItemAdded += (sender, e) =>
            {
                Console.WriteLine($"[NOTIFICATION] New item purchased: {e.ItemName} costing ${e.Price}");
            };

            cart.AddItem("Laptop", 1200.00m);
            cart.AddItem("Mouse", 25.50m);
        }
    }
}
```

---

### Exercise 2: Expression Tree Modification
**Problem:** Write a method that takes an expression tree representing a mathematical addition `(int x) => x + 2` and modifies it to become a multiplication `(int x) => x * 2` by creating a custom `ExpressionVisitor`.

#### Progressive Hints
1. Inherit a class from `System.Linq.Expressions.ExpressionVisitor`.
2. Override the `VisitBinary` method.
3. Check if the node's operator is `ExpressionType.Add`. If it is, return a new binary expression using `Expression.Multiply`.

#### Complete C# Solution
```csharp
using System;
using System.Linq.Expressions;

namespace ExpressionVisitorDemo
{
    public class MultiplyVisitor : ExpressionVisitor
    {
        protected override Expression VisitBinary(BinaryExpression node)
        {
            // If the original expression is Addition, change it to Multiplication
            if (node.NodeType == ExpressionType.Add)
            {
                return Expression.Multiply(node.Left, node.Right);
            }
            return base.VisitBinary(node);
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Expression<Func<int, int>> originalExpr = x => x + 2;
            Console.WriteLine($"Original Expression: {originalExpr}");

            // Apply the visitor to modify the expression tree
            var visitor = new MultiplyVisitor();
            var modifiedBody = visitor.Visit(originalExpr.Body);
            
            var newLambda = Expression.Lambda<Func<int, int>>(modifiedBody, originalExpr.Parameters);
            Console.WriteLine($"Modified Expression: {newLambda}");

            // Execute the modified expression
            var compiled = newLambda.Compile();
            Console.WriteLine($"Result for input 5 (5 * 2): {compiled(5)}"); // Output: 10
        }
    }
}
```

---

## Review questions

1. What is the difference between an `Action<T>` and a `Func<T, TResult>` delegate?
2. Why is it considered a bad practice to invoke an event directly without checking for `null` or using the null-conditional operator (`?.Invoke`)?
3. What is a closure memory leak, and how does it happen in C#?
4. Can you convert an Expression Tree directly into executable IL code without compiling it first? Explain why or why not.
5. What design pattern does the C# `event` keyword implement at the language level?

---

## Sources and limitations
* *Limitations:* This lesson is formulated based on standard C# language specifications up to .NET 8. Implementation details of the compiler (such as closure allocations and event backing fields) are subject to internal .NET runtime changes. No external links or third-party verifications are claimed.
