# Linux shell permissions processes networking systemd and logs — Reference: Interfaces, addresses, routes, sockets, DNS, packet filters, and TLS diagnostics

Sources: [ip(8)](https://man7.org/linux/man-pages/man8/ip.8.html), [ss(8)](https://man7.org/linux/man-pages/man8/ss.8.html), [nft(8)](https://man7.org/linux/man-pages/man8/nft.8.html), [systemd-resolved manual](https://www.freedesktop.org/software/systemd/man/latest/resolvectl.html), and [systemd service manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html).

## Scope and version

Commands and resolver/firewall defaults vary by distribution. `iproute2`, `nftables`, `iptables` compatibility, NetworkManager, systemd-resolved, libc/NSS, and containers each add behavior. Prefer the host's actual resolver and firewall manager; avoid editing generated configuration files without identifying their owner.

## How this group fits the mental model

A client request needs a usable path through several distinct checks: interface and address, route, name resolution, destination socket, packet filter, transport, TLS, then application. A diagnostic should name the layer and vantage point. For example, DNS success on a laptop says nothing about DNS inside a container's namespace.

## Supplied names explained

### Interfaces, addresses, and routes

- **Network interface** — Kernel network endpoint such as Ethernet, Wi-Fi, loopback, veth, or tunnel; interfaces may exist in separate network namespaces.
- **Loopback interface** — Local interface (normally `lo`) for same-namespace traffic to loopback addresses; it does not connect separate containers.
- **Ethernet link state** — Carrier/operational state indicating link-layer connectivity; it does not prove IP configuration or remote service health.
- **MAC address** — Link-layer address used on local networks; routers replace frame headers across hops, so a remote server's MAC is not normally visible end-to-end.
- **IPv4 address** — 32-bit interface address. Private, public, loopback, link-local, and wildcard addresses have different routing scopes.
- **IPv6 address** — 128-bit address with global, unique-local, link-local, and loopback scopes. Link-local addresses need an interface zone when referenced.
- **CIDR prefix** — Address plus prefix length (e.g. `/24`) defining a network range/mask; it is not a port or gateway.
- **Default gateway** — Next hop used when no more-specific route matches; routes and policy rules can select different paths.
- **Routing table** — Prefix/metric/next-hop entries; Linux policy routing can use multiple tables and rules.
- **`ip link`** — Inspect/configure link devices and state; destructive changes can disconnect the host.
- **`ip address`** — Inspect/configure interface addresses; local address presence alone does not prove a route or listening service.
- **`ip route`** — Inspect/configure route entries; use `ip route get DESTINATION` to ask which route a local lookup would select.
- **`ip neigh`** — Inspect neighbor cache mappings such as IPv4 ARP or IPv6 NDP; incomplete/stale entries can explain local-link reachability problems.

### Sockets and bind addresses

- **`ss`** — Inspect sockets and TCP/UDP state; options such as `-lntup` show listeners with numeric addresses and owning processes where permissions allow.
- **Listening socket** — Server socket waiting for connections/datagrams on a local address/port; a process can run without the expected listener.
- **Established TCP connection** — TCP connection with completed handshake; it does not prove TLS or application request success.
- **TCP port** — 16-bit transport endpoint number in a local/remote socket tuple; firewalls/NAT and namespaces affect reachability.
- **UDP socket** — Datagram endpoint without TCP-style connection handshake; no `LISTEN` state means absence of a TCP listener is not equivalent to UDP failure.
- **Unix domain socket** — Local IPC socket addressed by pathname or abstract namespace; filesystem permissions and mount visibility can govern access.
- **Socket bind address** — Local address/interface scope a server accepts on. Binding loopback intentionally limits remote clients; binding all interfaces increases exposure and still needs firewall policy.
- **`0.0.0.0 wildcard listener`** — IPv4 wildcard bind matching local IPv4 interfaces in that network namespace. It is not a routable client destination and does not by itself make a port reachable.
- **`127.0.0.1 loopback listener`** — IPv4 loopback-only bind accessible only within the same network namespace (or through an explicit proxy/forward).
- **IPv6 dual-stack listener** — An IPv6 wildcard socket may also accept IPv4-mapped connections depending on `IPV6_V6ONLY` and system defaults; inspect actual sockets rather than assuming.

### Resolver and DNS

- **DNS resolver** — Component answering name queries; libc/NSS, local cache, systemd-resolved, and recursive DNS server can form multiple layers.
- **`/etc/resolv.conf`** — Resolver configuration file or symlink, often generated by a network manager/resolved. Editing it directly may be overwritten.
- **`/etc/hosts`** — Local static hostname mappings; NSS ordering determines whether and when it is consulted.
- **`getent hosts`** — Queries the configured NSS hosts database, approximating ordinary application lookup. It may not return the same result as a direct DNS query.
- **`resolvectl`** — Inspect/control systemd-resolved links, DNS servers, domains, and cache when that service is in use.
- **`dig`** — DNS query tool that can target a chosen server and inspect record responses. It bypasses some NSS/local-host behavior; explicit server queries isolate recursive DNS.
- **DNS A record** — Maps a name to IPv4 address.
- **DNS AAAA record** — Maps a name to IPv6 address.
- **DNS CNAME record** — Alias from one DNS name to another; canonical target may then require additional queries.
- **DNS TTL** — Cache lifetime in seconds supplied with a record; resolver/client behavior and negative caching can delay changes.
- **DNS search domain** — Suffixes appended to unqualified names by resolver configuration; can cause surprising lookup expansion and information leakage.
- **DNS caching** — Results may persist in browser, OS, local stub, recursive resolver, or application caches; a server-side change is not instantaneously universal.

### Probes, firewall, and TLS

- **`ping`** — ICMP echo diagnostic; can be blocked/rate-limited even when TCP works, or succeed while the app port fails.
- **`traceroute`** — Estimates hops using probe packets and TTL/hop limits; filtering, asymmetry, and load balancing can hide or alter results.
- **`tracepath`** — Path/MTU diagnostic that often needs fewer privileges than classic traceroute; probes may still be filtered.
- **`curl`** — HTTP client useful for DNS/TCP/TLS/request checks. `-v` exposes negotiation detail; use the expected host, SNI, CA trust, method, headers, and network vantage.
- **`nc (netcat)`** — Utility for simple TCP/UDP connection tests and listeners; option syntax differs between implementations and a successful TCP connect proves no application semantics.
- **`tcpdump`** — Packet capture tool; captures may contain credentials/personal data. Limit interface, host/port, snap length and duration; obtain authorization and protect files.
- **`nftables`** — Linux packet-filtering framework with tables/chains/rules and hooks; multiple tools/managers may own rules.
- **`nft`** — Command-line frontend to inspect/manage nftables. `nft list ruleset` is read-only; validate changes and preserve rollback access before applying firewall changes remotely.
- **`iptables compatibility layer`** — iptables command can use legacy xtables or an nftables backend, depending on system. Mixing frontends can obscure effective rules.
- **Firewall rule order** — In a chain, verdict and control-flow order determine which rules see a packet; default policies and jumps matter, not merely the presence of an allow rule.
- **TLS certificate chain test** — Validate handshake, server name, trust chain, expiry and protocol from the client path. A certificate can be valid for one name but not another.
- **`openssl s_client`** — Low-level TLS client for inspecting handshake/certificates; supply `-servername host` for SNI and `-connect host:port`; successful handshake does not test HTTP routing.
- **Hostname resolution versus socket reachability** — Name-to-address success is one step; route, filter, listener, and protocol can still fail.
- **ICMP success versus TCP service health** — Echo replies do not establish that a specific TCP port accepts connections or that the application is healthy.
- **localhost versus container/remote interface** — `localhost` resolves to loopback in the current namespace; host and container loopbacks are distinct, while a wildcard bind and published port introduce other routing/firewall behavior.

## Layered troubleshooting sequence

```sh
ip -brief link
ip -brief address
ip route get 203.0.113.10
getent hosts api.example.test
ss -lntup
curl -v --connect-timeout 3 https://api.example.test/health
```

Use a real destination in place of the documentation address. If resolution differs, compare `getent`, `resolvectl query`, and `dig` against the configured and authoritative resolvers. If a local listener is missing, inspect service state. If it exists, check bind address and namespace, then filter/NAT path. For TLS use the intended hostname/SNI and trust store; do not disable certificate verification to “fix” production.

## Cross-item comparison

| Observation | Layer demonstrated | Next checks |
|---|---|---|
| `getent` returns an address | Host NSS resolution | Route and actual socket destination |
| `ss` shows a listener | Local socket exists | Bind scope, namespace, firewall |
| `ping` replies | ICMP path to an address | TCP port, TLS, HTTP, application |
| TCP connect succeeds | Transport handshake | TLS identity and application response |
| TLS handshake succeeds | Negotiation and certificate path | HTTP host/path/auth/readiness |

## Examples

Compare `getent hosts api.example.test` with `dig api.example.test A` and `dig api.example.test AAAA`, then inspect `ip route get ADDRESS` and the actual `ss` bind address. For a TLS endpoint, use `openssl s_client -connect host:443 -servername host` and a normal validating `curl -v https://host/health`. Each probe answers a different question.

## Common mistakes

`localhost` may resolve to `::1` before `127.0.0.1`; an app bound only to IPv4 may therefore behave differently. A service on `0.0.0.0` still may be blocked by firewall, cloud security group, NAT, or absent route. `curl -k` suppresses certificate validation and is only a diagnostic comparison, not a repair. Packet captures and verbose output may disclose sensitive metadata.

## Knowledge checks with answers

1. Does `0.0.0.0` identify a remote server? **No; it is a local IPv4 wildcard bind address.**
2. Why can `dig` differ from an app? **It can bypass NSS, hosts-file ordering, local caches, or the app's own cache.**
3. Does a listener on all interfaces guarantee remote access? **No; routing, firewall, NAT, namespace, and upstream controls still matter.**
4. What must accompany a TLS test using `openssl s_client`? **Correct SNI/hostname and separate application-level verification.**

## Summary

Test each network layer from the same vantage point as the failing client. Confirm addresses, route, resolver path, socket bind, filter, TLS identity, and application response independently; repair the earliest failing boundary.
