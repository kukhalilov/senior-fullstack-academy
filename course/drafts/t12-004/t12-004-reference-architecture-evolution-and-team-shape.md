# architecture patterns multi-region tenancy and reliability — Reference: Architecture evolution, teams, and execution models

Sources: [HLD Handbook](https://hld.handbook.academy/), [CNCF serverless glossary](https://glossary.cncf.io/serverless/), [CNCF Function-as-a-Service glossary](https://glossary.cncf.io/function-as-a-service/), [Team Topologies interaction modeling](https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies), [CNCF platform engineering glossary](https://tag-app-delivery.cncf.io/wgs/platforms/glossary/), [CNCF Platforms White Paper](https://tag-app-delivery.cncf.io/whitepapers/platforms/), [CNCF platform engineering maturity model](https://tag-app-delivery.cncf.io/whitepapers/platform-eng-maturity-model/), [Local-First Software research paper](https://martin.kleppmann.com/papers/local-first.pdf), [Microsoft architecture styles](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/), [Melvin Conway original essay reference](https://www.melconway.com/Home/pdf/committees.pdf).

## Scope and version

This lesson covers organizational and execution-model concepts, not a prescription for one org chart or a particular cloud. Serverless and Function as a Service (FaaS) are related but not identical terms. Platform design should begin with internal user needs and be measured as a product. Local-first principles describe goals and trade-offs, not a particular database or mandatory CRDT implementation. Conway’s Law is a useful sociotechnical observation; it does not say an org chart mechanically determines every component boundary.

## How this group fits the mental model

Architecture changes when the product, workload, risk, or team boundaries change. The code boundary and the people boundary interact: a service that requires constant coordination across teams is not independent in practice. Serverless changes who manages infrastructure; it does not remove the need to operate the application. Platform engineering can reduce repeated setup, while local-first design changes where user data and collaboration state live.

Start with friction and evidence: slow releases, unclear ownership, repeated security mistakes, high cognitive load, or unreliable offline behavior. Change one boundary or platform capability at a time, measure the result for its users, and keep a rollback path. Organizational reorganization without changed interfaces, responsibilities, or decision paths rarely fixes architectural coupling by itself.

## Supplied names explained

- **Conway's Law** — Organizations tend to produce systems whose structures reflect their communication structures. A team split that requires frequent handoffs can appear as component coupling, while teams with clear end-to-end ownership can support more cohesive boundaries. Use the observation to ask whether architecture, APIs, and team interaction modes reinforce the desired change flow; treat it as a lens, not a universal causal law.
- **Team topology (Team Topologies)** — A model for discussing stable team boundaries, cognitive load, and interaction modes. Its four fundamental types are stream-aligned, platform, enabling, and complicated-subsystem teams. Stream-aligned teams own a flow of business change; platform teams provide capabilities as a product; enabling teams help other teams acquire missing skills without taking permanent ownership of their software; complicated-subsystem teams own a genuinely specialist area. Interaction can be collaboration, X-as-a-Service, or facilitating. These are design vocabulary for evolving teams, not mandatory titles or a guaranteed optimal org chart.
- **Serverless computing** — A model in which the provider operates server provisioning, capacity, and much of the runtime infrastructure; customers deploy code or services through managed interfaces and commonly pay by usage. “Serverless” does not mean there are no servers, no operations, or always lower cost. Customers still own application correctness, IAM, data, observability, capacity limits, vendor dependencies, and incident response. The umbrella includes managed services broader than FaaS.
- **Function as a service (FaaS)** — A serverless execution style where a function or handler is invoked by an HTTP request, event, or message and the provider manages its execution instances. Cold starts, duration/concurrency limits, event delivery semantics, retries, state externalization, deployment versioning, and observability vary by platform. FaaS is a subset/use case within serverless, not a synonym for every serverless database, queue, or SaaS product.
- **Local-first software** — Software that keeps a capable local copy under user control while still supporting collaboration and access across devices. Its goals include offline use, data ownership, privacy, resilience to service interruption, and long-term access. Synchronization must reconcile concurrent changes, deletes, permissions, schema evolution, and device loss. CRDTs can make some concurrent operations converge, but they do not define product conflict semantics, authorization, encryption, backup, or all data types.
- **Platform engineering** — The design, construction, operation, and evolution of an internal platform for developer/operator users. A platform packages capabilities, tools, documentation, APIs, and safe defaults as a product. Good platform work reduces repetitive toil and cognitive load without hiding controls users need. It has users, adoption, support, reliability, security, and a backlog; a team does not become platform engineering merely by operating Kubernetes for others.
- **Internal developer platform (IDP)** — An organization’s integrated set of self-service capabilities through which internal teams acquire and use their supported software delivery and operational services. It may combine templates, APIs, CLIs, policy, workflows, and service catalog/portal interfaces. The IDP is broader than a developer portal: a portal is one possible user interface, not the platform itself. Adopt the thinnest platform layer that makes common tasks safer and easier; overbuilding a universal abstraction can create another bottleneck.

## Cross-item comparison

| Design pressure | Useful concept | What it does not solve automatically |
|---|---|---|
| Team handoffs mirror brittle software seams | Conway’s Law plus explicit team interaction design | Does not prove that every team boundary should become a service |
| Teams repeatedly build the same foundations | Platform engineering and an IDP | Does not justify a platform team without real internal customers and adoption |
| Avoid managing servers for variable or event-driven work | Serverless computing | Does not remove application operations, cost analysis, state, or failure ownership |
| Run a short event/request handler on managed compute | FaaS | Does not guarantee exactly-once delivery, no cold starts, or durable local memory |
| Users need work to continue without a network | Local-first software | Does not make conflict resolution, sync security, or cross-device recovery trivial |
| Reduce cognitive load while keeping product delivery with teams | Team Topologies vocabulary | Does not prescribe fixed team sizes or create autonomy without usable interfaces |

Serverless versus container hosting is a workload decision. FaaS can be convenient for bursty, event-driven work where the platform’s event integrations and scale-to-zero economics fit. Containers or long-running services can be a better fit for steady utilization, sustained connections, specialized processes, predictable warm capacity, or when a team needs more runtime control. Compare total cost at actual load, cold-start latency, limits, retries, observability, networking, and operational expertise—not only the advertised unit price.

## Examples

**Conway-aware extraction:** a product team owns checkout end to end but repeatedly waits on a shared customer-data team for a small schema change. First map the decision and deployment dependencies. A stable API and clear ownership for customer profile data may remove the handoff without making checkout a separate microservice. If the data boundary later needs independent scaling or privacy controls, extract it with an explicit contract and an on-call path. Reorganization, API design, and migration should reinforce one another.

**Small platform as product:** several teams independently configure deployment pipelines and make the same security mistakes. Interview those teams, identify one common workflow, and offer a self-service template/API that includes identity, policy checks, observability, and a tested deployment path. Document the supported escape hatch. Measure time-to-first-deploy, failed deployments, security exceptions, adoption, and platform availability. Retire the capability if it adds more friction than it removes.

**Offline-first React app:** a field worker edits a record while disconnected. The client persists a local operation and clearly labels it as pending synchronization. When connectivity returns, the app authenticates, checks whether the user still has permission, submits changes with stable operation IDs, and reconciles server conflicts. The UI distinguishes local saved state from server-accepted state. A local copy improves availability but must be protected on-device and handled during logout, revocation, backup, and account deletion.

**FaaS versus a continuously busy worker:** a sporadic image-thumbnail job may fit an event function with external durable storage and idempotent retries. A 24/7 consumer with sustained throughput, long-lived connections, and tight per-message latency may cost less and be easier to tune as a worker service. Benchmark realistic traffic and include queue cost, idle capacity, downstream constraints, and operational ownership.

## Common mistakes

- Treating Conway’s Law as proof that team boundaries must match every deployable unit or assuming a reorganization alone will decouple a system.
- Using Team Topologies types as boxes to fill rather than clarifying ownership, cognitive load, and desired interactions.
- Calling any cloud-managed capability “serverless” and assuming it removes production responsibility.
- Choosing FaaS without idempotency, durable state, bounded retries, poison-event handling, and visibility into invocation failures.
- Comparing FaaS and containers only by per-request price while ignoring steady load, cold starts, limits, networking, and engineering time.
- Building an IDP as a mandatory portal with many abstractions before identifying user pain, supported paths, and service ownership.
- Measuring a platform only by usage or number of features instead of internal user outcomes, reliability, lead time, and support cost.
- Calling local-first software merely “offline cache”; a cache can be disposable and server-authoritative, while local-first design requires durable local ownership and deliberate synchronization.
- Assuming CRDT convergence determines the right business result or that offline edits remain authorized forever.

## Knowledge checks with answers

1. **What does Conway’s Law suggest when one feature requires several teams to coordinate?** The architecture may reflect those communication boundaries. Check whether ownership and interfaces can be changed; do not infer that a new microservice is automatically the answer.
2. **How are serverless and FaaS related?** FaaS is one serverless execution style. Serverless also includes managed capabilities such as databases, queues, and storage.
3. **What is the difference between an IDP and a developer portal?** An IDP is the integrated platform capabilities and workflows; a portal can be one interface for discovering or invoking them.
4. **What must a platform team validate before expanding a platform?** A real internal need, a safe and supported self-service capability, user adoption and outcome evidence, reliability/security ownership, and an escape or migration path.
5. **Why is a local-first app more than a cache?** Local data must remain useful and user-controlled while offline, then synchronize and resolve conflicts safely across devices and permissions.
6. **When may a container worker be a better fit than FaaS?** For sustained or long-lived work, specialized processes, predictable warm capacity, or finer runtime control, if the measured total cost and operational burden support it.
