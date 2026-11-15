<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# arrays and dynamic arrays for algorithmic problem solving — Big-picture orientation and mental model

> *Note: This lesson is an automatically generated draft.*

# Problem and purpose

Many algorithmic problems start with a simple need: you have a list of related values—such as daily temperatures, test scores, or cells on a game board—and your program needs to keep them in a specific order. You also need a fast way to read or change any item by its position.

An **array** solves this problem by storing an ordered sequence of elements side by side in memory, where each element is identified by an integer **index** (its numbered position in the sequence). Because items sit in a predictable order, the computer can jump straight to any position using its index.

In real problems, however, data does not always stay the same size. Sometimes you know the exact number of items from the start, so a fixed-size array is enough. Other times, new items arrive one by one while your program runs. A **dynamic array** solves this second problem by automatically managing a larger storage block behind the scenes when the collection grows.

# Plain-language mental model

You can picture arrays and dynamic arrays using three everyday models.

### 1. A row of numbered lockers (fixed-size array)

Think of a fixed-size array as a row of identical lockers bolted to a wall, numbered `0`, `1`, `2`, `3`, and `4`.

* Every locker sits right next to the previous one in a **contiguous sequence** (items placed one after another without gaps).
* If someone asks you for the item in locker `3`, you do not need to open lockers `0`, `1`, and `2` first. You can walk straight to locker `3`.
* Because the lockers are bolted to the wall, you cannot suddenly attach a locker `5` at the end. If you need six lockers, you have to move everything to a brand-new row of six lockers.

### 2. A spiral notebook with spare lines (dynamic array)

Think of a dynamic array as a spiral notebook that has 4 blank lines printed on a page, even though you have only written 2 notes so far.

* The **logical count** is `2` (the number of notes you have actually written).
* The **capacity** is `4` (the total number of lines currently available on the page).
* When you want to add a 3rd note at the end, you just write on line 3. There is no extra work.
* When all 4 lines are full and you need to add a 5th note, you open a larger notebook (for example, one with 8 lines), copy your 4 existing notes into the new notebook, and then write the 5th note on line 5.

### 3. Working on one desk vs. using a second desk (in-place vs. extra storage)

Suppose you want to remove empty folders from a row on your desk while keeping the remaining folders in their original order.

* If you move folders along the **same desk** without using a second desk, you save space. This is an **in-place** approach. You just have to be careful not to place a folder on top of another folder you have not checked yet.
* If you copy only the useful folders onto a **second desk**, the process is simpler to follow and leaves the original desk untouched, though you need space for a second desk.

# How the parts fit together

Arrays and dynamic arrays combine a few simple building blocks that determine how fast different operations run.

### Indexing, scanning, and middle edits

In languages such as C#, arrays use **zero-based indexing**—meaning the first element is at index `0`, and the last element is at index `length - 1` ([C# Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays)).

* **Direct indexed access** reads or updates one element at a known index `i`. Because memory is contiguous, the computer calculates the exact location directly, so this takes constant time regardless of array length.
* **Scanning** (also called **traversal**) visits elements one after another, such as checking every score to find the highest one. Its cost grows linearly with the number of elements.
* **Insertion or deletion in the middle** has a different cost from direct access. Because elements must remain contiguous with no gaps, inserting a new element at index `i` requires shifting elements at `i` and beyond one step to the right. Removing an element at index `i` requires shifting later elements one step to the left to close the gap ([OpenDSA](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html)).

### Contiguous storage, logical count, and capacity

