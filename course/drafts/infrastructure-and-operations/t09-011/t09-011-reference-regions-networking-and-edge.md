# AWS architecture identity networking compute and data services — Reference: Regions, VPCs, routing, traffic filtering, and private service connectivity

Sources: [Amazon VPC](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html), [subnets and route tables](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-subnet-basics.html), [network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html), [VPC endpoints and PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/what-is-privatelink.html), [Route 53 routing policies](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html), [CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html), and [Elastic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html).

## Scope and version

This reference explains all 55 supplied location, network, routing, edge, filtering and private-connectivity names. Region lists, quotas, edge coverage, per-service AZ support and feature availability change; check the current service page for a deployment decision. The mental model is a packet path with explicit boundaries, not a collection of “public/private” labels.

## How this group fits the mental model

First choose the failure and latency boundary: Region, AZ, edge point or on-premises location. Then design an address plan and VPC subnets, associate route tables, select gateways or endpoints, apply stateful and stateless filters, and decide where DNS and ingress are handled. A route only selects a path; it does not permit the traffic at a security group, firewall or application. Private connectivity changes the path, not the IAM decision.

## Supplied names explained

### Location and VPC layout

- `AWS Region` — Geographic AWS deployment area with separate regional service endpoints, resource scope and quotas. Not every service or feature is available in every Region; multi-Region architecture requires explicit data, identity, routing and failover design.
- `Availability Zone (AZ)` — Isolated location within a Region, typically with independent power/networking and connectivity to other AZs. A subnet belongs to one AZ, and a design must spread independent capacity across AZs to withstand an AZ failure.
- `Local Zone` — AWS infrastructure extension near a metropolitan area for workloads needing lower latency to local users or facilities. Service availability and networking differ from a full Region; it does not provide the same regional service set.
- `Wavelength Zone` — AWS infrastructure embedded in a telecommunications provider’s 5G network for ultra-low-latency mobile applications. Its topology, service support and carrier relationship are specialized; it is not a generic AZ to use without a latency case.
- `AWS Outposts` — AWS-managed infrastructure installed at a customer site for local data processing or low-latency/hybrid needs. The customer still operates local power, physical security and connectivity; services and capacity are limited to the chosen Outposts offering.
- `AWS global infrastructure` — The collection of Regions, AZs, edge locations and specialized deployments. “Global AWS” does not imply every resource, name, data set or configuration replicates globally.
- `Amazon Virtual Private Cloud (Amazon VPC)` — Logically isolated regional network with IP ranges, subnets, route tables and network controls. VPC design begins with non-overlapping CIDRs and required connectivity; overlapping ranges complicate peering, VPN and Transit Gateway routing.
- `VPC IPv4 CIDR block` — IPv4 address range assigned to a VPC, from which subnet ranges are allocated. Plan for growth, reserved addresses and connected networks; VPC CIDR expansion does not automatically update every route/firewall.
- `VPC IPv6 CIDR block` — IPv6 prefix assigned to a VPC and subdivided for IPv6 subnets. IPv6 connectivity/filtering differs from IPv4 NAT assumptions; security groups and NACLs must include the intended address family.
- `Default VPC` — AWS-created VPC in an account/Region with default subnets and internet access components. It is convenient for experimentation but usually lacks explicit production segmentation, address planning and governance.
- `VPC subnet` — AZ-scoped address range within a VPC with a route-table association. A subnet itself is not inherently public/private; that label is shorthand for its effective routing and exposure design.
- `Public subnet` — Subnet whose route table includes a route to an internet gateway. For an IPv4 workload to receive inbound internet traffic it also needs a public IPv4/EIP and permissive filters/listener; the route alone is insufficient.
- `Private subnet` — Subnet without a direct route to an internet gateway. It may still reach AWS services by endpoints, other VPCs via transit/peering, or the internet through NAT; “private” does not mean isolated.

### Routing, gateways and filters

