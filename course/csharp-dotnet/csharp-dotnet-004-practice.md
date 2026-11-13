<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine a restaurant where a customer orders food. 
- A **Delegate** is like a **waiter**. The waiter does not cook the food, but they hold a reference to the kitchen (a method) and can deliver your order when it is ready. It is a type-safe function pointer.
- An **Event** is like a **buzzer** given to you at the counter. The kitchen (publisher) can press the button to buzz you, but customers (subscribers) cannot press it themselves. Events restrict how delegates are called from outside the class.
- A **Lambda** is like an **instant recipe note** written on a napkin. Instead of creating a whole named recipe book (a formal method), you quickly write out the logic inline using arrows (`=>`).
- An **Expression Tree** is like **blueprints for a recipe written in data form**. Instead of cooking the food immediately, C# turns your code into a data structure (a syntax tree) that a database or another system can read, translate, and execute later (for example, translating C# code into SQL).

---

## How it works

### 1. Delegates
A delegate is a reference type that defines a method signature. Any method that matches that signature can be assigned to the delegate.
- `Action`: A delegate that takes zero or more input parameters and returns `void`.
- `Func`: A delegate that takes inputs and returns a value.
- **Multicast delegates**: A single delegate can point to multiple methods. When invoked, all methods are called in order.

### 2. Events
An event is a wrapper around a delegate. It uses the `event` keyword to enforce the **Observer Pattern**. 
- Only the class that defines the event can invoke (trigger) it.
- Outside classes can only use `+=` (subscribe) or `-=` (unsubscribe).

### 3. Lambdas
An anonymous function written with the lambda operator `=>`. 
- **Expression lambdas**: `x => x * 2` (single expression, automatically returned).
- **Statement lambdas**: `x => { int y = 2; return x * y; }` (code block with explicit `return`).
- **Closures**: Lambdas can capture local variables from their surrounding scope. C# handles the memory allocation behind the scenes so the variables persist even after the outer method finishes.

### 4. Expression Trees (`System.Linq.Expressions`)
While a lambda compiles into executable Intermediate Language (IL) byte code, an expression tree compiles into an **in-memory data structure**. 
- You write `Expression<Func<int, bool>> expr = x => x > 5;`.
- C# parses the code into nodes (`ParameterExpression`, `BinaryExpression`, etc.).
- This allows Entity Framework to read your C# code and translate it into SQL statements like `WHERE x > 5`.

---

## Examples

Below is a complete, runnable C# console program demonstrating Delegates, Events, Lambdas, and Expression Trees together.

```csharp
using System;
using System.Linq.Expressions;

namespace CSharpLearning
{
    // 1. DECLARING A DELEGATE TYPE
    public delegate void LogHandler(string message);

    // Publisher class using an Event
    public class TemperatureSensor
    {
        // 2. DECLARING AN EVENT USING THE DELEGATE
        public event EventHandler<int> TemperatureExceeded;

        public void CheckTemperature(int currentTemp)
        {
            Console.WriteLine($"Sensor reading: {currentTemp}°C");
            if (currentTemp > 30)
            {
                // 3. TRIGGERING THE EVENT (Only the publisher can do this)
                // ?.Invoke prevents NullReferenceException if no subscribers exist
                TemperatureExceeded?.Invoke(this, currentTemp);
            }
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            // --- DELEGATES ---
            Console.WriteLine("--- DELEGATE DEMO ---");
            LogHandler logger = PrintToConsole;
            logger("Hello via delegate!"); // Invokes the method

            // --- LAMBDAS & CLOSURES ---
            Console.WriteLine("\n--- LAMBDA & CLOSURE DEMO ---");
            int threshold = 25; // Variable captured by closure
            Func<int, bool> isAboveThreshold = x => x > threshold;
            Console.WriteLine($"Is 30 above 25? {isAboveThreshold(30)}");

            // --- EVENTS ---
            Console.WriteLine("\n--- EVENT DEMO ---");
            TemperatureSensor sensor = new TemperatureSensor();

            // Subscribing to the event using a Lambda expression
            sensor.TemperatureExceeded += (sender, temp) => 
            {
                Console.WriteLine($"[ALERT] Warning! Temperature is too high: {temp}°C");
            };

            sensor.CheckTemperature(22); // Will not trigger event
            sensor.CheckTemperature(35); // Will trigger event

            // --- EXPRESSION TREES ---
            Console.WriteLine("\n--- EXPRESSION TREE DEMO ---");
            // Here, the lambda is stored as DATA, not executable code yet
            Expression<Func<int, int, int>> addExpression = (a, b) => a + b;

            // Inspecting the expression tree components
            BinaryExpression body = (BinaryExpression)addExpression.Body;
            ParameterExpression leftParam = (ParameterExpression)body.Left;
            ParameterExpression rightParam = (ParameterExpression)body.Right;

            Console.WriteLine($"Expression NodeType: {body.NodeType}"); // Add
            Console.WriteLine($"Left Parameter: {leftParam.Name}");       // a
            Console.WriteLine($"Right Parameter: {rightParam.Name}");     // b

            // Compiling the expression tree into executable code at runtime
            Func<int, int, int> compiledFunc = addExpression.Compile();
            int result = compiledFunc(10, 20);
            Console.WriteLine($"Compiled Expression Result (10 + 20): {result}");
        }

        public static void PrintToConsole(string msg)
        {
            Console.WriteLine($"Log: {msg}");
        }
    }
}
```

