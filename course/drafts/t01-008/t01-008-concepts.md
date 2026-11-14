<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Core concepts and how they fit together

## Learning objectives
* Understand the core member building blocks of types in C# (fields, properties, indexers, methods, and parameters).
* Trace how member signatures, parameter modifiers, and overload resolution dictate method execution.
* Distinguish between stored state (fields), controlled access (properties), natural indexing (indexers), and actions (methods).
* Recognize language features across C# releases (such as `params` collections, extension blocks, and accessor keywords) and avoid typical pitfalls in member design.

## Prerequisites
* Basic familiarity with object-oriented programming concepts (classes, structs, and object instantiation).
* Understanding of basic types, scoping, and how values are passed into methods.

## Core concepts
In C#, types encapsulate state and behavior using members. Selecting the right member form is critical to expressing a clean object-oriented contract:

* **Fields**: Stored members that hold type state directly. Instance fields allocate space per object instance, while static fields belong to the type itself. Constants (`const`) and read-only fields (`readonly`, `static readonly`) restrict modification.
* **Properties**: Expose controlled read/write behavior rather than raw storage. They wrap accessors (`get`, `set`, and `init`) to compute, validate, or delegate access. Auto-implemented properties let the compiler generate hidden backing storage automatically.
* **Indexers**: Provide array-like access syntax to an object, allowing instances to be indexed using bracket notation (`obj[idx]`).
* **Methods**: Represent executable actions. They define signatures comprising a name, a return type, and a parameter list.
* **Parameters and Overloads**: Parameter modifiers (`ref`, `out`, `in`, `ref readonly`, `scoped`, and `params`) dictate how values cross call boundaries. When multiple methods share a name, the compiler selects the most specific candidate via overload resolution.

## Mechanisms and relationships
How do all these parts fit together? 

```text
[ Call Site / Consumer ]
      │
      ├─► Arguments (passed via Value, ref, out, in, params)
      │
      ▼
[ Overload Resolution ] ──► Selects best method signature
      │
      ▼
[ Member Body Execution ]
      ├─► Reads/Writes Fields (directly or via backing storage)
      ├─► Executes Property Accessors (get / set / init)
      └─► Invokes Indexers (for indexed item retrieval/assignment)
```

1. **State versus Behavior**: Fields hold raw data. Properties act as sentinels guarding that data. Methods perform operations that transform data or execute logic.
2. **Dispatch and Modifiers**: Member modifiers control how members interact with inheritance and visibility. Virtual and override members participate in runtime dispatch, whereas static members belong strictly to the type definition.
3. **Call Boundaries**: Parameters bridge the caller and the callee. Modifiers like `ref` and `out` alter whether data flows bidirectionally or acts as an output channel, while `params` allows variable-length arguments to be packed into collections or arrays.

## Worked examples

Below is an unverified conceptual code example demonstrating fields, properties, indexers, and methods working together in a single type.

```csharp
// Unverified pseudocode / example
public class DataContainer
{
    // Stored field (private backing state)
    private string _label = "Default";

    // Auto-property with init-only constraint
    public int Id { get; init; }

    // Computed property using a field-backed or expression-bodied syntax
    public string Label
    {
        get => _label;
        set => _label = string.IsNullOrWhiteSpace(value) ? "Default" : value.Trim();
    }

    // Indexer for internal items array
    private readonly double[] _values = new double[5];
    public double this[int index]
    {
        get => _values[index];
        set => _values[index] = value;
    }

    // Method taking a params collection/array
    public double ComputeSum(params double[] numbers)
    {
        double sum = 0;
        foreach (var n in numbers)
        {
            sum += n;
        }
        return sum;
    }
}
```

* **Expected Result**: Instantiating `DataContainer` allows setting `Id` during initialization (via `init`), validating strings assigned to `Label`, accessing array elements safely through the indexer (`container[0] = 5.5;`), and aggregating numbers dynamically via the `ComputeSum` method.

## Misconceptions and edge cases
* **Misconception: Properties are just syntactic sugar for public fields with no overhead.** 
  * *Reality*: Properties execute code blocks (`get` / `set` accessors). They cannot be passed directly to methods requiring a `ref` or `out` variable because they do not represent fixed storage memory locations in the same way fields do.
* **Edge Case: Overload ambiguity with optional parameters.** 
  * *Reality*: Adding optional parameters to overloaded methods can create ambiguous compiler errors if multiple signatures match the caller's argument layout equally well.
* **Failure Mode: Modifying `readonly` reference structs incorrectly.** 
  * *Reality*: Attempting to mutate state inside a `readonly` member or passing immutable structs incorrectly across `in` parameters can trigger compiler warnings or defensive copying overhead.

## Knowledge checks with answers
1. **Question**: What is the primary conceptual difference between a field and a property?
   * **Answer**: A field stores type state directly in memory as a variable, whereas a property exposes a controlled read/write/init contract backed by accessors that can perform validation, computation, or encapsulation.
2. **Question**: When should you use a `ref` parameter versus an `out` parameter?
   * **Answer**: Use a `ref` parameter when the input variable must be initialized before the call and can be read and modified by the callee. Use an `out` parameter when the variable does not need to be initialized beforehand, but the callee is strictly required to assign a value to it before returning.
3. **Question**: What does an indexer allow an object to do?
   * **Answer**: An indexer allows an instance of a class or struct to be indexed using array-like bracket syntax (`instance[index]`), routing access through custom `get` and `set` accessor logic.

Sources referenced:
* [Microsoft C# Fields Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/fields)
* [Microsoft C# Properties Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties)
* [Microsoft C# Indexers Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/indexers/)
* [Microsoft C# Method Parameters](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters)
* [Microsoft C# Overload Resolution](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution)
