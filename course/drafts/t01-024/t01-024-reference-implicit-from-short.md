<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: short implicit numeric conversions

*Draft: Automatically generated.*

# Scope and version
This lesson covers `short` implicit numeric conversions in C# 15 and .NET 11. It focuses on how the 16-bit signed integer type (`short`) promotes to larger or more precise types without data loss. 
*Source: [Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)*

# How this group fits the mental model
In C#, numeric types have a hierarchy based on their range and precision. An **implicit conversion** is a "safe" operation performed automatically by the compiler because the destination type is guaranteed to hold the value of the source type without overflow or loss of magnitude. Since `short` is a 16-bit signed integer, it is smaller than most other numeric types, making it a common starting point for widening conversions.

# Supplied names explained
The following conversions are defined as implicit, meaning no special syntax is required:

*   **short to int (implicit numeric conversion):** Promotes a 16-bit signed integer to a 32-bit signed integer.
*   **short to long (implicit numeric conversion):** Promotes a 16-bit signed integer to a 64-bit signed integer.
*   **short to float (implicit numeric conversion):** Converts the integer to a 32-bit single-precision floating-point number.
*   **short to double (implicit numeric conversion):** Converts the integer to a 64-bit double-precision floating-point number.
*   **short to decimal (implicit numeric conversion):** Converts the integer to a 128-bit high-precision decimal type, often used for financial calculations.
*   **short to nint (implicit numeric conversion):** Converts the 16-bit integer to a native-sized signed integer (32-bit on 32-bit systems, 64-bit on 64-bit systems).

# Cross-item comparison
*   **Integral vs. Floating-point:** Conversions to `int`, `long`, and `nint` are exact. Conversions to `float`, `double`, and `decimal` involve a change in representation from binary integer to a floating-point or decimal format.
*   **Range:** While `short` can always fit into `int` or `long`, converting to `float` or `decimal` is safe because the destination types have a significantly larger range and precision capacity than a 16-bit integer.

# Examples
```csharp
short myShort = 100;

int myInt = myShort;         // Implicitly converted to int
long myLong = myShort;       // Implicitly converted to long
float myFloat = myShort;     // Implicitly converted to float
double myDouble = myShort;   // Implicitly converted to double
decimal myDecimal = myShort; // Implicitly converted to decimal
nint myNint = myShort;       // Implicitly converted to nint
```

# Common mistakes
*   **Assuming reverse safety:** A common mistake is assuming that because `short` converts implicitly to `int`, an `int` can be assigned to a `short` implicitly. This is false; converting from a larger type to a smaller type requires an **explicit conversion** (a cast) because data loss might occur.
*   **Ignoring precision:** While `short` to `float` is implicit, be aware that floating-point types use approximation. While a `short` value will be represented exactly in `float`, performing subsequent arithmetic may introduce rounding errors.

# Knowledge checks with answers
1. **Question:** Why does the compiler allow `short` to `int` conversion without a cast?
   *   **Answer:** Because the range of `int` (32-bit) fully encompasses the range of `short` (16-bit), ensuring no data loss occurs.

2. **Question:** Can you implicitly convert a `short` to a `byte`?
   *   **Answer:** No. `byte` has a smaller range than `short`, so an implicit conversion is not possible.

3. **Question:** Which of the supplied conversions is dependent on the architecture of the machine?
   *   **Answer:** `short` to `nint` (native-sized integer), as the size of `nint` varies between 32-bit and 64-bit systems.
