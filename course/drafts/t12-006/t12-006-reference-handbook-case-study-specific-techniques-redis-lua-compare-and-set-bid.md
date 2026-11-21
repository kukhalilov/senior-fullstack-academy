# end-to-end system design case studies — Reference: Redis Lua compare-and-set bid

Sources: [Redis EVAL command](https://redis.io/docs/latest/commands/eval/), [Redis Lua scripting introduction](https://redis.io/docs/latest/develop/programmability/eval-intro/), [Redis programmability](https://redis.io/docs/latest/develop/programmability/), [Redis transactions](https://redis.io/docs/latest/develop/using-commands/transactions/), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

This design pattern demonstrates accepting an auction bid only when it satisfies current auction rules. Redis Lua is one option for a fast atomic decision over Redis-resident state; it is not automatically a complete auction ledger or financial settlement system. Redis 7 also provides Redis Functions as a managed server-side programmability option. Check the deployed Redis version, topology, persistence and replication configuration.

## How this group fits the mental model

The invariant is: a bid is accepted only if the auction is open, the bidder is eligible, the amount meets the current minimum, and the update is ordered with concurrent bids. A client-side read-then-write is unsafe: two bidders can both read the same high bid and both conclude they win. A server-side script moves the compare and mutation into one atomic execution on the Redis server.

Model the authoritative decision explicitly. For example, state may include auction ID, status, current amount, winning bidder, version, and end time. A script receives every key it uses through the KEYS input and values through ARGV, checks the state, then writes the new value and returns a structured result such as accepted, closed, stale version, or too low. Redis requires scripts in clustered deployments to declare the keys they access; avoid constructing undeclared key names dynamically.

## Supplied names explained

- **Compare-and-set:** read a current value, compare it against a condition/version, and update only if the condition still holds.
- **Redis Lua EVAL:** executes a Lua script supplied by the client; Redis guarantees atomic execution relative to other server commands by blocking other activity while it runs.
- **Redis Functions:** server-managed functions introduced in Redis 7, useful when code should be deployed independently from each application client.
- **Idempotency key:** a stable request identifier used to recognize a retry of the same bid; store the prior decision so a lost response does not create a second logical bid.
- **Durable auction record:** the persistence system of record for accepted bids, settlement, audit, and dispute handling; Redis may be a decision store or fast coordination layer, but durability depends on configuration and architecture.

## Cross-item comparison

| Approach | Useful when | Important boundary |
| --- | --- | --- |
| Client read followed by write | No concurrent invariant depends on the pair | Race-prone for bidding; individual commands do not make the whole read/compare/write atomic |
| Redis Lua or Function | Decision state is colocated in Redis and a bounded atomic operation is needed | Script blocks the Redis server while running; keep it short and declare all keys |
| WATCH/MULTI optimistic transaction | Client can retry after watched keys change and logic is manageable client-side | Requires retry logic and careful treatment of ambiguous network outcomes |
| Relational transaction with constraints/locking | Durable business records and relational invariants are central | May add latency or contention; use database-specific transaction/isolation guarantees |

Atomic script execution is not the same as durable commit across every failure. Replication is asynchronous in common Redis deployments, and acknowledged writes may be lost depending on failover and persistence policy. For auctions involving money, define which component is authoritative and how accepted bids are durably recorded before promising that a bid is final.

## Examples

Suppose the current minimum is 105 and bidder A submits 110 with request ID r-7. The script checks that the auction is open and the request ID is not already recorded, verifies 110 is above the minimum, updates the current winner and version, stores the result for r-7, and returns acceptance. If the response is lost, A retries with r-7; the service returns the saved decision rather than creating another bid. If bidder B’s competing bid is processed first and sets the minimum to 115, A’s script then rejects 110. The serialized Redis execution gives a definite order on that shard.

## Common mistakes

- Assuming a separate GET followed by SET is atomic as a pair.
- Putting unbounded loops, network calls, or slow work inside the script; scripts block other Redis activity while executing.
- Omitting keys from KEYS, which harms correctness in Redis Cluster.
- Assuming one Redis script makes a multi-shard transaction atomic.
- Treating atomicity as exactly-once delivery, durability, or settlement. Retries, failover, persistence, and external payment effects need separate design.
- Returning only a generic failure instead of an auditable reason and stable idempotent result.
- Allowing application clocks to independently determine auction close; define a trusted time boundary and race policy.

## Knowledge checks with answers

1. **Why not compare the bid in application code and then write?** Another bid can update the value between the read and write; atomic server-side execution closes that race for the declared Redis state.
2. **Does the Lua script guarantee the accepted bid can never be lost?** No. Atomic execution describes command ordering on the server, not persistence/failover durability. Configure and validate durability or write to a durable source of record.
3. **Why pass all script keys explicitly?** Redis Cluster needs to know which shard keys the operation uses; scripts should only access declared keys.
4. **How should the client retry after a timeout?** Treat the result as unknown and retry with the same idempotency key or query the stored outcome rather than creating a new logical bid.