A dynamic array (such as `List<T>` in C#) keeps a contiguous internal array while separating two numbers ([OpenDSA](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html), [List&lt;T&gt;.Capacity](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.capacity)):

* **Logical count**: how many items are currently stored in the list.
* **Capacity**: how many items the internal array can hold before it must be replaced with a larger one.

As long as the logical count is smaller than the capacity, appending an item at the end writes directly into the next unused slot. When the logical count reaches the capacity, appending another item triggers a resize: the dynamic array allocates a larger internal array, copies existing elements over, and then places the new item ([OpenDSA](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html), [List&lt;T&gt;.Add](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.add?view=net-10.0)).

### Multidimensional shapes

When data has rows and columns—like a grid or a table—there are two common layouts in C# ([C# Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays)):

* A **rectangular multidimensional array** stores a uniform grid where every row has the exact same number of columns.
* A **jagged array** is an array whose elements are themselves separate arrays, so each row can have a different length.

### Index management in algorithms

Many array algorithms modify an array **in place** by keeping separate read and write positions (indices). Instead of creating a second array, the algorithm overwrites earlier slots carefully as it scans forward, trading extra memory for careful index management.

# Concept map

The diagram below shows how the core ideas of this topic connect:

```text
Ordered sequence in contiguous memory
   ├── Fixed-size array ──▶ Zero-based index (0 to length - 1)
   │                           ├── Direct access by index (fast, 1 step)
   │                           ├── Linear scan (visit items in order)
   │                           ├── Middle insert/delete (must shift neighbors)
   │                           └── 2D shapes: Rectangular grid vs. Jagged rows
   │
   └── Dynamic array ──────▶ Internal contiguous array + Logical count + Capacity
                               └── Append at end
                                      ├── Room left? Write into next free slot
                                      └── Full? Resize and copy (amortized constant time)
```

These seven core concepts form the foundation for solving array problems:

1. **An array stores an ordered sequence accessed by integer index.** Position matters, and knowing the index lets you jump straight to an item.
2. **Direct indexed access and scanning have different costs from insertion and deletion in the middle.** Reading or writing at an index takes one step, scanning checks elements one by one, and editing the middle requires shifting neighboring elements ([OpenDSA](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html)).
3. **A dynamic array combines contiguous storage with a separate logical count and allocated capacity.** Separating "how many items I have" from "how much space is reserved" lets the sequence grow without resizing on every single append ([OpenDSA](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html), [List&lt;T&gt;.Capacity](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.capacity)).
4. **Resizing copies elements and makes append constant-time amortized rather than worst-case constant-time.** A single resize copies every existing item, which takes linear time in that step, yet multiplying capacity means resizes happen rarely enough that the average cost per append stays constant over many appends ([OpenDSA](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html)).
5. **In-place algorithms trade extra storage for mutation and careful index management.** Updating an array directly avoids allocating a new array, provided you never overwrite data you still need to read.
6. **Rectangular and jagged arrays represent different multidimensional shapes.** Choose rectangular when every row has the same width, and jagged when row lengths vary ([C# Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays)).
7. **Choose arrays and dynamic arrays when order, indexed access, or compact sequential storage fit the task.** They shine when position-based lookup and sequential scans dominate your workload.

# End-to-end walkthrough

Let us follow one small running example: tracking quiz scores for a study group.

> *Note on the code below:* Each block is a C# snippet assumed to run inside a method or top-level program with `using System;` and `using System.Collections.Generic;` available.

### Step 1: Direct access and scanning in a fixed-size array

Suppose a student has four quiz scores stored in a fixed-size array. Because the number of quizzes is fixed at `4`, an array fits naturally.

```csharp
int[] scores = { 70, 85, 90, 60 };

// Direct indexed access: update the 4th score (index 3)
scores[3] = 75;

// Linear scan: find the highest score
int best = scores[0];
for (int i = 1; i < scores.Length; i++)
{
    if (scores[i] > best)
    {
        best = scores[i];
    }
}
```

Here, `scores[3] = 75` jumps straight to index `3` (remembering that indices run from `0` to `scores.Length - 1`, which is `3`). The `for` loop then scans indices `1`, `2`, and `3` in order. After this snippet finishes, `scores` contains `70, 85, 90, 75`, and `best` is `90`.

### Step 2: Appending and resizing in a dynamic array

Now suppose new bonus scores arrive over time, and you do not know how many will arrive. You start a `List<int>` with an initial `Capacity` of `2`.

```csharp
List<int> bonusScores = new List<int>(capacity: 2);

bonusScores.Add(10); // logical count = 1, fits inside capacity 2
bonusScores.Add(20); // logical count = 2, array is now full

int capacityBeforeResize = bonusScores.Capacity;
bonusScores.Add(30); // full! allocates larger backing array, copies 10 and 20, then adds 30
int capacityAfterResize = bonusScores.Capacity;
```

In this snippet:

* The first two `Add` calls write `10` and `20` directly into the two pre-allocated slots ([List&lt;T&gt;.Add](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.add?view=net-10.0)). `capacityBeforeResize` is `2`.
* On the third `Add(30)`, the internal array is full, so the dynamic array allocates a larger backing array, copies `10` and `20` into it, and places `30` at index `2` ([OpenDSA](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html), [List&lt;T&gt;.Add](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.add?view=net-10.0)). As a result, `capacityAfterResize` is greater than `2` (for example, `4` when capacity doubles).

### Step 3: Removing zeros in place without losing order

Suppose an array records daily quiz attempts, where `0` means a missed day: `{ 5, 0, 8, 0, 3 }`. You want to keep only the nonzero scores (`5, 8, 3`) in their **stable relative order** (the same order they originally appeared) without allocating a second array.

Calling "remove at index" repeatedly in the middle would shift later elements every time a `0` is removed. Instead, you can compact the array **in place** in a single scan using a `writeIndex`:

```csharp
int[] attempts = { 5, 0, 8, 0, 3 };
int writeIndex = 0;

for (int readIndex = 0; readIndex < attempts.Length; readIndex++)
{
    if (attempts[readIndex] != 0)
    {
        attempts[writeIndex] = attempts[readIndex];
        writeIndex++;
    }
}
```

Trace what happens at each step of `readIndex`:

* `readIndex = 0` (`5`): nonzero, written to `attempts[0]`, `writeIndex` becomes `1`.
* `readIndex = 1` (`0`): skipped, `writeIndex` stays `1`.
* `readIndex = 2` (`8`): nonzero, written to `attempts[1]`, `writeIndex` becomes `2`.
* `readIndex = 3` (`0`): skipped, `writeIndex` stays `2`.
* `readIndex = 4` (`3`): nonzero, written to `attempts[2]`, `writeIndex` becomes `3`.

After the loop finishes, `writeIndex` is `3`, and the first `3` elements of `attempts` are `5, 8, 3`. Notice two important tradeoffs: we used zero extra array memory, and `attempts` itself was mutated, leaving old values at indices `3` and `4` beyond the valid prefix length `writeIndex`.

### Step 4: Choosing a 2D shape for multiple students

If 2 students each took exactly 3 quizzes, a rectangular array stores a `2` by `3` grid. If one student took 2 quizzes and another took 4, a jagged array lets each row keep its own length:

```csharp
// Rectangular: 2 rows, 3 columns each
int[,] fixedGrid =
{
    { 70, 85, 90 },
    { 80, 75, 95 }
};

// Jagged: row 0 has 2 scores, row 1 has 4 scores
int[][] variableRows =
{
    new int[] { 70, 85 },
    new int[] { 80, 75, 95, 100 }
};
```

In `fixedGrid`, every row is guaranteed to have length `3`. In `variableRows`, row `0` has length `2` and row `1` has length `4` ([C# Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays)).

# When to use it and tradeoffs

Understanding array tradeoffs helps you pick the right tool before writing code.

### Key comparisons

* **Fixed-size array vs. Dynamic array**: Use a fixed-size array when the number of items is known upfront and will not change, because it avoids resize logic and extra unused capacity ([C# Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays)). Use a dynamic array when items are added or removed over time and you cannot predict the final size ([OpenDSA](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html)).
* **Worst-case append cost vs. Amortized append cost**: In the worst case, a single append onto a full dynamic array takes linear time because every existing element must be copied to a larger array. However, because capacity grows multiplicatively rather than by one slot at a time, those expensive copies happen rarely enough that the average cost across many appends—the **amortized append cost**—is constant time ([OpenDSA](https://opendsa.cs.vt.edu/ODSA/Books/Catalog/html/ListArray.html), [List&lt;T&gt;.Capacity](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.capacity)). If a real-time system cannot tolerate even an occasional pause to copy elements, pre-allocating enough capacity upfront prevents unexpected resizes ([List&lt;T&gt;.Capacity](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.capacity)).
* **In-place update vs. Auxiliary array**: An in-place update minimizes extra memory by modifying the existing array, at the cost of mutating original data and risking bugs if indices cross or overwrite unread items. Creating an auxiliary (extra) array leaves the original input safe and often makes code easier to verify, at the cost of allocating memory proportional to the data size.
* **Rectangular multidimensional array vs. Jagged array**: A rectangular multidimensional array fits uniform grids and matrices where every row has the same length, while a jagged array fits nested sequences whose rows naturally differ in length ([C# Arrays](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/arrays)).

### When arrays are not the best fit

Arrays and dynamic arrays are ideal when you need ordered storage, compact memory, fast scanning, or direct access by integer index. They become a poor fit when your program must repeatedly insert or delete elements near the beginning or middle of a large collection (causing constant shifting), or when you frequently need to look up items by a non-integer key or check membership in a large unsorted collection.

### Common mistakes to watch for

* **Off-by-one errors**: Valid indices for an array of length `n` run from `0` to `n - 1`. Writing `i <= array.Length` instead of `i < array.Length` steps past the end of the array.
* **Empty arrays**: An empty array has length `0`, so even index `0` is out of bounds. Always check that an array has at least one element before reading `array[0]`.
* **Unexpected mutation**: Passing an array to a helper that modifies it in place changes the caller's data too. Copy into an auxiliary array if the caller still needs the original values.

# What later lessons cover

This overview focused on the big picture of how arrays and dynamic arrays work and when to choose them. Later lessons build directly on these foundations:

* **Two-pointer and sliding-window templates** (`t11-003`): structured patterns that use multiple indices moving across an array to solve subarray and pair problems efficiently.
* **Prefix and difference arrays** (`t11-004`): preprocessing techniques that turn repeated range queries and range updates into fast index lookups.
* **Sorting algorithms and heaps** (`t11-009`): arranging elements in order and maintaining priority structures on top of arrays.
* **String sequences and Unicode details** (`t11-019`): how text relates to character sequences and where string behavior differs from plain arrays.
* **Hash maps and sets** (`t11-020` and `t11-021`): structures for fast key-based lookup and membership checks when integer indexing is not enough.
* **C# collections track**: full member-by-member catalogs and API details for C# `Array` and `List<T>`.
