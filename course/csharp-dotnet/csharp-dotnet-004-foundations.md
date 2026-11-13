<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine you own a restaurant. You need a way to tell the kitchen when a customer orders food. 
* A **delegate** is like a job description or a note that says: *"Anyone who can cook a steak can take this job."* It holds a reference to a method so you can pass behavior around like data.
* An **event** is like a customer service bell on the counter. The kitchen can ring the bell, and anyone subscribed (waiting) will react. It makes sure outsiders can't accidentally ring the bell or clear out the list of waiters.
* A **lambda** is a quick, anonymous method written on the fly—like telling the chef, *"Just fry it quickly right here,"* instead of writing a formal recipe book entry.
* An **expression tree** takes that lambda and turns it into data (a code blueprint) instead of running it immediately. Think of it as a blueprint of a house that you can read, modify, and send to a database (like SQL) to translate into another language.

---

## How it works

### 1. Delegates
A delegate is a type-safe function pointer. In C#, `System.Delegate` and `System.MulticastDelegate` form the base classes. 
* **Multicast:** A single delegate can hold a chain of methods. When invoked, it calls them one by one.
* **Built-in helpers:** C# provides generic delegates so you rarely need to declare custom ones:
  * `Action<T>`: Takes inputs, returns `void`.
  * `Func<T, TResult>`: Takes inputs, returns a value of type `TResult`.
  * `Predicate<T>`: Takes an input, returns a `bool`.

### 2. Events
An event is a thin encapsulation wrapper around a delegate. It uses the publisher-subscriber (pub-sub) pattern. 
* Declared with the `event` keyword.
* **Encapsulation:** Only the containing class can trigger (`invoke`) the event. Outside classes can only use `+=` (subscribe) and `-=` (unsubscribe).

### 3. Lambdas
A lambda expression (`(x, y) => x + y`) is syntactic sugar for anonymous methods. 
* **Closures:** Lambdas can capture variables from their outer scope. Behind the scenes, the C# compiler generates a hidden class to hold these captured variables, transforming them into fields so their lifetime outlives the outer method scope.

### 4. Expression Trees
Represent code as a data structure (`System.Linq.Expressions.Expression<TDelegate>`). 
* Instead of compiling code into Intermediate Language (IL) that runs immediately, the compiler builds a tree of nodes (`BinaryExpression`, `MethodCallExpression`, etc.).
* Used heavily by Entity Framework to translate C# LINQ queries into SQL.

---

## Examples

### Complete C# implementation covering all four concepts

```csharp
using System;
using System.Linq.Expressions;

namespace Foundations.DelegatesEvents
{
    // 1. Delegate definition (usually unnecessary now thanks to Func/Action)
    public delegate void LogHandler(string message);

    public class TemperatureSensor
    {
        // 2. Event definition using EventHandler<T>
        public event EventHandler<double> TemperatureExceeded;

        private double _threshold;

        public TemperatureSensor(double threshold)
        {
            _threshold = threshold;
        }

        public void CheckTemperature(double currentTemp)
        {
            Console.WriteLine($"Sensor reading: {currentTemp}°C");
            if (currentTemp > _threshold)
            {
                // Trigger the event safely
                OnTemperatureExceeded(currentTemp);
            }
        }

        protected virtual void OnTemperatureExceeded(double temp)
        {
            // Null-conditional operator prevents NullReferenceException if no subscribers exist
            TemperatureExceeded?.Invoke(this, temp);
        }
    }

    public class Program
    {
        public static void Main()
        {
            var sensor = new TemperatureSensor(75.0);

            // 3. Lambda expression used for event subscription
            sensor.TemperatureExceeded += (sender, temp) =>
            {
                Console.WriteLine($"[ALERT] Threshold breached! Temp is: {temp}°C");
            };

            // Simulating temperature changes
            sensor.CheckTemperature(70.0);
            sensor.CheckTemperature(82.5);

            // 4. Expression Tree Example
            // We pass code as data instead of executing it directly
            Expression<Func<int, int, int>> addExpression = (a, b) => a + b;

            // Inspecting the expression tree structure
            BinaryExpression body = (BinaryExpression)addExpression.Body;
            ParameterExpression left = (ParameterExpression)body.Left;
            ParameterExpression right = (ParameterExpression)body.Right;

            Console.WriteLine($"\nExpression Tree NodeType: {body.NodeType}");
            Console.WriteLine($"Parameters: {left.Name}, {right.Name}");

            // Compile the expression tree into executable delegate at runtime
            Func<int, int, int> compiledFunc = addExpression.Compile();
            int result = compiledFunc(5, 10);
            Console.WriteLine($"Compiled Expression Result: {result}");
        }
    }
}
```

---

## Tradeoffs and comparisons

