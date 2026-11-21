# caching Redis invalidation eviction and stampede — Reference: Redis Lua scripts, Functions, and server-assisted client-side cache tracking

Sources: [Redis Lua scripting](https://redis.io/docs/latest/develop/programmability/eval-intro/), [Redis Lua API](https://redis.io/docs/latest/develop/programmability/lua-api/), [Redis Functions](https://redis.io/docs/latest/develop/programmability/functions-intro/), [client-side caching](https://redis.io/docs/latest/develop/reference/client-side-caching/), [CLIENT TRACKING](https://redis.io/docs/latest/commands/client-tracking/), and [Redis 8.10 commands](https://redis.io/docs/latest/commands/redis-8-10-commands/).

## Scope and version

Redis scripting here means the current Lua-based Eval and Function surfaces. Redis Functions were introduced in Redis 7.0. Client-side caching means application-process copies assisted by Redis invalidations. Redis products and versions can differ, so verify availability on the target server. This lesson does not cover client-library-specific APIs.

## How this group fits the mental model

There are two related ways to reduce cache work. First, run a short multi-step decision beside Redis data, avoiding dependent network trips. Second, keep popular read replies in each application process and let Redis notify clients when tracked keys change. Both trade simplicity for operational responsibility: scripts block while running; local caches need invalidation, reconnect handling, bounded memory, and a stale-data policy.

## Supplied names explained

### Eval scripts: execution, cache, and lifecycle

- `Redis Lua script` is a Lua program executed inside Redis. Redis currently embeds Lua 5.1 for scripting. A running script is atomic relative to other server commands but blocks the server until it finishes.
- `EVAL` submits source and executes it immediately. Its integer argument counts the key names that follow; those names appear in `KEYS`, while remaining inputs appear in `ARGV`.
- `EVAL_RO` runs a read-only Eval script. It is useful when the script only reads and must be eligible for read-only execution contexts; it must not attempt writes.
- `EVALSHA` executes a script already present in the server's script cache using its SHA1 digest. If it is absent, load the source and retry through an application-controlled missing-script path.
- `EVALSHA_RO` is the read-only digest variant of Eval. It has the same volatile-cache concern as `EVALSHA` and the same no-write restriction as `EVAL_RO`.
- `SCRIPT DEBUG` selects the server's Lua debugging mode for script execution. It is a development/debugging facility, not an application control-flow API; use it cautiously because debug modes affect execution and client interaction.
- `SCRIPT EXISTS` checks whether given script digests are currently in the server script cache. It does not prove a script will remain there or that a failover target also has it.
- `SCRIPT FLUSH` removes scripts from the volatile script cache. Depending on its mode/options in the server version, flushing may be synchronous or asynchronous; never rely on the cache surviving it.
- `SCRIPT KILL` attempts to stop a currently running script that has not performed writes. A script that already wrote cannot be safely killed as if its effects were rolled back; keep scripts short and prevent runaway code by design.
- `SCRIPT LOAD` loads script source into the cache and returns its digest without executing it.
- `Redis ephemeral script cache` is Redis's in-memory store of loaded Eval script bodies. It may be cleared by restart, failover, or flush, so the application must retain source and handle cache misses.

### Function libraries and the Lua API

- `Redis Function library` is a named, server-managed library containing one or more registered functions. Libraries are loaded and managed separately from client-side Eval source and can reuse code within the library.
- `FUNCTION DELETE` deletes the named library from the server.
- `FUNCTION DUMP` serializes loaded function libraries for backup/transfer and later restoration.
- `FUNCTION FLUSH` deletes all function libraries on the server; use with care because callers may immediately fail.
- `FUNCTION KILL` attempts to stop a running function only when it has not performed writes. It is not rollback and cannot undo completed writes.
- `FUNCTION LIST` lists loaded libraries and can return library/function details using its supported options.
- `FUNCTION LOAD` loads a library's source code; the optional replacement behavior should be used only in a controlled deployment because it replaces a library with the same name.
- `FUNCTION RESTORE` restores libraries previously serialized with `FUNCTION DUMP`; restore mode determines how collisions are handled.
- `FUNCTION STATS` reports function engine and running-function statistics useful for diagnosing execution.
- `FCALL` invokes a named registered function with explicitly counted keys and ordinary arguments. Functions are atomic and block other commands during execution, so keep their work bounded.
- `FCALL_RO` invokes a function in a read-only context. The function must not write; this is important for read-only replica or routing contexts.
- `redis.register_function` is the Lua API used inside a loaded library to register a callable function by name, along with optional flags and callback.
- `Redis Function no-writes flag` declares that a function does not write. It permits read-only invocation semantics; declaring it incorrectly is a correctness/security error.
- `Redis Function allow-oom flag` allows a function to execute when Redis is over its configured memory threshold. Use only when the function's bounded behavior is safe under memory pressure.
- `Redis Function allow-stale flag` permits execution against stale data on a replica that has not caught up, where the server context allows that behavior. It does not make stale results fresh.
- `Redis Function no-cluster flag` marks a function as unsuitable for Redis Cluster use; do not assume a function works cluster-wide merely because it works on a standalone server.
- `Redis Function allow-cross-slot-keys flag` permits a flagged script/function to issue internal accesses to multiple hash slots in cluster mode. The keys supplied to the script as declared key inputs must still hash to one slot; keep all work in one slot when possible because cross-slot access complicates slot movement and cluster operations. The flag has no effect outside cluster mode.
- `Redis Lua API redis.call` invokes a Redis command from Lua and raises a Lua error when the command returns an error reply.
- `Redis Lua API redis.pcall` invokes a command but returns an error-reply value instead of raising immediately, allowing the script to inspect and handle that reply.
- `Redis Lua API redis.error_reply` constructs a Redis error reply from script/function code.
- `Redis Lua API redis.status_reply` constructs a status reply from script/function code.
- `Redis Lua API redis.sha1hex` computes a SHA1 hexadecimal digest from a string; it is a utility, not a security signature or password hash.
- `Redis Lua API redis.log` writes a message at a selected Redis log level. Avoid noisy or sensitive-value logging.
- `Redis Lua API redis.setresp` selects the RESP protocol version used to encode replies from the script/function context where supported.
- `Redis Lua API redis.set_repl` changes whether subsequent script write effects are sent to replicas, the AOF, both, or neither. It is available to Eval scripts but not Redis Functions; since Redis 7, effects replication is the only supported script replication mode. This advanced API can make replicas/AOF diverge if misused, so do not use it for ordinary cache logic.
- `Redis Lua API redis.acl_check_cmd` checks whether the current user is allowed to execute a specified command with arguments. It can help a function make permission-aware decisions but does not replace ACL configuration.
- `Redis Lua API redis.REDIS_VERSION` exposes the server version string to Lua code.
- `Redis Lua API redis.REDIS_VERSION_NUM` exposes the server version as a numeric value for compatibility checks; avoid brittle version branches when capability checks or deployment constraints are clearer.
- `Redis script KEYS and ARGV inputs` are the declared key names and regular values supplied to Eval scripts. Every accessed key must be passed as a key, not hidden inside `ARGV` or embedded in source; this enables cluster routing and command key analysis.
- `Redis function declared key inputs` are the function's explicit key list, provided separately from ordinary arguments. Accessing undeclared keys is unsafe for routing and violates the intended key declaration model.
- `Redis function loading across cluster primaries` means a cluster deployment must ensure the library is available where requests may execute; loading on one primary does not imply all primaries have it. Make function deployment part of the cluster rollout and verify each target.

### Server-assisted client-side caching

- `CLIENT TRACKING` enables or configures Redis key tracking for a client connection so Redis can send invalidations when keys previously read by that client change.
- `CLIENT TRACKINGINFO` reports tracking state for a client, such as whether tracking is enabled and related state/counters.
- `CLIENT CACHING` controls whether the next command's keys should be tracked or untracked under the applicable OPTIN/OPTOUT mode. It is a connection-level, one-shot hint, so connection pools must preserve the intended command ordering.
- `CLIENT GETREDIR` reports the client ID currently used as the redirection target for invalidation messages.
- `CLIENT TRACKING ON and OFF` toggles tracking for the connection. When tracking is off, the client cannot rely on invalidations for reads made in that state.
- `CLIENT TRACKING BCAST` uses broadcast invalidations: Redis sends invalidations for key changes matching optional prefixes rather than maintaining a per-client list of every key read. It can reduce per-key tracking state but may deliver more notifications.
- `CLIENT TRACKING PREFIX` limits broadcast invalidations to keys with specified prefixes. Choose stable, narrow namespaces to control notification volume.
- `CLIENT TRACKING OPTIN` tracks reads only when the client first sends `CLIENT CACHING YES`; this supports selective caching of chosen read results.
- `CLIENT TRACKING OPTOUT` tracks reads by default except those preceded by `CLIENT CACHING NO`; this supports broad caching with explicit bypasses.
- `CLIENT TRACKING NOLOOP` suppresses invalidations caused by writes from the same connection, where supported by tracking mode. Clients must still update/invalidate their own local entry consistently after their own writes.
- `RESP3 client invalidation push` delivers invalidations as RESP3 push messages on the tracked connection. The client must process pushes even when it is otherwise waiting for a command reply.
- `RESP2 redirected invalidation Pub/Sub` redirects invalidation messages to a separate client connection that subscribes to the designated invalidation channel. Keep the receiver alive and treat receiver disconnect as loss of cache coherence.
- `Server-side client invalidation table` is Redis's bookkeeping of which clients have read which keys in regular tracking mode. High key/client cardinality and churn can make this state costly; BCAST changes the tradeoff.
- `Client-side cache flush on disconnect` is the safe response when the tracking connection or redirected receiver disconnects: invalidations may have been missed, so invalidate the affected local cache (often all of it) before trusting entries again.
- `Client-side cache maximum TTL safety bound` limits how long an entry may be used even if an invalidation is delayed or lost. It provides a bounded stale window, not immediate consistency.
- `Client-side cache invalidation race` can occur when a client reads a value, a write and invalidation happen, and the old read response arrives afterward and repopulates the local cache. Coordinate request generations or invalidate after the read response ordering is known; retain a short safety TTL because no client protocol removes every application race.

## Cross-item comparison

| Choice | Code location | Persistence/management | Main cost |
|---|---|---|---|
| Eval script | Sent by application | Volatile script cache; application retains source | Reload path and script-cache misses |
| Function library | Loaded on Redis | Managed server-side library | Deployment to relevant nodes; atomic blocking execution |
| Server-assisted local cache | Application process | Local entries are disposable; invalidation is connection-driven | Coherence state, notification handling, reconnect flush |

Regular tracking is selective and records key-to-client relationships; BCAST avoids those per-key relationships but can emit more invalidations. Choose based on hot-key set size, namespace structure, and notification budget.

## Examples

An Eval script can atomically compare a cache generation and store a value only if the generation is still current. Pass the generation key in `KEYS` and values in `ARGV`; do not construct source dynamically. Keep the script's loops and payload size bounded.

For local caching with RESP3, enable tracking on a connection, read through that connection, and process invalidation push messages continuously. On disconnect, flush local entries. For RESP2, use a dedicated redirection receiver and flush on receiver loss. In either protocol, set a maximum local TTL to bound missed-invalidation damage.

## Common mistakes

- Sending dynamic user data inside generated Lua source instead of `ARGV`.
- Treating scripts or functions as non-blocking background jobs.
- Forgetting that a function library must be deployed across cluster primaries.
- Marking a writing function `no-writes` or using `FCALL_RO` for a writer.
- Assuming an invalidation channel reconnect restores notices sent during disconnection.
- Tracking every key when BCAST with a narrow prefix better matches access patterns, or using broad BCAST without estimating notification volume.
- Updating a local cache with a delayed read after its invalidation has already arrived.
- Treating invalidation as a replacement for a maximum TTL and disconnect policy.

## Knowledge checks with answers

1. Why must scripts declare key names separately? **Redis needs to know keys for routing and cluster semantics; hidden key names in ordinary arguments or source defeat that model.**
2. What should a local cache do after losing its invalidation connection? **Flush entries that may have missed invalidations, then resume caching after tracking is re-established.**
3. Does an atomic script make a large scan safe? **No. Atomicity means other commands wait; a long script harms all clients. Bound the work.**

### Exact terms covered

- `Redis Lua script`
- `EVAL`
- `EVAL_RO`
- `EVALSHA`
- `EVALSHA_RO`
- `SCRIPT DEBUG`
- `SCRIPT EXISTS`
- `SCRIPT FLUSH`
- `SCRIPT KILL`
- `SCRIPT LOAD`
- `Redis ephemeral script cache`
- `Redis Function library`
- `FUNCTION DELETE`
- `FUNCTION DUMP`
- `FUNCTION FLUSH`
- `FUNCTION KILL`
- `FUNCTION LIST`
- `FUNCTION LOAD`
- `FUNCTION RESTORE`
- `FUNCTION STATS`
- `FCALL`
- `FCALL_RO`
- `redis.register_function`
- `Redis Function no-writes flag`
- `Redis Function allow-oom flag`
- `Redis Function allow-stale flag`
- `Redis Function no-cluster flag`
- `Redis Function allow-cross-slot-keys flag`
- `Redis Lua API redis.call`
- `Redis Lua API redis.pcall`
- `Redis Lua API redis.error_reply`
- `Redis Lua API redis.status_reply`
- `Redis Lua API redis.sha1hex`
- `Redis Lua API redis.log`
- `Redis Lua API redis.setresp`
- `Redis Lua API redis.set_repl`
- `Redis Lua API redis.acl_check_cmd`
- `Redis Lua API redis.REDIS_VERSION`
- `Redis Lua API redis.REDIS_VERSION_NUM`
- `Redis script KEYS and ARGV inputs`
- `Redis function declared key inputs`
- `Redis function loading across cluster primaries`
- `CLIENT TRACKING`
- `CLIENT TRACKINGINFO`
- `CLIENT CACHING`
- `CLIENT GETREDIR`
- `CLIENT TRACKING ON and OFF`
- `CLIENT TRACKING BCAST`
- `CLIENT TRACKING PREFIX`
- `CLIENT TRACKING OPTIN`
- `CLIENT TRACKING OPTOUT`
- `CLIENT TRACKING NOLOOP`
- `RESP3 client invalidation push`
- `RESP2 redirected invalidation Pub/Sub`
- `Server-side client invalidation table`
- `Client-side cache flush on disconnect`
- `Client-side cache maximum TTL safety bound`
- `Client-side cache invalidation race`
