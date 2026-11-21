# architecture patterns multi-region tenancy and reliability — Reference: AWS Shield

Sources: [AWS Shield and Shield Advanced overview](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-overview.html), [Shield Standard](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-standard-summary.html), [Shield Advanced capabilities](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-advanced-summary-capabilities.html), [getting started/configuration](https://docs.aws.amazon.com/waf/latest/developerguide/getting-started-ddos.html), [SRT support](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-srt-support.html), [application-layer mitigation](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-advanced.html), [cost protection eligibility](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-request-service-credit.html), [AWS DDoS resiliency guidance](https://docs.aws.amazon.com/whitepapers/latest/aws-best-practices-ddos-resiliency/welcome.html).

## Scope and version

This lesson covers AWS Shield Standard and Shield Advanced as documented on 2026-11-20. Shield is AWS-managed DDoS protection for supported AWS resource perimeters; covered resources and features depend on service, Region, and configuration. Check current docs for supported resource types, charges, and commitments. Shield is not a substitute for application capacity planning, secure design, WAF tuning, or incident response.

## How this group fits the mental model

A distributed denial-of-service attack overwhelms a service or its dependencies with traffic or expensive requests. Protection has several layers: absorb/filter traffic near the edge, constrain abusive request patterns, keep backends from exhausting connections/compute, and preserve a safe degraded mode. Shield supplies managed detection/mitigation at the AWS perimeter. Your architecture determines whether legitimate users can still complete useful work under attack.

## Supplied names explained

- **AWS Shield Standard:** automatically included for AWS customers at no additional Shield charge. It helps protect against common, frequently occurring network/transport-layer (L3/L4) attacks; AWS documents particular availability protection for Route 53, CloudFront, and Global Accelerator standard accelerators.
- **AWS Shield Advanced:** separately subscribed enhanced DDoS service for protected resources. Capabilities include expanded L3/L4/L7 protections, attack visibility, optional automatic application-layer mitigation with AWS WAF, access to the Shield Response Team under applicable AWS Support arrangements, and eligibility for certain attack-related cost protections.
- **Protected resource:** an eligible resource explicitly associated with Shield Advanced protection. Merely subscribing the account does not protect each resource.
- **AWS WAF:** evaluates HTTP(S) requests and applies web ACL rules such as allow/block/count, rate-based rules, and managed rule groups. WAF is especially relevant for application-layer traffic; it does not replace volumetric infrastructure defenses.
- **Shield Response Team (SRT):** DDoS response experts who can help analyze activity and, with prior authorization and the required support plan, assist with mitigations such as WAF changes.
- **Health-based detection / attack visibility:** monitoring signals help identify events affecting protected resources. They require configured health checks, alarms, notifications, and operational responders.
- **Cost protection/service credits:** conditional mechanisms for certain eligible increased charges during qualifying attacks. They have prerequisites and claim windows; they are not a general guarantee that every attack-related AWS bill is capped.

## Choosing Standard, Advanced, WAF, and architecture controls

Start with the application perimeter and threat model:

1. Put internet-facing applications behind an appropriate edge/load-balancing design. CloudFront, Route 53, Global Accelerator, ALB/NLB, EC2, and API Gateway have different protection and origin exposure characteristics.
2. Use Shield Standard as the baseline managed protection; it is automatic, but do not infer that all application-level traffic is safe or that backend capacity is unlimited.
3. Add AWS WAF rules for HTTP request patterns: rate limits, known abuse signatures, bot controls where justified, request-size and path constraints, and managed rules. Start in count/log mode when tuning, then block with tested exceptions to avoid blocking legitimate customers.
4. Consider Shield Advanced for eligible high-visibility or frequently attacked resources when expanded mitigation, event visibility, SRT access, and qualifying cost-protection features justify the subscription and configuration burden.
5. Explicitly add each resource to protection and configure application-layer rules/automatic mitigation, health checks, alarms, SNS notifications, contacts, and SRT authorization before an incident.
6. Protect origins from direct access that bypasses the selected edge/WAF path; authenticate internal origin requests and restrict network paths where feasible.
7. Build application resilience: caching, quotas, per-tenant fairness, bounded expensive queries, queues/backpressure, autoscaling limits, circuit breakers, and graceful degradation.

## Example: React storefront and .NET API

Serve the React bundle through CloudFront and route API requests through a protected API/ALB path with WAF. Use cache policies for static assets and safe public GETs; do not cache user-specific responses without correct keying. Rate-limit expensive search/login endpoints with rules aligned to legitimate traffic. Keep the origin inaccessible except through the approved route, and apply application-level quotas by tenant/account so a single client cannot consume all database capacity.

During an event, dashboards correlate Shield detections, WAF sampled requests, CloudFront/ALB/API metrics, database queue/latency, and application error rates. Operations distinguishes traffic volume from valid-looking L7 request floods, scales within budget limits, enables a rehearsed mitigation, and communicates user-visible degradation. Shield telemetry does not replace service-level SLO monitoring.

## Cost and operational boundaries

Shield Advanced is a subscription with additional rules, protected-resource configuration, and terms that can change. AWS documents some standard WAF charges covered for protected resources and specific usage/cost-credit conditions; nonstandard WAF features and unprotected resources can still incur charges. Verify current pricing before design approval. Cost protection requires resources to be protected before the attack and other stated conditions; some credit requests have a defined post-billing time window. Treat it as conditional relief, not a budget strategy.

SRT support is not an automatic hands-off mitigation for every account. Configure proactive engagement and authorization in advance, ensure your AWS Support plan meets requirements, and maintain your own incident command and application knowledge.

## Cross-item comparison

- **Shield Standard vs Advanced:** baseline automatic managed protection vs subscribed expanded detection/mitigation/support for explicitly protected resources.
- **Shield vs WAF:** Shield addresses DDoS across infrastructure and application layers; WAF applies HTTP request rules. They complement each other.
- **Edge DDoS mitigation vs application throttling:** edge filters reduce attack traffic; application quotas and workload isolation protect expensive business operations and tenants.
- **Managed mitigation vs resilience engineering:** Shield reduces selected attack effects, while caching, capacity, queueing, graceful degradation, and tested response determine service survival.

## Common mistakes

- Assuming an Advanced account subscription automatically protects every resource.
- Assuming Shield Standard blocks every L7 flood or protects an exposed origin that bypasses the intended edge.
- Confusing WAF rule configuration with volumetric DDoS protection.
- Enabling automatic L7 mitigation without a baseline, health signal, or alert workflow.
- Expecting SRT to act without required support, authorization, and pre-incident configuration.
- Treating cost protection as an unconditional bill cap.
- Scaling without quotas, budget alarms, and overload protection, allowing attack traffic to create runaway costs.
- Testing rules only against attack traffic and accidentally blocking legitimate customers.

## Knowledge checks with answers

1. **Does Shield Advanced subscription automatically protect each resource?** No. Add eligible resources to protection and configure the associated features.
2. **What is the main distinction between Shield and WAF?** Shield provides managed DDoS defense; WAF evaluates HTTP(S) requests using web ACL rules.
3. **Does Shield Standard mean an application cannot be overwhelmed?** No. Application architecture, L7 controls, dependency capacity, and operational response still matter.
4. **Can cost protection be assumed for any attack?** No. It is conditional on eligible resources, prior configuration, charge categories, and claim requirements.
5. **When should Advanced be configured?** Before the attack, including resource protection, WAF/health/alarms, contacts, and any SRT permissions.

## Examples

A request flood targets a costly search endpoint. Shield detects and mitigates supported DDoS traffic, WAF applies a tuned rate rule, and the API enforces per-tenant query budgets. The database remains within capacity and the UI degrades to cached popular results. This is layered protection; no single layer has to identify every malicious request.

## Practice exercise

Map a public .NET API’s traffic path from DNS to origin. Decide which AWS resources receive Standard or Advanced protection, where WAF runs, how direct-origin bypass is prevented, which operations are rate-limited, what health signals trigger action, and how the service degrades without exceeding its cost budget.