| Concept | Primary Advantage | Primary Disadvantage / Risk | When to Use |
| :--- | :--- | :--- | :--- |
| **Delegates** | Decouples caller from implementation; allows passing methods as parameters. | Harder to debug call stacks; potential memory leaks if targets aren't unsubscribed. | Callback mechanisms, strategy pattern implementations. |
| **Events** | Enforces strict pub-sub encapsulation (prevents external triggers/resets). | Can introduce memory leaks if long-lived publishers hold references to short-lived subscribers. | UI components, decoupled module communication. |
| **Lambdas** | Concise, readable inline logic; seamless capture of local state (closures). | Hidden allocations can occur (especially with closures and boxing); harder to unit test complex inline logic. | LINQ queries, short event handlers, callbacks. |
| **Expression Trees** | Allows code inspection and translation into other languages (e.g., SQL). | Slow to construct; cannot contain statements/loops easily; limited subset of C# supported. | ORMs (Entity Framework), dynamic query building. |

---

## Interview questions and answers

1. **What is the difference between a Delegate and an Event?**
   * *Answer:* A delegate is a type-safe function pointer variable that can be invoked and reassigned by any code holding a reference to it. An event is a wrapper around a delegate that applies restrictions: only the class that declared the event can invoke it, and outside classes can only add (`+=`) or remove (`-=`) handlers.

2. **What causes a memory leak with C# events, and how do you prevent it?**
   * *Answer:* A memory leak happens when a long-lived object (like a static manager or a singleton) subscribes to an event on a short-lived object (like a UserControl). The publisher holds a strong reference to the subscriber via the delegate chain, preventing the Garbage Collector from cleaning up the subscriber. *Prevention:* Unsubscribe using `-=` when the subscriber is destroyed, or use weak event patterns.

3. **What is a closure in the context of lambdas, and what are its performance implications?**
   * *Answer:* A closure is a lambda expression that captures local variables from its surrounding method scope. The C# compiler creates a hidden compiler-generated class to store these variables so they outlive the method execution. *Performance implication:* This introduces heap allocations instead of stack allocations, which increases Garbage Collection pressure if executed frequently in hot loops.

4. **Can you convert any lambda expression into an Expression Tree?**
   * *Answer:* No. Only single-expression lambdas can be converted into expression trees (`Expression<Func<T>>`). Lambdas containing statements (`{ }`), loops (`foreach`, `while`), or `async/await` keywords cannot be converted into expression trees by the C# compiler.

---

## Exercises and solutions

### Exercise 1: Custom Event Publisher
Write a class named `OrderProcessor` that fires an `OrderCompleted` event passing a custom EventArgs class containing an `OrderId` string and a `TotalAmount` decimal. Subscribe to this event in `Main` and print out the details.

#### Solution
```csharp
using System;

namespace Exercises
{
    public class OrderEventArgs : EventArgs
    {
        public string OrderId { get; }
        public decimal TotalAmount { get; }

        public OrderEventArgs(string orderId, decimal totalAmount)
        {
            OrderId = orderId;
            TotalAmount = totalAmount;
        }
    }

    public class OrderProcessor
    {
        public event EventHandler<OrderEventArgs> OrderCompleted;

        public void CompleteOrder(string orderId, decimal amount)
        {
            Console.WriteLine($"Processing order {orderId}...");
            // Simulate processing...
            OnOrderCompleted(new OrderEventArgs(orderId, amount));
        }

        protected virtual void OnOrderCompleted(OrderEventArgs e)
        {
            OrderCompleted?.Invoke(this, e);
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var processor = new OrderProcessor();

            processor.OrderCompleted += (sender, e) =>
            {
                Console.WriteLine($"Success! Order ID: {e.OrderId}, Total: ${e.TotalAmount}");
            };

            processor.CompleteOrder("ORD-9988", 250.75m);
        }
    }
}
```

### Exercise 2: Expression Tree Inspection
Write an expression tree that represents the math formula: `x => x * x + 10`. Write code to inspect the expression tree, print out its parameter name, and then compile and execute it for `x = 5`.

#### Solution
```csharp
using System;
using System.Linq.Expressions;

namespace Exercises
{
    class Program
    {
        static void Main(string[] args)
        {
            Expression<Func<int, int>> expr = x => (x * x) + 10;

            // Inspecting parameters
            ParameterExpression param = expr.Parameters[0];
            Console.WriteLine($"Parameter Name: {param.Name}, Type: {param.Type}");

            // Inspecting body
            BinaryExpression body = (BinaryExpression)expr.Body;
            Console.WriteLine($"Root Operation NodeType: {body.NodeType}");

            // Compile and execute
            Func<int, int> compiled = expr.Compile();
            int result = compiled(5);
            Console.WriteLine($"Result for x = 5: {result}"); // Expected: 35
        }
    }
}
```

---

## Review questions

1. What is the signature contract of a standard .NET event handler delegate (`EventHandler<TEventArgs>`)?
2. What happens if you invoke a delegate that currently has no methods attached (`null`)? How does the null-conditional operator (`?.`) prevent errors?
3. Explain why Entity Framework requires `Expression<Func<T, bool>>` instead of `Func<T, bool>` for database queries.

---

## Sources and limitations

* **Sources:** Based on official Microsoft C# language specifications and runtime behavioral documentation for .NET Core / .NET 6/7/8. No external internet links are claimed or verified.
* **Limitations:** Advanced topics like Custom Expression Tree rewriting (`ExpressionVisitor`), Memory layout specifics of closures under different Roslyn compiler versions, and Weak Event patterns are omitted for foundational clarity.