---

## Tradeoffs and comparisons

| Feature | Primary Purpose | Memory / Performance Impact | Flexibility / Use Case |
| :--- | :--- | :--- | :--- |
| **Delegates** | Hold references to methods for callback patterns. | Low overhead. Can cause memory leaks if subscribers aren't cleaned up. | Event-driven programming, passing behavior into methods. |
| **Events** | Encapsulate delegates to implement the observer pattern safely. | Same as delegates, but restricts external invocation. | UI components, backend notification systems, decoupled architecture. |
| **Lambdas** | Concise inline anonymous methods. | Closures can allocate heap memory (display classes) to capture variables, adding GC pressure. | LINQ queries, inline event handlers, functional programming patterns. |
| **Expression Trees** | Represent code as an in-memory data structure. | Higher CPU cost to build and compile. Not meant for everyday high-speed loops. | ORMs (Entity Framework), dynamic query building, remote execution. |

---

## Interview questions and answers

### Q1: What is the difference between a delegate and an event?
**Answer:** A delegate is a type-safe function pointer. Any code holding a reference to a delegate can invoke it or clear its invocation list. An event is a wrapper around a delegate that applies the `event` keyword restriction: external classes can only add (`+=`) or remove (`-=`) subscribers. Only the containing class can trigger (invoke) the event, ensuring encapsulation.

### Q2: What is a closure in C#, and what are its performance implications?
**Answer:** A closure occurs when a lambda expression references local variables from its outer enclosing method. C# creates a hidden compiler-generated class (often called a Display Class) to store these variables on the heap so their lifetime extends beyond the method scope. **Tradeoff:** Frequent allocation of closures inside high-frequency loops creates garbage collection (GC) pressure and can degrade performance.

### Q3: When should you use an Expression Tree instead of a standard `Func` lambda?
**Answer:** You use an Expression Tree when you need to inspect or translate code at runtime rather than execute it immediately. The most common use case is in ORMs like Entity Framework, where a LINQ query like `db.Users.Where(u => u.Age > 18)` is turned into an Expression Tree, analyzed by the provider, and translated into SQL (`SELECT * FROM Users WHERE Age > 18`) to be executed on the database server.

---

## Exercises and solutions

### Exercise 1: Custom Event Notification
Create a class called `Shoppingcart`. It should have an event named `ItemAdded` that passes the name of the item (string) as event data. In `Main`, subscribe to this event and print a message whenever an item is added.

#### Hints
- Define an event using `public event EventHandler<string> ItemAdded;`
- Remember to check for `null` before invoking the event: `ItemAdded?.Invoke(this, itemName);`

