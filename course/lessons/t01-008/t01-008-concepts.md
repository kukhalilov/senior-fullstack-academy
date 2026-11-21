
# properties indexers fields methods parameters and overloads — Core concepts and how they fit together

# Learning objectives
* Understand the distinct roles of fields, properties, methods, and indexers in C#.
* Learn how to control data access and state using accessors and modifiers.
* Master the mechanics of parameter passing and overload resolution.
* Explore modern C# features like `field` keywords, extension blocks, and `params` collections.

# Prerequisites
* Basic understanding of C# classes and structs.
* Familiarity with variable declaration and basic control flow.
* Knowledge of object-oriented concepts like inheritance and encapsulation.

# Core concepts
In C#, members define the data and behavior of a type.
* **Fields** are the simplest way to store data. They represent the raw state of an object.
* **Properties** act as a "smart" wrapper around data. They allow you to add logic (validation, computation) when reading or writing values.
* **Methods** define the actions an object can perform. They can take inputs (parameters) and return results.
* **Indexers** allow an object to be accessed like an array (e.g., `myObj[0]`).

Think of these as a hierarchy of control: **Fields** provide direct access, **Properties** provide controlled access, and **Methods** provide functional behavior.

# Mechanisms and relationships
* **Encapsulation:** Properties can decouple a source-level API from storage, though property and field shape differ in metadata and runtime behavior. A property is not a security boundary.
* **Overload Resolution:** When you call a method, the compiler looks at the arguments provided and selects the best matching `Method signature` from the available `Overload set`.
* **Parameter Modifiers:** These define how data moves across the boundary between the caller and the method. `ref` aliases caller storage for reading and writing; `in` and `ref readonly` restrict reassignment through the parameter, with different guarantees and call-site rules. Referenced objects can still be mutated through their members.
* **Extension Members:** C# allows you to add functionality to existing types without modifying their source code. `Extension method` declarations have been joined in C# 14 by `Extension block` members, which can include `Extension property` and `Extension static member` declarations.

# Worked examples
### 1. Properties and the `field` keyword (C# 14+)
Before C# 14, you often needed a private backing field for properties with logic. Now, you can use the `field` keyword:
```csharp
public class User {
    public int Age {
        get => field;
        set => field = value >= 0 ? value : throw new ArgumentOutOfRangeException(nameof(value));
    }
}
```

### 2. Overload Resolution
The compiler chooses the most specific method based on the arguments:
```csharp
void Print(int x) => Console.WriteLine("Int");
void Print(object x) => Console.WriteLine("Object");

Print(10); // Calls Print(int) because it is a better match than object.
```

### 3. `params` collections (C# 13+)
You can now use `params` with various collection types, not just arrays:
```csharp
void ProcessItems(params List<int> items) { /* ... */ } // Valid when List<T> has the supported Add-based collection pattern.
```

# Misconceptions and edge cases
* **Nullable annotations vs. Validation:** Marking a property as nullable (`string?`) tells the compiler to warn you about potential nulls, but it does not perform runtime validation. You must still write `set` logic to prevent nulls if that is your requirement.
* **Hidden Members:** Using the `new` modifier on a method hides a member from a base class. This is different from `override`, which participates in runtime polymorphism.
* **Extension Precedence:** Extension members are considered through extension lookup when ordinary member lookup does not produce a suitable applicable instance member. An inapplicable instance overload does not automatically block an applicable extension. Static extension members have their own lookup rules.

# Knowledge checks with answers
1. **Question:** What is the primary difference between a `Field` and a `Property`?
   * **Answer:** A field stores state directly; a property provides a contract (get/set) that can include validation or computation logic.

2. **Question:** How does `init` accessor differ from `set`?
   * **Answer:** `init` restricts assignment to the language-defined construction phase, including object initializers, constructors, and `with` initialization contexts; it is not general runtime immutability if referenced state remains mutable.

3. **Question:** What happens if you have an `Extension method` and an `Instance method` with the same signature?
   * **Answer:** When ordinary member lookup finds a suitable applicable instance method, it is chosen before extension lookup. An inapplicable instance overload does not necessarily prevent an extension method from applying.

4. **Question:** What is the purpose of `params` parameter collection?
   * **Answer:** It allows a method to accept a variable number of arguments, which are then treated as a collection within the method body.

*Sources: [C# 13](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13), [C# 14](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-14), [C# 15](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15), [Extension Members](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/extension-members)*