- `VPC route table` — Ordered destination-prefix-to-target routes used by resources in associated subnets. Longest-prefix match determines the route; a route existing does not mean the destination or target is healthy/reachable.
- `Main route table` — VPC’s default route table for subnets without an explicit association. Production designs commonly associate subnets explicitly to make changes and traffic boundaries reviewable.
- `Subnet route-table association` — Binding that determines which route table a subnet uses. A subnet has one effective route table at a time; changing association can immediately change reachability.
- `Internet gateway (IGW)` — Horizontally scaled VPC gateway enabling internet routing for IPv4 and IPv6 when routes and addresses are configured. An IGW does not act as a stateful firewall or make a private address globally routable.
- `Egress-only internet gateway` — IPv6 gateway permitting outbound-initiated internet access while preventing the internet from initiating a connection back. It is IPv6-specific and is not the IPv4 NAT gateway.
- `NAT gateway` — Managed network address translation for private-subnet outbound IPv4 internet access. It does not accept unsolicited inbound sessions; availability, throughput and cross-AZ data-transfer costs make per-AZ placement and routes important.
- `NAT instance` — EC2 instance configured to perform network address translation, under customer responsibility for patching, scaling, failover, forwarding and security. It can support specialized designs but requires more operations than the managed NAT gateway.
- `Security group` — Stateful allow-list virtual firewall associated with ENIs or supported resources. Return traffic for an allowed flow is tracked; rules can reference other groups, but overly broad ingress still exposes the service.
- `Security group inbound rule` — Allow rule matching protocol/port and a source CIDR, prefix list or security group. Scope the source to the actual caller tier and remember the application must listen on the allowed port.
- `Security group outbound rule` — Allow rule matching protocol/port and a destination. Egress filtering matters for limiting exfiltration and dependencies; a permitted rule does not create a route.
- `Network access control list (network ACL)` — Stateless subnet-level allow/deny filter evaluated using numbered rules. It filters both directions, so response traffic and ephemeral port ranges must be permitted explicitly.
- `Network ACL numbered rule` — Ordered NACL rule with protocol, port range, source/destination and allow/deny action. The first matching rule wins; keep rule numbering intentional and inspect both subnet directions.
- `Elastic network interface (ENI)` — Virtual network interface with private addresses, security groups and attachment state. It is a useful unit for network identity and flow investigation; service-managed ENIs may have lifecycle constraints.
- `Elastic IP address` — Static public IPv4 address that can be associated with supported resources. It remains billable under current pricing rules even when not attached in some cases; avoid treating a static public address as a protection mechanism.
- `VPC peering connection` — Direct private routing between two VPCs. Peering is non-transitive: A-to-B and B-to-C do not automatically route A-to-C, and CIDRs must not overlap.
- `Transit Gateway` — Regional hub for connecting VPCs and on-premises networks through attachments and route tables. It simplifies many-to-many topology but requires route segmentation, propagation/association review and data-transfer cost awareness.
- `AWS Cloud WAN` — Managed global network service that centralizes policy and connectivity across Regions and on-premises environments. It operates on a global network/core-network model and is distinct from a single regional Transit Gateway; fit depends on topology and control needs.
- `VPC endpoint` — Private connectivity construct for reaching supported AWS services or endpoint services without using a public internet path. It does not automatically grant service authorization, and endpoint policy/DNS/route/security must be configured.
- `Gateway endpoint` — VPC endpoint type for supported services (notably S3 and DynamoDB) that installs routes in selected route tables. It does not create ENIs or use PrivateLink; endpoint policy and resource policy still apply.
- `Interface endpoint` — PrivateLink endpoint implemented using private IP network interfaces in selected subnets. Security groups must permit client traffic, DNS must resolve to the endpoint as intended, and endpoint hourly/data pricing applies.
- `AWS PrivateLink` — Private service connectivity model for consuming supported AWS or provider services through interface endpoints. It avoids exposing traffic through a public IP path but does not create broad VPC-to-VPC transitive routing.
- `VPC endpoint service` — Provider-side PrivateLink service exposed through supported load balancer types and permissions/acceptance settings. Provider and consumer each configure their side, and cross-account/Region availability is bounded by service support.

