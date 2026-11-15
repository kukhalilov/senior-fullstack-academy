# monotonic stacks and monotonic queues — Reference: Monotonic deque and sliding-window extrema

## Scope and version

This reference covers candidate deques for fixed-size sliding maximum and minimum queries.

## How this group fits the mental model

The deque keeps only values that may still become the extremum. Its front represents the best current candidate; its back is where new arrivals eliminate dominated candidates.

## Supplied names explained

- **Monotonic deque:** a double-ended queue whose candidate values maintain one monotonic order.
- **Deque of candidate indices:** store positions, not only values, so expiration and duplicate identity are explicit.
- **Expire out-of-window indices:** remove front indices smaller than the current window's left endpoint.
- **Remove dominated candidates from the back:** for a maximum, discard smaller or equal older values when the new value is at least as good and lasts longer; choose equality policy deliberately.
- **Sliding-window maximum:** maintain decreasing values; the front index points to the current maximum.
- **Sliding-window minimum:** maintain increasing values; the front index points to the current minimum.
- **Window-size boundary handling:** do not emit a result until the first complete window exists; at right index r the window begins at `r-k+1`.
- **Duplicate extrema handling:** retaining the newest equal value can shorten candidate lifetime; retaining the oldest is also valid if the expiration and pop rules preserve a correct front. Never remove equal entries inconsistently.

## Cross-item comparison

For maximum, remove smaller candidates from the back; for minimum, remove larger candidates. A max-heap supports extrema but needs stale-entry management and usually O(log n) operations. The deque supports O(1) amortized insertion/removal and O(1) query because expired and dominated candidates are permanently irrelevant.

## Examples

For `[1,3,-1,-3,5,3,6,7]` with k=3, after expiring indices left of the window, keep candidate values decreasing from front to back. When 5 arrives, it removes -3, -1, and 3 if they are still behind it, then becomes the maximum candidate. Subsequent windows read the front after expiration and back cleanup.

With duplicate values `[5,5,4]`, k=2, either equal 5 can remain at the front; if using `<=` when removing from the back, the newest 5 replaces the older one and remains valid longer. Indices make this safe.

## Common mistakes

- Expiring after reading the front, which can report a value outside the current window.
- Removing based on value without considering index expiration.
- Reporting before a full window has formed.
- Using an increasing deque for a maximum or decreasing deque for a minimum.
- Forgetting that duplicates require consistent equality handling.

## Knowledge checks with answers

1. **Where does the current maximum reside?** At the front after expiration and dominance cleanup.
2. **Why store indices?** They determine window membership and preserve duplicate identity.
3. **Why can a smaller older value be removed by a larger newer value?** The newer value lasts at least as long in future windows and is never worse as a maximum.

Sources: [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window), [Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/).
