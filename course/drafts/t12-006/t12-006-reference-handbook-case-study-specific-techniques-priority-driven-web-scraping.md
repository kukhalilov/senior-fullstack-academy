# end-to-end system design case studies — Reference: Priority-driven web scraping

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 9309 Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309), [RFC 9110 HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110), [RFC 9111 HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111), [RFC 6585 Additional HTTP Status Codes](https://www.rfc-editor.org/rfc/rfc6585).

## Scope and version

This case study covers a crawler that discovers, schedules, fetches, parses, and stores public web resources while respecting site policies and protecting both the target service and the crawler itself. HTTP references are the current Internet Standards checked on 2026-11-17. RFC 9309 specifies the Robots Exclusion Protocol (REP). `robots.txt` rules are crawler instructions, explicitly not access authorization; a crawler must also consider authentication boundaries, privacy, applicable law, contracts, site terms, and its organization's policy.

## How this group fits the mental model

A crawler is a large queueing and scheduling system. It accepts seed URLs, discovers links, decides which work is worth doing, avoids duplicate fetches, and sends requests to many independent hosts with different latency, capacity, policies, and failure modes. One global FIFO queue is usually inadequate: a busy domain can monopolize workers, retries can create a storm, and duplicate URL variants can waste most of the budget.

Separate **discovery priority** from **permission and politeness**. Priority decides which eligible URL is useful to fetch next. Robots rules, authorization, scope restrictions, and per-host rate budgets decide whether and when a request may be made. High priority never overrides a disallow rule, a server's backpressure, or an internal safety restriction.

## Supplied names explained

- `Priority-driven web scraping` — A crawler architecture that ranks eligible URLs for fetching while controlling duplicate work, per-host concurrency, retry behavior, and resource use.

### Architecture and request lifecycle

1. **Seed and normalize.** Accept URLs from a controlled source, parse them, resolve relative links against the response URL, remove fragments when they do not identify a separate resource, and normalize only transformations known to preserve meaning. Query parameter order, case, redirects, and tracking parameters can change semantics; indiscriminate canonicalization can merge distinct pages.
2. **Enforce scope and policy.** Apply host/domain allowlists, deny rules, authentication requirements, robots rules, and any collection policy before scheduling. Fetch and cache each authority's `/robots.txt` according to RFC 9309 behavior. Parseable rules must be applied; do not invent unsupported directives or treat REP as a security boundary.
3. **Deduplicate and assign priority.** Use a canonical request identity plus method and relevant headers where representation varies. Track seen, queued, in-flight, succeeded, and retry-delayed states so concurrent discoveries do not create duplicate fetches. Priority can combine freshness, importance, expected value, age, and crawl budget, but document the scoring and prevent starvation with aging or fair queues.
4. **Schedule by origin.** Maintain per-host politeness state: concurrency caps, minimum delay or token bucket, recent latency, error rate, and `Retry-After` cooldown. Add global worker limits and provider/domain fairness. This prevents the scheduler from sending a burst just because many high-priority URLs share one origin.
5. **Fetch with bounded behavior.** Use timeouts, bounded response sizes, redirect limits, content-type checks, decompression limits, and a descriptive user agent with operator contact. Validate every redirect destination against scope and SSRF protections; a URL discovered from a page must not let the crawler reach localhost, private networks, cloud metadata endpoints, or prohibited protocols.
6. **Handle statuses intentionally.** A 2xx response is parsed only if it matches supported content types and resource limits. A 304 response can reuse a valid cached representation after a conditional request. A 3xx response is followed only within limits and policy. A 401/403 is not a cue to evade access controls. A 404/410 can suppress repeated work according to freshness policy. A 429 or 503 should reduce pressure and honor `Retry-After` when present; retry transient failures with exponential backoff, jitter, attempt caps, and a delayed queue rather than a tight loop.
7. **Extract and persist.** Parse in an isolated, resource-bounded worker. Store the fetched representation or extracted record with source URL, final URL, fetch time, validators, content hash, parser version, and provenance. Keep parsing errors separate from network failures. Make persistence idempotent so a retried job does not duplicate records.
8. **Revisit and expire.** Schedule recrawls according to expected change rate, freshness requirements, and host budget. Use `ETag` or `Last-Modified` validators when available to reduce transfer. Stop recrawling removed, disallowed, out-of-scope, or low-value URLs according to the product's retention and refresh policy.

## Robots, HTTP, and cache behavior

`robots.txt` is normally fetched at the top level of an authority and contains user-agent groups plus `Allow` and `Disallow` path rules. RFC 9309 says matching is case-insensitive for the crawler product token; a matching group may combine rules, otherwise the `*` group applies when present. The most specific matching path rule (longest match) wins; equal `Allow` and `Disallow` matches favor `Allow`. Matching is path-based and has encoding details, so use a tested parser rather than substring checks.

RFC 9309 distinguishes outcomes: a successful robots response must be parsed and its parseable rules followed; an unavailable response (for example, HTTP 4xx) permits access under the protocol; an unreachable response due to network/server errors requires assuming complete disallow while unreachable. Crawlers may cache the file and should not use a cached copy for more than 24 hours unless it is unreachable. These are protocol requirements and permissions for REP handling, not a full ethical, contractual, or legal policy. In a responsible crawler, a conservative local policy may choose to pause on ambiguous or unexpected errors.

`Retry-After` may contain an HTTP date or a delay in seconds. It is a server-suggested wait, not permission to exceed other limits after the delay. Use it with a per-origin circuit breaker and backoff. Add jitter so many workers do not resume simultaneously. A robots disallow is not a retryable error; a parser crash is not a reason to hammer the target URL; a 429 is a pressure signal, not merely a generic failure.

HTTP caching validators let a crawler ask whether a stored representation changed. `If-None-Match` with an entity tag or `If-Modified-Since` with a last-modified date can produce a 304 response, allowing the crawler to reuse the stored representation. Correct cache keys and `Vary` handling matter when language, cookies, or request headers alter content. Avoid storing private/authenticated responses in a shared cache without explicit protection.

## Cross-item comparison

This case has one assigned item, so no within-group comparison applies. A priority queue orders individual work; a per-origin scheduler controls safe concurrency; a robots parser evaluates publisher-specified crawler rules; an HTTP cache avoids unnecessary transfers; and a retry policy controls recovery after transient errors. These mechanisms complement one another but none substitutes for another.

Priority strategies include static tiers, recency/freshness scores, link importance, and estimated content value. Static priority is easy to reason about but can starve low tiers. Score-based ranking adapts to value but can amplify feedback loops or stale assumptions. Round-robin host scheduling is fair but not value-aware. A practical design often uses priority within bounded per-host queues and aging to ensure eventual progress.

## Examples

### A host returns 429

The scheduler pauses that origin, reads `Retry-After` if present, and schedules eligible work no earlier than the indicated time while respecting local maximum delay and policy. It reduces concurrency or request rate, records the response, and avoids immediate retries across every worker. Other independent hosts continue. When the host becomes eligible again, workers resume gradually with jitter.

### Robots fetch returns 503

Under RFC 9309, the robots file is unreachable because of a server error, so the crawler assumes complete disallow while unreachable. It retains any cached copy only as permitted by the protocol, backs off its robots fetch, and does not crawl ordinary pages as though no rules existed. A stricter organizational policy may pause the host until a successful policy fetch.

### Newly discovered high-priority URL points to a private IP

The scheduler validates the URL and resolved address before making the request. If it resolves to loopback, link-local, private, or otherwise blocked infrastructure, it rejects the URL and records the reason. Repeat DNS resolution checks at connection time or pin a validated destination to reduce DNS rebinding risk; redirects receive the same checks. This protects internal systems from server-side request forgery through crawler inputs.

## Common mistakes

- Treating `robots.txt` as authentication, access control, or a complete statement of legal permission.
- Treating a 4xx robots response and a 5xx/network failure identically; RFC 9309 distinguishes unavailable from unreachable.
- Treating undocumented extensions such as `Crawl-delay` as universally standardized REP directives.
- Selecting the next URL from one global queue and allowing a single host to monopolize connections.
- Retrying 429/503 responses immediately or ignoring `Retry-After`.
- Following redirects without checking destination scope, DNS resolution, and private-network protections.
- Canonicalizing URLs so aggressively that distinct query-dependent pages collapse to one key.
- Downloading unbounded bodies or decompression bombs from untrusted servers.
- Using a static priority policy that starves long-tail URLs forever.
- Parsing robots rules with string-prefix checks instead of the protocol's matching rules.
- Confusing successful fetch with successful parse, or retrying a deterministic parser bug as a network failure.

## Knowledge checks with answers

1. **Does `Disallow: /private` prevent an unauthorized user from viewing that path?** No. REP rules guide crawlers and are not access authorization; enforce access at the server.
2. **What does RFC 9309 say about a 5xx robots response?** The robots file is unreachable, so the crawler must assume complete disallow while it is unreachable.
3. **What should happen after a 429 with `Retry-After: 120`?** Do not retry immediately; wait at least the indicated delay, also respecting local policy, concurrency limits, and jittered resumption.
4. **Why split URL priority from host scheduling?** Importance determines which eligible work is useful; host scheduling enforces fairness and avoids overloading an origin.
5. **Why must redirects be revalidated?** A public URL can redirect to a private or prohibited destination, creating an SSRF path into internal infrastructure.

## Practice

Design a crawler for public documentation sites. Define URL identity, robots retrieval and caching, per-origin fairness, priority and starvation prevention, redirect/SSRF checks, 429/503 behavior, conditional requests, body limits, provenance, and recrawl policy. Walk through a robots 503, an HTTP 429 with `Retry-After`, and a redirect to a private address. Explain which behavior comes from RFCs and which is your stricter local policy.
