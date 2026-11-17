# end-to-end system design case studies — Reference: Open Connect

Sources: [HLD Handbook case studies](https://hld.handbook.academy/curriculum/case-studies/), [Netflix Open Connect program](https://openconnect.netflix.com/en/), [Netflix Open Connect overview (PDF)](https://openconnect.netflix.com/Open-Connect-Overview.pdf).

## Scope and version

Open Connect is Netflix’s provider-specific content delivery network and ISP partnership program. Its deployment, hardware, control plane, and routing behavior should not be generalized to every CDN or treated as a product an unrelated service can deploy. The overview is maintained by Netflix and may change over time.

## How this group fits the mental model

Netflix describes Open Connect as a combination of a global network, purpose-built Open Connect Appliances (OCAs), a control plane, and ISP interconnections. OCAs store playable media and serve it over HTTP/HTTPS; Netflix’s overview says they do not store member viewing history or other client data. Playback services perform authorization and licensing, while a steering service selects eligible OCAs based on file availability, health, and network proximity, then supplies URLs to the client.

The program has two ISP-facing components:

- **Embedded OCAs:** Netflix provides appliances to qualifying ISPs for deployment inside their networks. The ISP provides rack space, power, and connectivity. BGP sessions help steer traffic to those appliances.
- **Settlement-free interconnection (SFI):** the ISP connects at an Internet Exchange Point or through a private interconnect to Netflix appliances in data centers. Peering alone may be used where embedded appliances are not warranted.

Netflix describes proactive content fills and updates during off-peak windows, supported by popularity and placement decisions. This differs from a simple cache that fetches every object only after a cache miss. Exact placement and refresh policies are Netflix-specific.

## Supplied names explained

- `Open Connect` — Netflix’s content delivery program that localizes streaming traffic through OCAs and ISP partnerships using embedded appliances and/or direct interconnection.

## Request and content-flow model

1. OCAs report health, learned routes, and available files to control-plane services.
2. Playback services validate entitlement and determine the needed media files for the client and current conditions.
3. A steering service selects suitable OCAs using health, content availability, and network proximity.
4. The playback application returns URLs, and the client retrieves the media over HTTP/HTTPS.
5. Content is filled or refreshed on OCAs proactively; ISP interconnection can support updates and provide another delivery route.

The Netflix site describes example failover from one embedded OCA site to another and then to Netflix appliances at IX locations. This illustrates one provider’s arrangement, not a generic BGP/CDN failover guarantee. Capacity, content availability, routing convergence, and partner topology still affect recovery.

## Cross-item comparison

- **Generic pull CDN:** typically fetches a cache miss from its origin and retains it according to cache policy. Open Connect also supports on-demand delivery but documents proactive placement for much of its catalog.
- **Embedded CDN appliance:** places provider-operated cache servers inside an ISP network; the ISP contributes facilities and connectivity, while the CDN provider may operate the software and content placement.
- **IXP/PNI peering:** provides a network path to provider appliances but does not itself cache content. Open Connect can use peering without an embedded OCA.
- **Origin shield:** is an additional cache tier in a CDN-to-origin path; it reduces duplicate origin fetches under its product’s rules but is not equivalent to placing content inside an ISP network.

## Examples

For a popular new release, the control plane can select content for off-peak delivery to OCAs near ISP subscribers. A playback request then receives a URL for a healthy appliance that has the required encoded file. If that OCA fails, steering may use another embedded site or an IX appliance, subject to availability and capacity. If the requested file is absent everywhere nearby, the system may need a farther cache or origin path, increasing upstream traffic and latency. The client still adapts playback to the available bandwidth and device.

## Common mistakes

- Calling Open Connect a generic pull CDN and omitting its ISP partnership and proactive fill model.
- Assuming OCAs make authorization decisions or store user history; Netflix describes those responsibilities separately.
- Assuming every ISP receives an embedded appliance; Netflix says eligibility and deployment depend on traffic and site constraints.
- Treating BGP route selection as proof that a selected OCA has the requested file or adequate capacity.
- Assuming peering alone is a cache or that a cache placement guarantees a direct peering route.
- Reusing Netflix’s scale, topology, or appliance behavior as a universal design target.

## Knowledge checks with answers

1. **What are Open Connect’s main building blocks?** Netflix describes OCAs, a control plane and steering, client playback services, and ISP interconnection/embedded deployments.
2. **How is it different from a basic demand-filled cache?** Netflix documents proactive off-peak content fills as well as request serving; placement and refresh policies are provider-specific.
3. **What does peering contribute?** A network path to appliances and potentially lower transit use; peering does not itself store or select media.
