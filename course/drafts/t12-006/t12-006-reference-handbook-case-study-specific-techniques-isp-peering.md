# end-to-end system design case studies — Reference: ISP peering

Sources: [HLD Handbook case studies](https://hld.handbook.academy/curriculum/case-studies/), [Cloudflare peering overview](https://www.cloudflare.com/learning/network-layer/what-is-peering/), [Netflix Open Connect](https://openconnect.netflix.com/en/).

## Scope and version

Internet peering is a network interconnection between autonomous systems. It affects routing and traffic exchange below the application layer; it does not guarantee application availability, latency, or end-to-end route selection. Commercial terms and routing policies are network-specific.

## How this group fits the mental model

Two networks can exchange traffic directly at a shared Internet Exchange Point (public peering) or through a private network interconnect (PNI). They use BGP to announce reachable IP prefixes and apply routing policy to select paths. Peering may shorten paths and reduce use of upstream transit for the exchanged routes, but operators still need transit or other reachability for destinations outside the peering relationship.

“Settlement-free” describes the commercial arrangement, not a protocol property or promise that no party incurs infrastructure costs. Peering eligibility and terms can depend on traffic balance, capacity, location, and each network’s policy. A peer can withdraw routes or end the relationship, so alternate paths and capacity matter.

## Supplied names explained

- `ISP peering` — Direct traffic exchange between networks, commonly at an IXP or via PNI, using BGP route announcements and each network’s routing policy. It can improve path efficiency and offload transit for the exchanged traffic; it is not a substitute for a complete routing and failure plan.

## Architecture and operational choices

1. Identify the traffic volume, destinations, geographic paths, and congestion or transit costs that justify interconnection.
2. Compare public peering at an IXP with private interconnection. Public exchange can provide access to many peers over an exchange fabric; a PNI is a direct interconnect whose capacity and redundancy are planned with one peer.
3. Establish route filters, prefix limits, max-prefix behavior, RPKI/IRR validation where used, BGP session protection, and clear escalation contacts. Review the peer’s routing and operational requirements.
4. Maintain independent upstream/transit or alternate peer paths where required. A direct route can fail because of a link, exchange, router, policy error, or remote withdrawal.
5. Monitor route visibility, path changes, packet loss, latency, utilization, and traffic shifts. Test capacity after a peer or link is withdrawn.

Netflix Open Connect is one specific example: Netflix documents both IXP-based settlement-free interconnection and private interconnection to its appliances. Its program also offers embedded cache appliances to qualifying ISPs. Those details are not universal requirements of peering.

## Cross-item comparison

- **Peering vs IP transit:** Peering exchanges routes between the parties and their downstream networks under their agreement; transit is a paid service that provides broader reachability through the provider. An ISP may need both.
- **Public peering vs PNI:** Public peering uses an IXP fabric shared by multiple networks; a PNI is a dedicated interconnection between two networks. Capacity, cost, redundancy, and commercial terms differ by deployment.
- **Peering vs CDN cache deployment:** Peering changes network paths for traffic; a cache stores content closer to consumers. A provider may use either or both.

## Examples

An ISP sees evening video traffic saturating a costly transit link while traffic from a large content provider is concentrated in one metro. It evaluates direct peering at a local IXP, verifies route policy and port capacity, and keeps transit as a fallback. If the peering session disappears, alternate paths must carry the shifted traffic without exceeding their capacity. If the dominant issue is repeated long-distance content delivery rather than route cost, a local cache appliance or provider CDN arrangement may help more than peering alone.

## Common mistakes

- Treating peering as a guarantee of lower latency for every flow.
- Assuming settlement-free means cost-free to deploy or operate.
- Advertising or accepting overly broad routes without filtering and limits.
- Removing transit before checking reachability to networks outside the peer.
- Ignoring failure capacity when all traffic shifts to the remaining paths.
- Confusing a CDN cache with a routing interconnection.

## Knowledge checks with answers

1. **Does peering provide access to the whole Internet?** No. It exchanges routes covered by that relationship; transit or other peers may be needed for other destinations.
2. **How do networks exchange reachability information?** Commonly through BGP sessions that announce prefixes, subject to each network’s policies and filters.
3. **Does a direct peer guarantee a faster path?** No. It can shorten some routes, but real performance depends on routing, congestion, geography, and the end-to-end path.
