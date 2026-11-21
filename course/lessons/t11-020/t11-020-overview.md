
# hash maps and frequency tables — Big-picture orientation and mental model

# Problem and purpose

When writing programs, we frequently need to answer questions like: *"Have I seen this item before?"*, *"How many times did this word appear?"*, or *"Which user ID belongs to this email address?"* 

If we store items in a simple list or array, finding a specific item may require scanning elements one by one. A hash map uses extra storage to make lookup, insertion, and removal expected constant time under assumptions about hash distribution, load, and the cost of hashing and comparing keys. Collisions or expensive key operations can make individual operations slower; a hash table does not guarantee constant time.

# Plain-language mental model

Imagine an office mailroom with hundreds of labeled mailboxes (pigeonholes) along the wall. 
* A **key** is the recipient's name (for example, "Alice").
* A **hash function** maps the name "Alice" to a hash code. The table uses that code to select a bucket, but the code does not identify a unique key by itself because different keys can collide.
* The **value** is the letter placed inside mailbox number 42.

Instead of always walking down the hallway, you use the hash to narrow the search to a bucket and then use key equality to find the exact entry. Different keys can share a bucket, so a collision-resolution strategy is still needed.

A **frequency table** is a specific way of using this mailroom. Imagine reading a book and dropping a tally slip into a mailbox every time a specific word appears. At the end, you open each mailbox to see the total count for each word.

# How the parts fit together

Behind the scenes, a hash map combines several moving parts:
1. **The Hash Function and Code:** A formula converts a complex key (like a string) into an integer called a **hash code**.
2. **Buckets and entries:** A table maps a hash code to a bucket. Depending on the implementation, buckets may contain entries directly, point to a chain, or guide a probe sequence; many implementations also keep entry storage separate from the bucket array.
3. **Collisions and resolution:** Because keys outnumber the finite bucket locations, different keys can select the same bucket. Implementations resolve collisions with strategies such as **separate chaining** (keeping multiple entries associated with a bucket) or **open addressing** (probing for another slot).
4. **Resizing:** In common array-based designs, a policy tied to capacity or load triggers growth. The implementation allocates new storage and redistributes entries according to their new positions; growth factors and thresholds are implementation-specific.

# Concept map

* **Map Abstraction:** Associates unique keys with values, supporting lookups, inserts, updates, and removals.
* **Hash-Table Mechanism:** Translates keys into bucket locations via hash codes, manages collisions, and handles capacity resizing.
* **Algorithmic Map Patterns:** Uses maps for counting frequencies, finding complements, building index lookups, grouping data, and memoizing results.
* **Cost and Correctness:** Can deliver expected constant-time operations under stated distribution and cost assumptions, but worst-case work can be linear. Keys must obey the equality/hash contract and remain stable while stored.

# End-to-end walkthrough

Consider counting the frequency of words in a small text: `"apple banana apple orange banana apple"`.

1. **Initialization:** We create an empty frequency map where keys are strings (words) and values are integers (counts).
2. **First Word (`"apple"`):** 
   - We check if `"apple"` is already in our map. It is missing.
   - We insert `"apple"` with an initial count of `1`.
3. **Second Word (`"banana"`):** 
   - Missing from the map. We insert `"banana"` with a count of `1`.
4. **Third Word (`"apple"`):** 
   - Found in the map! We retrieve its current count (`1`), add `1` to it, and update the value for `"apple"` to `2`.
5. **Remaining Words:** We process `"orange"` (count `1`), `"banana"` (count becomes `2`), and `"apple"` (count becomes `3`).
6. **Result:** Our map contains `{"apple": 3, "banana": 2, "orange": 1}`. Instead of comparing every word against every other word in nested loops, we solved the problem in a single pass.

# When to use it and tradeoffs

### When to use:
* You need fast lookups, insertions, or deletions by a unique identifier or key.
* You are counting frequencies, tracking seen items, or caching computed results (memoization).

### When not to use:
* You need items kept in a strict sorted order (where a sorted structure or tree is better).
* Your keys are mutable objects whose values change while they live inside the map, which breaks lookup integrity.

### Tradeoffs:
* **Speed vs. Memory:** Hash maps use extra memory overhead to maintain empty space and keep lookups fast.
* **Average vs. Worst-Case:** While most operations run in expected constant time, poor hash functions or malicious inputs can trigger hash collisions that degrade performance to linear time.

# What later lessons cover

Later lessons build upon these foundations by exploring set operations and set-only structures (`t11-021`), tree-based alternatives like tries and prefix trees (`t11-016`), advanced indexing strategies, and complete API member catalogs for specific language runtimes such as .NET's `Dictionary<TKey, TValue>` [1].

***

### Sources
* [Microsoft Learn: Dictionary<TKey,TValue> Reference](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2) [1]
* [OpenDSA Hashing Materials](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/HashIntro.html)
* [USACO Guide: Introduction to Sets and Maps](https://usaco.guide/bronze/intro-sets)
