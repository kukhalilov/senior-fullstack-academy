<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Exercises and worked solutions

*Automatically generated draft.*

# C# Built-in Type Aliases and Characteristics

## Goals
* Understand that C# keywords are aliases for underlying .NET types.
* Distinguish between **value types** (variables contain values) and **reference types** (variables contain references to objects).
* Learn to select the appropriate type based on range, precision, and domain requirements.

## Worked example
In C#, `int` is a keyword alias for `System.Int32`. A value-type variable contains its value; the language does not promise that a local is placed on the stack or that a reference is a physical memory address.

```csharp
// 'int' is a value type; assignment copies its value.
int count = 10;

// 'string' is a reference type; the variable contains a reference to a string object.
string message = "Hello";
```

**Step-by-step behavior:**
1. `count` has type `int` and its value is `10`; the language does not specify a stack slot or fixed physical placement for this local.
2. Assigning one `int` variable to another copies the value.
3. `message` contains a reference to a string object. Object placement and physical representation are runtime implementation details.

## Exercises
1. You need to store a value that represents a toggle (on/off). Which type from the `other-built-in` category is most appropriate?
2. You are implementing a financial rule. Compare `float`, `double`, and `decimal`; what additional domain decisions are needed before choosing?
3. You need an integer type that automatically adjusts its size (32-bit or 64-bit) based on the underlying processor architecture. Which keywords should you use?

## Progressive hints
* **Hint 1 (Exercise 1):** Look at the `other-built-in` list. Is there a type specifically for logical truth values?
* **Hint 2 (Exercise 2):** `float` and `double` are IEEE binary floating-point; `decimal` uses finite precision base-10 scaling. Ask what scale, rounding, range, and interoperability the financial specification requires.
* **Hint 3 (Exercise 3):** Refer to the `native-integral` category. C# 9 added language support for native-sized integers; their width follows process architecture. They are appropriate where an API contract is native-sized.

## Complete solutions
1. **`bool`**: It is the built-in type for Boolean values.
2. **There is no universal safest type.** `decimal` often fits decimal-based amounts because many base-10 fractions are exact, but choose the representation and explicit rounding/scale policy required by the domain. It can still round or overflow.
3. **`nint` and `nuint`**: These are native-sized integers.

## Tests and edge cases
* **Range overflow:** Assigning a value larger than `int.MaxValue` to an `int` variable will cause a compilation error.
* **Precision loss:** Assigning a very large number to a `float` may result in a loss of precision compared to a `double`.
* **Platform dependence:** `nint` and `nuint` will behave differently on 32-bit versus 64-bit systems. Always test your logic on both architectures if you rely on their size.

## Reflection questions
* Why does C# provide both `int` and `long`? (Consider memory usage vs. range).
* How does `dynamic` differ from `object`? (Hint: operations on `dynamic` expressions are bound at runtime).
* When should you prefer `string` over `char`? (Consider if you are storing a single character or a sequence).

***

**Sources:**
* [Microsoft Learn: Built-in types table](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)
* [C# 9 Native-sized integers](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)
