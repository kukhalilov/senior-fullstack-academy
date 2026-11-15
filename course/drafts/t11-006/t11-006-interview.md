# linked lists, pointer rewiring, reversal, and cycles — Interview questions and reasoning

## Core questions

1. What are the costs of finding a node versus updating a known node?
2. Why use a dummy head?
3. What invariant guides in-place reversal?
4. How do fast and slow pointers detect a cycle?
5. How do you remove the nth node from the end in one pass?
6. How do you identify the intersection of two lists?
7. What is a deep copy when nodes have random pointers?

## Concise interview answers

1. Finding a position is O(n) because links are sequential; changing a constant number of links at a known position is O(1).
2. A dummy supplies a predecessor for the real head, removing a special case for head deletion or first-node construction.
3. Previous is the reversed prefix, current begins the untouched suffix, and next saves current's old successor before rewiring.
4. Move slow one link and fast two. Acyclic input reaches null; a cycle makes their relative distance rotate until references meet.
5. Advance lead n links from a dummy, then move lead and follow together; when lead is at the tail, follow precedes the target.
6. Compare references while each pointer traverses its own list then the other; equalized path lengths make them meet at the shared node or null.
7. Create distinct nodes and map every original node's next/random targets to corresponding clone nodes; no clone link may point into the original graph.

## Deep follow-up answers

### “Why save next before reversing?”

Because redirecting current.Next destroys the only forward reference to the unprocessed suffix. Saving it first preserves reachability. The loop invariant then ensures every original node is either in the reversed prefix or the remaining suffix.

### “Why does Floyd's pointer meeting prove a cycle?”

Without a cycle, fast reaches null. Inside a cycle, fast advances one node per iteration relative to slow modulo the cycle length. That relative offset eventually becomes zero, so the references meet. The first meeting is generally not the cycle entry; a reset-and-walk phase is needed for entry location.

### “What does it mean for linked lists to intersect?”

They share the same node object. Since a node has one next link, once the two paths share a node their entire suffix is the same. Equal values in separate nodes do not constitute intersection.

### “Why is a known-node insertion O(1) but list insertion often O(n)?”

The link rewiring itself is constant work. If the problem gives an index or value and you must traverse to find that location, finding it is O(n). Report both when appropriate.

### “How do you avoid cycles while merging or reordering?”

Save the next pointers of each unprocessed chain before linking, detach/reverse halves deliberately, and set final boundary links. After coding, trace two- and three-node examples and verify traversal reaches null after every mutation.

## Scenario questions

### Reverse a list without allocating nodes

Use previous/current/next and reverse one link per iteration. Return previous. State whether input is known acyclic; otherwise a loop could run forever.

### Delete the head in a uniform mutation algorithm

Use a dummy whose next is head. Update the predecessor's next to bypass the target and return dummy.Next. The temporary node must not appear in output.

### Find a shared suffix with unequal prefix lengths

Use pointer switching or length alignment. Compare references, not values, and preserve the input structure.

### Clone next and arbitrary random links

Use an original-to-copy identity map in two passes: create one clone per original, then wire every link through the map. Or interleave clones after originals, assign random links through neighbors, and split the lists; explicitly restore the original links.

## Tradeoffs and alternatives

- Singly linked nodes use less link storage than doubly linked nodes but cannot move backward directly.
- A dummy node reduces branch complexity; it costs one temporary node.
- Floyd uses O(1) extra space; a hash set can locate a repeated node directly with O(n) memory.
- Iterative algorithms avoid O(n) recursion stack.
- Arrays provide O(1) indexing and locality; linked lists favor pointer-based local changes only when the node is already located.
- Reusing nodes saves allocations but mutates inputs; fresh output nodes preserve inputs at O(n) additional storage.

## Common weak answers

- “Linked-list insertion is O(1)” without including search to the insertion location.
- Reversing a link before saving its successor.
- Returning the Floyd meeting node as the cycle entry without the second phase.
- Comparing values to detect intersection.
- Forgetting to update or return a changed head.
- Claiming O(1) space while using recursion, a hash set, or new output nodes.
- Failing to mention mutation and node identity in merge/reorder/copy problems.
- Assuming a list is acyclic when the statement permits cycles.

## Self-check rubric

- Can you draw the nodes and arrows before and after each mutation?
- Is every overwritten link's needed successor saved first?
- Are head, tail, sentinel, and returned-head behavior explicit?
- Do fast/slow pointers check null before dereferencing?
- Are duplicate values distinguished from node identity?
- Do you include traversal, recursion stack, map/set, and output allocations in complexity?
- Have you tested empty, one-node, two-node, and boundary-removal cases?
- Does the result preserve or mutate inputs exactly as the prompt requires?

Sources: [OpenDSA: Linked Lists](https://opendsa.cs.vt.edu/ODSA/Books/pubbook/odsa-all-0013bb43-a12f-4ab3-9b86-73b317f1e37e/fall-2020/F20_Public/html/ListLinked.html), [Microsoft Learn: LinkedList<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.linkedlist-1).
