# Microsoft Azure architecture identity networking compute and data services — Reference: Virtual networks, filtering, private access, and traffic entry

Sources: [Virtual networks](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview), [Network Security Groups](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview), [User-defined routes](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview), [Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-overview), [Private endpoint DNS integration](https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-dns-integration), [Azure Load Balancer](https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview), [Application Gateway](https://learn.microsoft.com/en-us/azure/application-gateway/overview), [Azure Front Door](https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview), [Azure Route Server](https://learn.microsoft.com/en-us/azure/route-server/overview), [Traffic Manager](https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-overview), and [Network Security Perimeter](https://learn.microsoft.com/en-us/azure/private-link/network-security-perimeter-concepts).

## Scope and version

This reference covers common Azure VNet, private connectivity and traffic-entry services. Routing, DNS, network security, service support and regional availability vary by resource/provider. Current guidance was checked 2026-11-16. Test name resolution and the actual application path after deployment; a control-plane object being present is not proof of data-plane reachability.

## How this group fits the mental model

Connectivity is the conjunction of address allocation, routes, name resolution, filtering, endpoint/service configuration and application authorization. Different Azure services operate at different layers. A private endpoint adds a network interface/private address for a supported PaaS resource; it does not automatically change every DNS path or grant a data-plane role. Global HTTP routing, regional transport load balancing and DNS endpoint selection are separate traffic patterns.

## Supplied names explained

### VNet addressing and traffic filtering

- `Azure Virtual Network (VNet)` — Private address space and routing boundary for Azure resources and supported connectivity. It is regional; peering/gateways extend selected connectivity.
- `VNet address space` — One or more non-overlapping CIDR ranges assigned to a VNet. Plan around peering, VPN/on-premises ranges, service integration and future growth.
- `Azure subnet` — Address range within a VNet for resource placement, delegation and policy association. Some services require dedicated/delegated subnets.
- `Network Security Group (NSG)` — Stateful Layer 3/4 allow/deny rules applied to a subnet or network interface. It filters traffic, but does not replace app identity or service data authorization.
- `NSG security rule` — Ordered rule matching source/destination, port, protocol and direction with allow/deny action. Lower numeric priority is evaluated first; the first match wins.
- `Application Security Group (ASG)` — Logical grouping of network interfaces referenced in NSG rules, helping express app-tier relationships without hardcoding every IP.
- `Network Security Group association` — Attachment of an NSG to a subnet or NIC. Effective traffic depends on both applicable associations and the rest of the route path.
- `NSG priority` — Numeric order for security rules; use unique priorities and leave room for changes. A higher number means later evaluation.
- `Azure route table` — Collection of routes associated with a subnet; system routes, BGP and user-defined routes interact to determine next hop.
- `User-defined route (UDR)` — Custom route overriding selected system routing behavior. Incorrect routes can blackhole traffic or send it through the wrong appliance.
- `Azure route table route` — Destination prefix plus next-hop selection. Longest-prefix and route-source precedence determine the effective path.
- `Next hop type` — Route target such as Virtual network, Internet, Virtual network gateway, Virtual appliance or None; appliance routes require correct forwarding configuration.
- `Azure route propagation` — Propagation of gateway/BGP-learned routes to route tables where enabled; disabling propagation can break hybrid return paths.
- `Azure Virtual Network peering` — Private IP connectivity between VNets over the Azure backbone. Peering is not transitive by default; hub routing/firewall designs need explicit transit.
- `Global VNet peering` — Peering across supported Azure regions. Check address overlap, supported region/cloud boundaries, encryption requirements and effective route behavior.
- `VNet peering gateway transit` — Option to use a hub VNet gateway for connected peered VNets when configured. It does not turn arbitrary peerings into a transitive mesh.
- `Azure Firewall Policy` — Central rule collection/configuration for Azure Firewall instances, supporting reusable governance and rule management.

### Private access and hybrid connectivity

- `Azure Private Link` — Private connectivity model to supported Azure PaaS services or customer-published services without using a service's public endpoint path.
- `Azure private endpoint` — VNet network interface with private IP representing a Private Link connection to a particular service resource. Approval, DNS and service-side network configuration still matter.
- `Private endpoint network interface` — NIC created for a private endpoint and assigned a private address in its subnet. Inspect its IP and effective routes when debugging.
- `Private DNS zone group` — Association between a private endpoint and supported private DNS zones, maintaining endpoint records as endpoint state changes. It doesn't automatically link the zone to every client VNet.
- `Private Link Service` — Lets a service provider expose a supported service behind Private Link for consumers to connect with private endpoints; provider and consumer acceptance/configuration are distinct.
- `Azure Private DNS zone` — Azure-hosted DNS zone for private name resolution, commonly used for service private endpoint names.
- `Private DNS zone virtual network link` — Links a Private DNS zone to a VNet for name resolution, with optional VM auto-registration behavior where appropriate.
- `Azure DNS` — Microsoft's DNS hosting/resolution products for public and private zones. DNS records direct clients but do not enforce application authorization.
- `Azure DNS Private Resolver` — Managed DNS forwarding/resolution endpoints that connect Azure VNets and on-premises DNS designs without running customer DNS VMs.
- `Azure NAT Gateway` — Managed outbound connectivity for subnet private IPs with scalable SNAT; it does not provide inbound connectivity or replace NSGs/firewalls.
- `Azure Bastion` — Managed access path to VMs over private addresses, reducing need to expose RDP/SSH ports publicly. It is an admin-access service, not app ingress.
- `Azure VPN Gateway` — Encrypted VPN connectivity between VNets and/or on-premises networks, with tunnel/protocol/throughput and routing choices.
- `Azure ExpressRoute` — Private connectivity between customer/on-premises networks and Microsoft cloud through a connectivity provider; not automatically encrypted at the transport layer.
- `Azure Virtual WAN` — Managed hub-based networking service combining connectivity, routing and security integrations for larger distributed networks.
- `Azure Route Server` — Manages dynamic BGP route exchange between network virtual appliances and Azure virtual networks; it is not itself a packet-forwarding firewall or gateway.
- `Azure Firewall` — Managed stateful firewall service with network/application rules and centralized filtering. Throughput, policy, SNAT and routing design affect effective behavior.
- `Azure DDoS Protection` — DDoS mitigation service for supported public IP/VNet deployments; it is not a substitute for application-layer abuse limits or WAF rules.
- `Azure Network Security Perimeter` — Network boundary for supported PaaS resources outside VNets, controlling public access with association and inbound/outbound access rules. It can allow Private Endpoint traffic; service support and enforcement mode must be verified.

### Network diagnosis and regional traffic entry

- `Azure Network Watcher` — Network diagnostics/monitoring services for Azure network resources; region and feature availability vary.
- `Network Watcher connection troubleshoot` — Tests connectivity between a source and destination and reports path/connection issues when supported.
- `Network Watcher IP flow verify` — Evaluates whether an NSG rule allows or denies a hypothetical flow for a NIC/IP/port/protocol.
- `Network Watcher NSG diagnostics` — Diagnoses effective NSG configuration/rule outcomes; it doesn't validate application-layer behavior.
- `Azure Load Balancer` — Layer 4 load-balancing service for TCP/UDP flows, using frontend IPs, backend pools, rules and health probes.
- `Azure Standard Load Balancer` — Standard SKU for modern regional Layer 4 balancing with zone-aware and outbound design features; configure outbound rules/NAT as needed.
- `Azure Load Balancer health probe` — Determines backend health for rule distribution using a configured TCP/HTTP/HTTPS check. Probe success proves that check, not the full user request.
- `Azure Load Balancer rule` — Maps frontend IP/port/protocol to a backend pool/port with distribution and idle timeout behavior.
- `Azure Application Gateway` — Regional Layer 7 web traffic manager/reverse proxy with listeners, routing, TLS and optional WAF. Backend health and host/path settings must agree with the app.
- `Azure Application Gateway listener` — Frontend address, protocol, port, host and TLS configuration receiving traffic.
- `Application Gateway backend pool` — Backend targets (such as IPs, FQDNs or app resources) selected for routing; DNS and health-probe reachability affect membership.
- `Application Gateway probe` — HTTP(S) or TCP health test for backend status. Host, path, protocol and expected response should reflect the app's serving readiness.
- `Application Gateway Web Application Firewall (WAF)` — Layer 7 rule engine integrated with Application Gateway to detect/block supported web attack patterns; tune exclusions and operate in the intended mode.
- `Azure Front Door` — Global edge entry and HTTP/S application delivery service for routing to origins across regions, with caching/security features depending on configuration.
- `Azure Front Door endpoint` — Globally reachable hostname/frontend resource for receiving client traffic.
- `Azure Front Door origin group` — Set of backend origins with health probes and load-balancing/failover configuration.
- `Azure Front Door route` — Maps frontend domains/patterns to an origin group and optional rule set/caching/HTTPS behavior.
- `Azure Front Door Web Application Firewall` — WAF policy associated with Front Door to inspect edge HTTP/S requests and apply managed/custom rules.
- `Azure Front Door WAF policy` — The policy resource that configures managed rule sets, custom rules and policy mode for a Front Door security association; validate supported SKU and association scope.
- `Azure Network Security Perimeter access rule` — Explicit inbound or outbound rule controlling supported public network access for associated PaaS resources; validate supported resource types and enforcement mode.
- `Azure Traffic Manager` — DNS-based endpoint-routing service. Clients resolve a name to a selected endpoint and then connect directly; DNS caching/TTL delays failover.
- `Azure DNS-based traffic routing` — Returns DNS answers based on configured policy/health/region instead of proxying every client request through a data-plane load balancer.
- `Azure Traffic Manager profile` — DNS name, routing method, endpoint list and health monitoring configuration controlling Traffic Manager responses.
- `Public IP address` — Internet-routable Azure address when associated/configured for exposure; resource association alone does not imply a service listens or is safe.
- `Private IP address` — Address from private space used within VNet/hybrid connectivity. Reachability depends on routes, DNS and filtering.
- `Azure network interface (NIC)` — VM/network-resource interface with private IP, NSG and IP configuration settings; effective connectivity is more than an IP value.

## Cross-item comparison

| Service | Layer and path | Useful when | Limitation to remember |
|---|---|---|---|
| Standard Load Balancer | Regional Layer 4 flow distribution | TCP/UDP services and internal/public IP balancing | Not an HTTP router or WAF |
| Application Gateway | Regional HTTP/S reverse proxy | Web routing, TLS termination, WAF and private app ingress | Regional and frontend/backend configuration needs careful health/DNS setup |
| Front Door | Global HTTP/S edge | Multi-region web entry, global routing and edge policies | Origin health/route/caching rules and app state failover remain customer design |
| Traffic Manager | DNS answers | DNS-based global endpoint selection, including non-Azure endpoints | Resolver/client caches delay changes; it doesn't proxy traffic |
| Private Endpoint | Private IP to a supported service | Private service reachability from a VNet | DNS, identity authorization and public-access policy are still separate |

## Examples

To make a storage account privately reachable from an app subnet, create a private endpoint in a non-overlapping subnet, approve the connection, associate the correct Private DNS zone group, link the private zone to the app's resolver VNet, and set service public-network policy intentionally. From the app's network, verify the storage hostname resolves to the endpoint's private IP; inspect effective routes and NSGs; then test identity-based blob authorization. If DNS returns a public address, investigate private zone/link/forwarding before broadening firewall rules.

For internet-facing HTTP, Front Door can route globally to regional Application Gateways or app origins. Use Application Gateway for regional private ingress or WAF needs; use Front Door for global edge routing. Traffic Manager can select DNS endpoints but clients connect directly and honor cached answers. Choose based on routing layer and failure objective, not on feature-name overlap.

## Common mistakes

- Assuming VNet peering routes through a third peered network automatically.
- Overlapping VNet/on-premises address ranges and discovering the conflict during peering/VPN.
- Debugging NSGs before checking DNS, route tables, endpoint approval and backend listener.
- Assuming private endpoint creation automatically integrates DNS with every VNet.
- Assuming NAT Gateway accepts inbound traffic.
- Treating ExpressRoute as inherently encrypted or a firewall.
- Forgetting return routes for hybrid traffic or asymmetric paths through NVAs.
- Using Traffic Manager as if it were a reverse proxy or immediate failover switch.
- Treating a successful health probe as proof that all users and API paths are healthy.
- Applying WAF rules without monitoring false positives and app-specific behavior.
- Assuming Network Security Perimeter covers every Azure PaaS resource or replaces identity controls.

## Knowledge checks with answers

1. **What does a private endpoint give an app?** A private interface/IP path to a supported service; DNS, routing, connection approval, public path policy and identity permission are also needed.
2. **Why is Traffic Manager not the same as Load Balancer?** It returns DNS choices; clients connect to endpoints directly and can cache answers. Load Balancer proxies/distributes flows at its data plane.
3. **Which component handles HTTP path routing and WAF at regional scope?** Application Gateway can do Layer 7 web routing/WAF; verify its listeners, backend pool, probes and rules.
4. **Does VNet peering create transitive hub connectivity?** No. Configure gateway transit, routing or Virtual WAN/hub design deliberately.
5. **What does NSG priority mean?** Rules are evaluated in numeric order, with lower numbers first; the first matching rule determines allow/deny.
6. **Can NAT Gateway expose a private service inbound?** No. It provides outbound SNAT; use an appropriate inbound endpoint/load-balancing service.
