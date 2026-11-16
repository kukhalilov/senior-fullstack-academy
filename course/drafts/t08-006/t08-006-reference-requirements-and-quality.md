# system design requirements estimation capacity and tradeoffs — Reference: System purpose, constraints, and measurable quality objectives

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [Well-Architected pillars](https://learn.microsoft.com/en-us/azure/well-architected/pillars), and [Google SRE: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/).

## Scope and version

This group turns business purpose and constraints into measurable system objectives across relevant quality attributes.

## How this group fits the mental model

Architecture choices are only meaningful relative to a use case, workload, and acceptance threshold. Define the system boundary and what the user observes before comparing technologies.

## Supplied names explained

### Business outcome

The measurable result the organization/user wants, such as completing a booking reliably. It anchors which behaviors and quality targets matter.

### Functional requirement

Behavior the system must provide: inputs, outputs, decisions, and state changes. Write it so it can be demonstrated or tested.

### Nonfunctional requirement

A quality or constraint on system behavior, such as latency, security, availability, maintainability, or cost. Convert it into measurable criteria when possible.

### Constraint

A limit that narrows solution choices: legal rules, existing systems, platform requirements, deadlines, budget, or team skills. Record whether it is fixed or negotiable.

### Stakeholder and actor

A stakeholder has an interest in system outcomes; an actor interacts with the system or influences its behavior. Their goals and risk tolerances may differ, so surface conflicts early.

### Use case

A goal-directed interaction or workflow. It supplies the workload context and the point at which success/failure should be measured.

### Workload assumption

A stated estimate of request rate, payload, concurrency, data volume, or usage pattern. Mark source and confidence; validate with analytics/load tests.

### Quality attribute

A characteristic such as reliability, security, cost efficiency, operational excellence, performance, or sustainability that constrains architecture.

### Reliability

The ability to deliver intended behavior under stated conditions and recover from faults. Define user-visible success and failure, not only component uptime.

### Security

Protection of confidentiality, integrity, availability, and authorized use across system assets. Include threat model and verification criteria, not merely a security product choice.

### Cost optimization

Meeting system needs at justified lifecycle cost. Include compute, data, licenses, operations, engineering time, and failure consequences.

### Operational excellence

Ability to deploy, observe, diagnose, recover, and improve the workload safely. Measure operational procedures and ownership as design requirements.

### Performance efficiency

Using resources effectively to meet performance and scale goals. Define workload, percentile, and measurement boundary; avoid optimizing an unmeasured metric.

### Sustainability consideration

Consider resource efficiency and environmental impact alongside workload needs. Avoid excess capacity and unnecessary data/compute, without compromising required resilience or service quality.

### Acceptance criterion

A condition that demonstrates a requirement is satisfied, with method and context. “Fast” is not an acceptance criterion; “p95 under target for the defined journey at forecast peak load” is closer.

### Measurable quality target

A threshold tied to a metric, population, boundary, and window, such as successful checkout percentage over 30 days. State exclusions and measurement source.

## Cross-item comparison

Functional requirements describe what behavior exists; quality objectives describe how well it must work under conditions. Constraints limit solution options, while acceptance criteria determine how stakeholders verify the outcome.

## Examples

“Users can reserve a seat” is a functional requirement. “At forecast peak, 99.9% of reservation attempts complete successfully over a rolling month, excluding client cancellations” is a measurable quality objective whose boundary and error definition still need agreement.

## Common mistakes

- Treating “scalable” as a measurable target.
- Setting a quality target without defining workload or observation point.
- Ignoring operator and security stakeholders.
- Confusing a solution choice with a requirement.

## Knowledge checks with answers

1. **What anchors architecture?** Business outcome, actors, and measurable acceptance criteria.
2. **What makes an assumption useful?** It includes value, source/confidence, and validation plan.
3. **Why include operational excellence?** The system must be deployed, observed, recovered, and improved.

### Exact terms covered

- `Business outcome`
- `Functional requirement`
- `Nonfunctional requirement`
- `Constraint`
- `Stakeholder and actor`
- `Use case`
- `Workload assumption`
- `Quality attribute`
- `Reliability`
- `Security`
- `Cost optimization`
- `Operational excellence`
- `Performance efficiency`
- `Sustainability consideration`
- `Acceptance criterion`
- `Measurable quality target`

### Exact terms covered

- `Business outcome`
- `Functional requirement`
- `Nonfunctional requirement`
- `Constraint`
- `Stakeholder and actor`
- `Use case`
- `Workload assumption`
- `Quality attribute`
- `Reliability`
- `Security`
- `Cost optimization`
- `Operational excellence`
- `Performance efficiency`
- `Sustainability consideration`
- `Acceptance criterion`
- `Measurable quality target`