#### Complete Solution
```csharp
using System;

public class ShoppingCart
{
    public event EventHandler<string> ItemAdded;

    public void AddItem(string itemName)
    {
        Console.WriteLine($"Adding '{itemName}' to cart...");
        // Raise the event
        ItemAdded?.Invoke(this, itemName);
    }
}

class Program
{
    static void Main()
    {
        ShoppingCart cart = new ShoppingCart();

        // Subscribe using a lambda
        cart.ItemAdded += (sender, item) => {
            Console.WriteLine($"[Notification]: Success! '{item}' was added to your shopping cart.");
        };

        cart.AddItem("Laptop");
        cart.AddItem("Coffee Mug");
    }
}
```

---

### Exercise 2 (DSA Integration): Expression Tree Evaluator
Write a method that takes a simple binary addition Expression Tree representing `(a + b)`, inspects its left and right operands, prints them, compiles the tree, and returns the calculated integer result for given inputs.

#### Hints
- Use `Expression<Func<int, int, int>>`.
- Cast `expr.Body` to `BinaryExpression`.
- Access `.Left` and `.Right` properties.

#### Complete Solution
```csharp
using System;
using System.Linq.Expressions;

public class Program
{
    public static void Main()
    {
        // Define expression: a + b
        Expression<Func<int, int, int>> expression = (a, b) => a + b;

        int result = EvaluateAndInspect(expression, 15, 25);
        Console.WriteLine($"Evaluated Result: {result}");
    }

    public static int EvaluateAndInspect(Expression<Func<int, int, int>> expr, int val1, int val2)
    {
        BinaryExpression body = (BinaryExpression)expr.Body;
        
        Console.WriteLine(getParameterName(body.Left) + " + " + getParameterName(body.Right));

        // Compile and execute
        var compiled = expr.Compile();
        return compiled(val1, val2);
    }

    private static string getParameterName(Expression exp)
    {
        if (exp is ParameterExpression param)
        {
            return param.Name;
        }
        return "Unknown";
    }
}
```
* **Examples**: Inputs `15` and `25` yield output `40`.
* **Edge Cases**: Handles null safety implicitly through structural assumptions of simple trees.
* **Complexity**: Time Complexity of compilation is $O(N)$ where $N$ is the number of nodes in the expression tree. Execution time is $O(1)$.

---

## Review questions

1. **Can an interface define an event? Explain why or why not.**
   * **Answer:** Yes, an interface can define events. Implementing classes are then required to provide the event implementation (which includes the underlying delegate backing fields and subscription methods `+=` and `-=`). This is useful for contract-driven architecture, such as in UI components or observable services.

2. **What happens if you try to invoke an event from outside the class that declares it?**
   * **Answer:** A compile-time error occurs (e.g., *CS0070: The event 'EventName' can only appear on the left hand side of += or -= (except from within the type 'ClassName')*). This enforces strict encapsulation, ensuring that only the publisher can trigger state changes or notifications.

3. **Can a lambda expression convert automatically into an Expression Tree? Under what condition?**
   * **Answer:** Yes, but only when assigned to an explicit expression tree type (such as `Expression<TDelegate>`) rather than a standard delegate type (such as `Func<T>` or `Action`). If assigned to a standard delegate, the C# compiler emits executable IL byte code directly instead of building an in-memory syntax tree.

4. **What is a multicast delegate, and how does it handle return values if multiple methods are attached?**
   * **Answer:** A multicast delegate holds an invocation list pointing to multiple methods. When invoked, it executes each method sequentially. If the delegate has a non-void return type (e.g., `Func<int>`), only the return value of the **last** method executed in the invocation list is returned to the caller. The return values of all preceding methods are discarded, which is why multicast delegates are most commonly used with `void`-returning methods (like event handlers or logging callbacks).

---

## Sources and limitations
* *Note: Information above is based on standard C# language specifications (.NET 6/7/8 behavior). No external URLs or claims of live web verification are stated, as standard offline language knowledge applies.*
