# end-to-end system design case studies — Reference: Public recursive DNS over UDP and TCP

Sources: [RFC 1034: Domain Names—Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034.html), [RFC 1035: Domain Names—Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035.html), [RFC 7766: DNS Transport over TCP](https://www.rfc-editor.org/rfc/rfc7766.html), [RFC 9210: DNS Transport over TCP—Operational Requirements](https://www.rfc-editor.org/rfc/rfc9210.html), [RFC 6891: Extension Mechanisms for DNS (EDNS(0))](https://www.rfc-editor.org/rfc/rfc6891.html), [RFC 4033: DNS Security Introduction and Requirements](https://www.rfc-editor.org/rfc/rfc4033.html), [RFC 2308: Negative Caching of DNS Queries](https://www.rfc-editor.org/rfc/rfc2308.html), [RFC 5358: Preventing Use of Recursive Nameservers in Reflector Attacks](https://www.rfc-editor.org/rfc/rfc5358.html), [RFC 9499: DNS Terminology](https://www.rfc-editor.org/rfc/rfc9499.html).

## Scope and version

This lesson concerns a public recursive resolver: a service that accepts DNS questions from clients and resolves names by consulting authoritative DNS servers, often reusing cached answers. It focuses on ordinary DNS over UDP and TCP, not encrypted transports such as DoT, DoH, or DoQ. Standards evolve; the RFCs linked here define the protocol behavior discussed.

## How this group fits the mental model

DNS maps names and record types to data, but there are distinct roles. A stub resolver on a device normally asks a recursive resolver for a complete answer. The recursive resolver may answer from cache; otherwise it follows referrals through the DNS hierarchy, querying root, top-level-domain, and authoritative servers as needed. The authoritative server owns the zone data; the recursive service operates on behalf of its clients. A recursive resolver can also forward queries to another resolver rather than directly performing every iterative step.

Caching reduces latency and upstream work. Positive answers are generally retained according to record TTLs; negative answers can also be cached under RFC 2308 rules. A cache is derived state, so an operator needs policies for cache size, expiry, stale data behavior if supported, and invalidation or emergency response. A resolver must distinguish a valid negative answer from timeout, server failure, or a malformed response; these outcomes must not all be cached as “name does not exist.”

## UDP and TCP behavior

Classic DNS uses port 53 for both UDP and TCP. UDP has low setup overhead and commonly carries queries, but it can lose, reorder, or duplicate packets. The original DNS specification limited UDP messages to 512 bytes; a response that does not fit can be marked truncated with the TC bit. EDNS(0) lets participants negotiate larger UDP payload sizes and carry extensions, but the path may not actually pass the advertised size because of firewalls, fragmentation, or middleboxes.

When a resolver receives a truncated response, it needs to retry over TCP to obtain the full answer. TCP is also used for other DNS operations, including zone transfers, but is not restricted to them. DNSSEC records and other large responses make reliable TCP support essential. RFC 7766 specifies implementation requirements; RFC 9210 makes clear that operators must permit DNS over both UDP and TCP. A network rule that allows only UDP can create selective failures that are difficult to diagnose: small answers succeed while larger or truncated answers fail.

UDP and TCP are transport choices, not trust guarantees. Plain DNS on either transport does not encrypt the question or response. TCP provides an ordered byte stream and avoids UDP truncation behavior, but it does not hide queries or authenticate DNS data by itself. DNSSEC validation authenticates signed DNS data and denial proofs when correctly deployed; it does not encrypt the client-to-resolver connection. Transport encryption such as DoT/DoH/DoQ is a separate design choice.

## Public service architecture

A public resolver typically places stateless query-serving processes behind a globally reachable service address or fleet of regional endpoints. Each node can use local caches while sharing operational configuration, blocklists, trust-anchor updates, and telemetry. Cache synchronization is optional and should be weighed against its bandwidth, privacy, and consistency costs; a resolver can instead tolerate cold caches after node replacement. Capacity planning should account for query rate, cache hit ratio, response-size distribution, TCP connection behavior, upstream latency, and abuse traffic—not just average request rate.

The service should expose separate controls for recursion and authoritative service. A public recursive resolver intentionally offers recursion to the public, but this is a policy decision with abuse and cost implications. An organization’s internal resolver generally restricts recursion to authorized networks or authenticated clients. Accidentally exposing an internal recursive resolver can make it an open resolver usable in reflection/amplification attacks: an attacker spoofs a victim’s source address, sends a small query, and causes the resolver to send a larger response to that victim. Rate limiting, response-rate controls, source validation where available, capacity isolation, abuse monitoring, and clear public-service policy help mitigate this risk. Restrictions must not prevent legitimate clients of a deliberately public service.

At the edge, health checks should cover DNS semantics over both UDP and TCP, including a response large enough to exercise TCP fallback. Monitoring only whether port 53 is open misses broken recursion, stale trust anchors, unreachable authoritative servers, or failed DNSSEC validation. Useful signals include success/error rates by response code, latency percentiles, cache-hit ratio, upstream timeout rate, TC-bit frequency, UDP-to-TCP retry success, TCP connection failures, DNSSEC validation failures, and traffic by network/source class. Avoid logging full query names indefinitely without a privacy and retention policy: DNS requests can reveal sensitive behavior.

## Failure and capacity decisions

- **UDP response lost:** the client or resolver may retry; retries increase load, so timeout/backoff behavior and overload protection matter.
- **TC response followed by blocked TCP:** the client sees failure even though the resolver and authoritative data are healthy. Permit TCP/53 end to end and test it.
- **Recursive upstream timeout:** distinguish timeout from NXDOMAIN. Retry/fail over carefully; uncontrolled parallel retries can amplify a dependency incident.
- **Cache miss storm:** many simultaneous misses for a popular name can duplicate upstream work. Request coalescing can collapse equivalent in-flight lookups, but must preserve query semantics and not let one caller’s cancellation abort everyone’s shared lookup.
- **Bad or stale cached answer:** TTLs bound ordinary cache duration but do not guarantee instant purge. Plan emergency invalidation and communicate the limits of resolver and client caches.
- **Resolver overload:** shed or rate-limit work according to service policy, protect critical control paths, and return appropriate DNS errors rather than fabricating authoritative data.

## Supplied names explained

- **Recursive resolver:** pursues a DNS query for a client, using cache and authoritative referrals.
- **UDP/TCP port 53:** the ordinary DNS transports; both are required for interoperable DNS service.
- **TC bit and TCP retry:** a response can signal truncation; retry over TCP to obtain a complete answer.
- **EDNS(0):** DNS extension mechanism that advertises capabilities including a UDP payload size; it does not guarantee the network path supports that size.
- **DNSSEC:** signatures and authenticated denial data allow validation of DNS data; it is separate from transport encryption.
- **Negative cache:** temporary storage of an authoritative negative result under defined caching rules.

## Cross-item comparison

| Mechanism | What it addresses | What it does not provide |
| --- | --- | --- |
| UDP DNS | Low-overhead request/response transport | Reliable delivery, encryption, or guaranteed passage of large responses |
| TCP DNS | Reliable byte-stream transport for complete DNS messages | Confidentiality or authenticity by transport alone |
| DNSSEC | Authentication of signed DNS data and denial proofs | Confidentiality of queries |
| DoT/DoH/DoQ | Encryption of a client-to-resolver transport hop | Trustworthiness of resolver policy or encryption to every authoritative server |

## Examples

An application asks its stub resolver for a DNSSEC-signed TXT record. The stub sends a UDP query to its recursive resolver. If the answer is truncated, it retries via TCP; the recursive resolver may have already cached the result or may fetch it from authoritative servers. A DNSSEC-validating resolver checks the chain and returns either validated data or an appropriate failure. If a firewall blocks TCP/53, that path can fail even while small A-record lookups continue working. An end-to-end test should exercise both transports and distinguish validation failure from timeout or a negative answer.

## Common mistakes

- Treating a recursive resolver as the authoritative source for every answer.
- Assuming DNS is UDP-only or that TCP is only for zone transfers.
- Assuming EDNS(0) means every network path accepts a large UDP datagram.
- Treating NXDOMAIN, NODATA, SERVFAIL, timeout, and connection failure as interchangeable.
- Assuming DNSSEC encrypts query names, or that encrypted transport proves the answer is authoritative.
- Exposing a supposedly private recursive resolver to the Internet without an explicit public-service policy.
- Testing only port reachability instead of cache hits, recursion, DNSSEC, truncation fallback, and both transports.

## Knowledge checks with answers

1. **Who owns the authoritative record?** The authoritative zone operator. A recursive resolver returns cached or newly resolved data on behalf of clients.
2. **Why must a resolver support TCP if most queries use UDP?** Large or truncated answers require reliable retry over TCP; TCP also supports DNS operations such as zone transfer. Current operational guidance requires both transports.
3. **Does DNSSEC hide the domain from the resolver?** No. DNSSEC authenticates DNS data; encryption of the client-to-resolver channel is separate.
4. **Why is an open recursive resolver a security concern?** It can be abused as a source-spoofed reflector that sends amplified responses to victims.
5. **What should a health check test?** At minimum, successful recursive answers over UDP and TCP, a truncated/large-response path, and the resolver’s intended DNSSEC and failure behavior.
