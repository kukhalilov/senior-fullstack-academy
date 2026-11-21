# end-to-end system design case studies — Reference: Virtual private network (VPN) and encrypted DNS tradeoffs

Sources: [RFC 4301: Security Architecture for the Internet Protocol](https://www.rfc-editor.org/rfc/rfc4301.html), [RFC 7858: DNS over TLS](https://www.rfc-editor.org/rfc/rfc7858.html), [RFC 8484: DNS Queries over HTTPS](https://www.rfc-editor.org/rfc/rfc8484.html), [RFC 9250: DNS over Dedicated QUIC Connections](https://www.rfc-editor.org/rfc/rfc9250.html), [RFC 9462: Discovery of Designated Resolvers](https://www.rfc-editor.org/rfc/rfc9462.html), [RFC 9499: DNS Terminology](https://www.rfc-editor.org/rfc/rfc9499.html).

## Scope and version

This is a conceptual comparison of network tunnels and encrypted DNS, not configuration guidance for a particular VPN provider, operating system, browser, or resolver. The cited RFCs specify IPsec and DNS transport standards. VPN products differ in routing, authentication, device management, logging, and failure behavior; verify their current documentation before deployment.

## How this group fits the mental model

A VPN creates a protected path between a device or network and a VPN endpoint. Depending on route policy, the tunnel may carry all traffic (full tunnel) or only selected destinations (split tunnel). The VPN endpoint forwards traffic onward under its network and security policy. A VPN can protect traffic on the access network and provide access to private routes, but it moves trust toward the tunnel endpoint and provider. It does not make a user anonymous or guarantee that every application follows the tunnel.

DNS answers a different question: which resolver receives the name lookup, and how is that query transported? Ordinary DNS over port 53 is generally visible to networks that can observe that path. DNS over TLS (DoT), DNS over HTTPS (DoH), and DNS over QUIC (DoQ) encrypt the connection between a DNS client and a chosen resolver. They do not hide the query from that resolver, and do not automatically encrypt the later communication from the resolver to authoritative DNS servers.

## Resolver path is a routing decision

When a VPN connects, the device might receive DNS server settings from the VPN, use a locally configured encrypted resolver, or retain pre-existing resolver configuration. The actual path depends on operating-system policy, application behavior, VPN routes, name-resolution APIs, and resolver discovery. Therefore, “VPN on” does not by itself prove that all DNS requests travel through the VPN or go to a particular resolver.

With a full tunnel and VPN-provided resolver, both application traffic and DNS may travel to the VPN endpoint, after which the resolver may be operated by the VPN provider or another service. The local access network sees an encrypted tunnel destination, while the resolver can see query names and client metadata. With split tunneling, an internal corporate domain may need an internal resolver reached through the tunnel while public lookups use another resolver. Incorrect split-DNS rules can leak internal names to public resolvers or make internal services unresolvable.

Encrypted DNS creates another protected hop. If the client sends DoH to a resolver through a VPN, the access network observes the VPN tunnel, the VPN endpoint can observe the destination resolver and traffic metadata, and the DNS resolver sees the query. If the client sends DoH outside the VPN, the local network may see the resolver endpoint and connection timing but not plaintext DNS contents, while the VPN provider may not carry that resolver traffic. Encryption changes which parties can observe the query; it does not eliminate the need to choose and trust a resolver.

## Policy, privacy, and control tradeoffs

Organizations may need internal zone resolution, malware filtering, logging for incident response, or data residency controls. A managed VPN plus designated resolver can provide a controlled path, but policy enforcement must cover browsers and applications that implement their own DoH, DNS over VPN boundaries, failover, captive portals, and disconnected states. Discovery mechanisms such as DDR help clients learn designated encrypted resolvers in supported environments; they are not a universal guarantee that every application or device follows the organization’s policy.

Consumer privacy goals may favor encrypting the client-to-resolver hop and minimizing resolver retention, but an encrypted resolver can bypass local filtering and give a new provider visibility. A VPN provider and a public encrypted-DNS provider may be separate entities, which can reduce concentration of observation in some threat models but adds dependencies and operational complexity. Neither arrangement alone prevents tracking through account identity, cookies, application telemetry, IP addresses, or endpoint compromise.

DNS transport choice also affects operations. DoT uses TLS for DNS; DoH carries DNS messages over HTTPS and can share port 443 with ordinary web traffic; DoQ uses QUIC. These transports have distinct deployment and network-policy properties. Encryption can make middlebox inspection and network-level DNS filtering less effective, and restrictive networks may block or interfere with some transports. When encrypted DNS fails, fallback behavior matters: silent fallback to plaintext can violate a privacy or enterprise policy, while fail-closed behavior can make name resolution unavailable. Decide explicitly and test.

## Design and operational checklist

1. State the threat model: protect against the local Wi-Fi operator, ISP, VPN provider, DNS resolver, or some combination?
2. Define routing scope: all traffic, only private subnets, or selected application traffic? Specify DNS routes separately.
3. Name resolver ownership and policy for public names, internal zones, and split-horizon names.
4. Decide whether encrypted DNS is permitted, mandated, or centrally managed; account for browser-level resolver settings and discovery.
5. Specify failure behavior: reconnect, switch to another encrypted resolver, use VPN-provided DNS, or fail closed. Make any plaintext fallback deliberate and visible.
6. Test from outside and inside the tunnel, across suspend/resume, network changes, captive portals, IPv4/IPv6, and VPN interruption. Check both the resolver destination and the actual DNS transport rather than trusting a UI indicator.
7. Minimize logs and retention according to the operational requirement; access to DNS logs can reveal sensitive behavior.

## Supplied names explained

- **VPN tunnel:** a protected network path between a device/network and a VPN endpoint; routes determine which traffic enters it.
- **Full tunnel:** routes most or all device traffic through the VPN, subject to platform and app behavior.
- **Split tunnel:** sends only selected destinations or traffic classes through the VPN; DNS must be designed along with those routes.
- **DoT:** DNS carried over TLS, commonly TCP port 853.
- **DoH:** DNS carried in HTTPS exchanges; it can share web transport infrastructure but remains a DNS resolver connection.
- **DoQ:** DNS carried over QUIC using its dedicated DNS mapping.
- **DNSSEC:** data authentication for DNS responses, orthogonal to VPN routing and encrypted transport.
- **Designated resolver discovery:** mechanisms such as DDR can help a compatible client discover encrypted resolver service information, subject to deployment and policy.

## Cross-item comparison

| Choice | Main value | Main trust or operational cost |
| --- | --- | --- |
| VPN-provided DNS | Resolver policy and internal zones can follow the organization’s tunnel | VPN operator or endpoint can observe resolver traffic; routing and reconnect policy become dependencies |
| Encrypted public DNS | Protects the client-to-resolver hop from passive observers on that path | Resolver operator learns queries; may bypass local policy and add a separate provider dependency |
| Split DNS | Sends internal and public names to different resolvers | Rules and search suffixes can leak names or produce inconsistent results if misconfigured |
| Plain DNS fallback | Can restore resolution on restrictive networks | Reveals queries and may violate a fail-closed policy |

## Examples

A company laptop connects to a VPN with split routing. `payroll.corp.example` must resolve only through the company resolver, while public names should use the company’s designated encrypted resolver. Configure the corporate suffix rule and routes as one policy, including IPv6 and browser-level DNS behavior. Then disconnect the tunnel mid-query and test the defined fail-closed or recovery behavior. A check that only confirms the VPN icon is green does not verify any of these resolver paths.

## Common mistakes

- Claiming a VPN makes a user anonymous or prevents tracking generally.
- Assuming all device and application DNS automatically follows the VPN route.
- Confusing encryption to a recursive resolver with end-to-end encryption to the authoritative DNS server.
- Treating DoT, DoH, DoQ, and DNSSEC as interchangeable: the first three protect a transport hop; DNSSEC validates signed DNS data.
- Sending internal hostnames to a public resolver due to a missing split-DNS rule.
- Allowing an unplanned plaintext fallback that defeats the stated privacy policy.
- Assuming encrypted DNS hides queries from the resolver or removes trust in the VPN provider.
- Enforcing network DNS policy while overlooking browser-managed DoH or application-specific resolvers.

## Knowledge checks with answers

1. **If DNS uses DoH inside a VPN, which parties can still learn the query?** The chosen recursive resolver can; depending on routing and metadata, the VPN endpoint/provider may also learn the resolver destination and connection metadata.
2. **Does a full-tunnel VPN always guarantee all DNS is tunneled?** No. Resolver configuration, application behavior, route rules, and leak protection must be checked.
3. **How does split DNS help an enterprise?** It directs internal names to an authorized internal resolver while public names follow the chosen public-resolution policy; incorrect rules can leak names or break access.
4. **What is the difference between DNSSEC and encrypted DNS?** DNSSEC authenticates DNS data when validation succeeds; encrypted DNS protects a client-to-resolver transport hop. They solve different problems and can be used together.
