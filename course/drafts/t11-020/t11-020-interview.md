<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# hash maps and frequency tables — Interview questions and reasoning

*This is an automatically generated draft.*

# Core questions

To master hash maps and frequency tables, you must be able to explain the "why" and "how" behind the data structure. Prepare to answer these fundamental questions:

*   **What is a map?** A map is an abstract data type that stores pairs of (key, value). It allows you to retrieve a value by providing its unique key.
*   **How does a hash table work?** It uses a **hash function** to convert a key into an integer (the **hash code**). This code determines the index in a **bucket array** where the value is stored.
*   **What is a collision?** A collision occurs when two distinct keys produce the same hash code or map to the same bucket.
*   **How do we handle collisions?** Through **separate chaining** (storing a list of items at each bucket) or **open addressing** (searching for the next available slot using techniques like **linear probing**, **quadratic probing**, or **double hashing**).
*   **Why use a frequency map?** It transforms a problem requiring repeated searches into a single-pass operation, reducing complexity from $O(N^2)$ to $O(N)$.

# Concise interview answers

When asked about performance, be direct:

*   **"What is the time complexity of a hash map lookup?"**
    "The expected time complexity is $O(1)$, or constant time. However, in the worst case—such as when many keys collide—it can degrade to $O(N)$, or linear time."
*   **"Why is the load factor important?"**
    "The **load factor** represents the ratio of items to buckets. If it gets too high, collisions increase, slowing down operations. We trigger **rehashing**—creating a larger array and re-inserting all items—to maintain efficiency."
*   **"Can I use a mutable object as a key?"**
    "No. If a key's value changes after it is inserted, its hash code may change, making the item impossible to find. This is a **mutable-key hazard**."

# Deep follow-up answers

If the interviewer probes deeper, demonstrate your understanding of the "contract":

*   **The Equality Contract:** "A hash map relies on two things: the `GetHashCode` method and the `Equals` method. If two objects are equal, they *must* return the same hash code. If they return different hash codes, the map will treat them as distinct, even if they are logically equal."
*   **Amortized Costs:** "While rehashing is an $O(N)$ operation, it happens infrequently. We describe insertion as **amortized constant time** because the cost is spread out over many operations."
*   **Security:** "Be aware of **hash collision attacks**, where an attacker provides keys specifically designed to collide, forcing the map into $O(N)$ performance and potentially causing a Denial of Service."

# Scenario questions

*   **"You have an array of integers and need to find if any two numbers sum to a target value. How do you solve this?"**
    Use a **complement lookup** pattern. Iterate through the array; for each number $x$, check if `target - x` exists in your map. If it does, you found the pair. This is $O(N)$ instead of $O(N^2)$.
*   **"How would you group a list of strings by their first letter?"**
    Use a **grouping by canonical key** pattern. Create a map where the key is the first letter and the value is a list of strings. Iterate once, appending each string to the list corresponding to its first letter.

# Tradeoffs and alternatives

*   **Hash Table vs. Sorted Map:** A hash table provides $O(1)$ average lookup but no ordering. A sorted map (like a balanced tree) provides $O(\log N)$ lookup but keeps keys in order.
*   **Map vs. Set:** Use a map when you need to associate data with a key. Use a set when you only need to track the existence of unique items.
*   **Sorting vs. Frequency Map:** To find the most frequent element, you could sort the array ($O(N \log N)$). A frequency map is faster ($O(N)$) but uses $O(N)$ extra space.

# Common weak answers

*   **Ignoring the worst case:** Assuming hash maps are *always* $O(1)$ without mentioning the possibility of collisions.
*   **Misunderstanding equality:** Thinking that only the hash code matters. You must explain that the hash code narrows the search, but equality confirms the match.
*   **Overlooking space:** Forgetting that frequency maps trade memory for speed.

# Self-check rubric

1.  **Can I explain the hash function's role?** (It maps keys to indices).
2.  **Do I understand why rehashing is necessary?** (To keep the load factor low and performance high).
3.  **Can I identify when to use a frequency map?** (When counting occurrences or looking for complements).
4.  **Do I know the risks of mutable keys?** (They break the lookup contract).

*Sources: [OpenDSA Hashing](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/HashIntro.html), [Microsoft Dictionary Reference](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2), [USACO Guide](https://usaco.guide/bronze/intro-sets).*
