<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Reference: Method forms, member modifiers, returns, and overload groups

*This is an automatically generated draft.*

# Scope and version
This lesson covers method declarations, modifiers, and overload resolution in C# 15 / .NET 11. It focuses on how methods are defined, how they behave under different modifiers, and how the compiler selects the correct implementation. This content is based on the C# language reference and release notes current as of 2026-11-14.

# How this group fits the mental model
In C#, methods represent the "verbs" of your code—the actions an object or type can perform. While fields store data and properties manage access to that data, methods encapsulate logic. 

The members listed here define the contract for these actions. Modifiers (like `virtual` or `static`) determine how these methods interact with inheritance and memory, while signatures and overloads allow you to provide multiple versions of an action that adapt to different input types.

# Supplied names explained

* `Method declaration`: The complete definition of a method, including its signature (name, parameters, return type) and its implementation block.
* `Instance method`: A method associated with a specific object instance; it has access to the `this` reference.
* `Static method`: A method associated with the type itself rather than an instance; it cannot access instance members.
* `Local function`: A method defined inside another method or block, useful for encapsulating helper logic that is only relevant to the parent scope.
* `Expression-bodied method`: A shorthand syntax using `=>` for methods that consist of a single expression.
* `Partial method`: A method declaration split across multiple files, typically used by source generators to provide hooks for custom logic.
* `Partial event`: A declaration allowing an event to be defined in parts, similar to partial methods.
* `Extension method declaration`: A static method that appears to be an instance method on a specific type, defined by the `this` keyword on the first parameter.
* `Generic method declaration`: A method that includes type parameters (e.g., `<T>`), allowing it to operate on various types while maintaining type safety.
* `Method body`: The code block containing the logic executed when the method is called.
* `Block body`: A traditional method body enclosed in curly braces `{}`.
* `Expression body`: A concise body using `=>` instead of braces.
* `Void return`: Indicates the method performs an action but returns no value.
* `Value return`: The method returns a copy of the data (or a reference to an object).
* `Ref return`: The method returns a reference to a variable, allowing the caller to modify the original storage location.
* `Ref-readonly return`: The method returns a reference that cannot be modified by the caller.
* `async method`: A method marked with the `async` modifier, enabling asynchronous operations using `await`.
* `Iterator method`: A method that uses `yield return` to produce a sequence of values lazily.
* `extern method`: A method implemented externally, typically in unmanaged code (e.g., C++ DLLs).
* `unsafe method`: A method that allows the use of pointers and direct memory access.
* `abstract method`: A method without an implementation, required to be overridden by derived classes.
* `virtual method`: A method that can be overridden by derived classes to provide custom behavior.
* `override method`: A method that provides a new implementation for a `virtual` or `abstract` method from a base class.
* `sealed override`: An `override` method that prevents further overriding in derived classes.
* `new hidden method`: A method that uses the `new` keyword to hide a base class member with the same signature.
* `Static abstract interface member`: A member defined in an interface that must be implemented by a static member in the implementing type.
* `Method overload`: Multiple methods in the same scope with the same name but different parameter signatures.
* `Overload set`: The collection of all methods sharing the same name that the compiler considers during resolution.
* `Method signature`: The combination of the method name and the number, types, and order of its parameters.
* `Return type`: The type of data the method sends back to the caller.
* `Method implementation`: The actual code logic defined within the method body.
* `Method group`: A set of overloaded methods that can be treated as a single entity during assignment or invocation.
* `Method attribute`: Metadata applied to a method to provide instructions to the compiler or runtime.
* `ConditionalAttribute method`: A method that is only included in the compiled output if a specific preprocessor symbol is defined.

# Cross-item comparison
* **Method vs. Property**: Methods perform actions; properties represent state access. Use properties for simple data retrieval/assignment and methods for complex logic or side effects.
* **Overload vs. Override**: Overloading provides multiple ways to call a method (same name, different parameters). Overriding replaces a base class method (same name, same parameters).
* **Block body vs. Expression body**: Both achieve the same result. Expression bodies are preferred for simple, one-line logic to improve readability.
* **Static vs. Instance**: Static methods belong to the type; instance methods belong to objects. Use static when no object state is required.

# Examples
```csharp
// Expression-bodied method
public int Add(int a, int b) => a + b;

// Overload set
public void Log(string message) { /* ... */ }
public void Log(int code) { /* ... */ }

// Virtual and Override
public virtual void Display() => Console.WriteLine("Base");
public override void Display() => Console.WriteLine("Derived");
```

# Common mistakes
* **Signature confusion**: Adding a `ref` or `out` modifier to a parameter changes the method signature, but changing the return type alone does not create a valid overload.
* **Overusing `virtual`**: Making every method `virtual` can lead to performance overhead and fragile base classes. Only use it when you intend for the method to be extended.
* **Ignoring `async`**: Calling an `async` method without `await` (or `Task.Wait()`) will cause the method to run in the background without the caller waiting for completion, often leading to race conditions.

# Knowledge checks with answers
1. **Question**: Can you have two methods with the same name and the same parameter types, but different return types?
   * **Answer**: No. The return type is not part of the method signature used for overload resolution.
2. **Question**: What is the difference between `virtual` and `abstract`?
   * **Answer**: A `virtual` method provides a default implementation that can be overridden. An `abstract` method provides no implementation and forces the derived class to provide one.
3. **Question**: When should you use an expression-bodied method?
   * **Answer**: When the method logic is simple enough to be expressed as a single statement, which reduces boilerplate code.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/fields)*