### DNS, edge, traffic entry and protection

- `Route 53 Resolver` — VPC DNS resolver plus inbound/outbound endpoint and forwarding-rule capabilities for hybrid DNS. Resolver endpoints and rules require network connectivity and DNS query paths; they do not replace public hosted-zone records.
- `Amazon Route 53 hosted zone` — Container for DNS records for a domain, public or private. A private hosted zone is associated with VPCs and answers within the configured DNS context; avoid conflicting zone names and records.
- `Route 53 routing policy` — DNS answer-selection behavior such as simple, weighted, latency, failover, geolocation/geoproximity or multivalue. DNS health/TTL caching means it is not instantaneous connection failover and does not proxy user traffic.
- `Route 53 health check` — Probe and/or calculated health signal used by supported routing policies and alarms. A successful check proves only the configured endpoint/path/threshold, not the complete service journey.
- `Amazon CloudFront distribution` — Global content-delivery resource that accepts viewer requests and caches/proxies content from configured origins. TLS, cache policy, origin access, WAF, invalidation and cache-key choices determine security and freshness.
- `CloudFront origin` — Backend from which a distribution retrieves content, such as an S3 bucket or HTTP service. Restrict origin access so clients cannot bypass CloudFront controls where the architecture requires that boundary.
- `CloudFront cache behavior` — Rule mapping path patterns to an origin and policies for caching, allowed methods, compression and viewer/origin protocols. An incorrect cache key can leak personalized data or serve stale content; choose headers, cookies and query strings deliberately.
- `AWS Global Accelerator` — Anycast static IP and AWS global network entry that routes TCP/UDP traffic to healthy regional endpoints. It is not a content cache or WAF; endpoint groups, health checks and data-transfer pricing must fit.
- `Elastic Load Balancing (ELB)` — Family of managed load balancers distributing traffic across targets and checking health. Select the ALB, NLB or GWLB based on protocol and target model; health checks and target registration are part of application availability.
- `Application Load Balancer (ALB)` — Layer 7 HTTP/HTTPS balancer with host/path/header routing, TLS termination and target groups. It is suitable for web/API routing but does not replace application authentication, WAF tuning or a global edge layer.
- `Network Load Balancer (NLB)` — Layer 4 TCP/UDP/TLS load balancer with high throughput and static-IP capabilities. Client IP preservation, target health, cross-zone behavior and TLS termination options depend on configuration.
- `Gateway Load Balancer (GWLB)` — Layer 3 gateway for transparently inserting and scaling virtual network appliances using GENEVE encapsulation. Appliance health/capacity and appliance-side policy determine inspection quality.
- `AWS WAF web ACL` — Set of managed/custom rules associated with supported CloudFront, ALB and other resources to inspect HTTP/S requests. WAF is application-layer protection; tune false positives and rate-based rules, and keep origin access controlled.
- `AWS Shield Standard` — Automatically included DDoS protection for supported AWS services, primarily addressing common network/transport attacks. It does not prevent all application abuse or remove the need for resilient capacity and WAF controls.
- `AWS Shield Advanced` — Paid enhanced DDoS protection with additional detection, response and cost-protection features subject to current terms/eligibility. It requires deliberate onboarding and response design; it is not an application security review.
- `AWS Network Firewall` — Managed stateful network firewall for VPC traffic inspection using firewall endpoints and rule groups. Route tables must steer traffic through it; bypass routes, asymmetric paths and throughput/capacity need testing.

### Visibility and hybrid connectivity

- `VPC Flow Logs` — Metadata records about accepted/rejected IP traffic for VPCs, subnets or ENIs, delivered to supported destinations. They do not capture packet payload or replace application logs; aggregation and delivery delay mean they are diagnostic evidence, not an inline firewall.
- `AWS Site-to-Site VPN` — IPsec tunnels between a VPC virtual private gateway/transit gateway and customer gateway. Redundant tunnels and routing must be configured; throughput, encryption, route propagation and failover need testing.
- `AWS Direct Connect` — Dedicated private network connection from customer locations to AWS through a provider. It is not inherently end-to-end encrypted; pair with VPN or application encryption when confidentiality requires it.
- `VPC Reachability Analyzer` — Configuration analysis that checks whether a supported source-to-destination path is possible through network resources. It is not packet simulation, live traffic, DNS validation or an application health test.

## Cross-item comparison

| Choice | Main role | Important limit |
|---|---|---|
| Internet gateway | VPC internet route | Address/filter/listener still needed |
| NAT gateway | Private IPv4 egress | No unsolicited inbound; per-AZ cost/design |
| Egress-only internet gateway | IPv6 egress-only | IPv6 path; no IPv4 translation |
| Gateway endpoint | Private S3/DynamoDB route | Supported services only; route table based |
| Interface endpoint/PrivateLink | Private service IP path | ENI, SG, DNS and endpoint policy required |
| Peering | Simple direct VPC-to-VPC | Non-transitive |
| Transit Gateway | Regional hub routing | Route-table complexity and transfer charges |
| Route 53 | DNS answer selection | TTL/cache; does not proxy connection |
| Global Accelerator | Static global network entry | Does not cache content |
| CloudFront | HTTP(S) edge/cache/origin proxy | Cache policy and origin access are critical |
| ALB/NLB/GWLB | L7 / L4 / appliance insertion | Different protocols and target semantics |

## Examples

### Trace a private IPv4 client to S3

A task in a private subnet resolves the S3 service name. If using a gateway endpoint, the subnet’s associated route table must contain the service-prefix-list route to that endpoint. The task role must allow the requested object action, the endpoint policy must permit the bucket/action, and the bucket policy must not deny it. If SSE-KMS is used, KMS must authorize decryption. Flow logs can help diagnose network flow but cannot show which S3 policy rejected the API request.

### Make an internet-facing web path

Route 53 answers the application name to CloudFront. A distribution’s cache behavior selects a protected ALB origin; the ALB listener terminates or forwards TLS and routes to healthy targets. WAF evaluates HTTP requests at an attached layer. A health check only marks targets healthy based on its path/port/threshold. Prevent direct origin access if all user traffic must pass through the edge. Verify DNS TTLs, origin certificate, cache key, forwarded headers and application authorization.

## Common mistakes

- Calling a subnet public without checking its associated route table, addresses and filters.
- Treating NAT as a firewall or enabling broad egress because the subnet is “private.”
- Assuming VPC peering is transitive or that a VPC endpoint grants IAM permission.
- Designing security groups but forgetting stateless NACL return ports.
- Using Route 53 health checks as if they instantly terminate or move existing TCP connections.
- Caching authenticated/personalized content without including the correct cache-key dimensions.
- Assuming Direct Connect encrypts traffic or that Network Firewall inspects traffic not routed through its endpoint.
- Treating Reachability Analyzer as a real application request.

## Knowledge checks with answers

1. **Does an IGW make a subnet public by itself?** No. The associated route table, public addressing, security filters and a listening resource must align.
2. **Can VPC A reach C through B using two peering connections?** Not through peering alone; VPC peering is non-transitive.
3. **Which is stateful: SG or NACL?** Security groups are stateful; network ACLs are stateless.
4. **What does an S3 gateway endpoint change?** It adds a private service route to selected subnet route tables; policies and application authorization still apply.
5. **How does Route 53 failover differ from Global Accelerator?** Route 53 returns DNS answers subject to TTL/client caching; Global Accelerator routes connections through static Anycast entry points.
6. **What does CloudFront cache behavior control?** Path-to-origin routing and request/cache policies such as methods and cache keys.
7. **What does VPC Reachability Analyzer prove?** A supported configuration path exists or identifies a blocking configuration element; it does not prove live application behavior.
