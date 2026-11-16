# DDD entities value objects aggregates and bounded contexts — Reference: Strategic domain modeling vocabulary and boundaries

Sources: [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf), [DDD Community terminology](https://www.dddcommunity.org/resources/ddd_terms/), and [Domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis).

## Scope and version

This lesson establishes DDD’s strategic vocabulary for domain scope, language, and model boundaries. It does not prescribe a deployment architecture.

## How this group fits the mental model

Strategic design decides which model is useful in which context and how teams collaborate across boundaries. Tactical entities and aggregates then encode rules inside a chosen context.

## Supplied names explained

### Domain

The subject area and business activity the software supports. A domain is broader than one application or database schema.

### Core Domain

The part of the domain that provides the organization’s distinctive capability or competitive value. It deserves focused expert collaboration and deliberate design effort.

### Subdomain

A coherent portion of the overall domain with related concerns and rules. Subdomains help teams split discovery and responsibility; they do not automatically prescribe services.

### Core subdomain

A subdomain that contains the differentiating business capability. It merits investment in a carefully modeled solution rather than relying on generic packages alone.

### Supporting subdomain

A subdomain that supports the core business but is not itself the differentiator. A fit-for-purpose solution may be enough; avoid overengineering it to the same depth as core policy.

### Generic subdomain

A problem common across many businesses, such as commodity capabilities. It may be solved with an established product or general technique if its behavior fits the requirements.

### Ubiquitous language

Shared, precise language used by domain experts and developers in a bounded context, reflected in conversations, code, and tests. It is context-specific; reuse of a word elsewhere does not imply identical meaning.

### Bounded Context

A boundary within which one model and its language remain internally consistent. Contexts may align with teams or modules and may be implemented in a monolith or services. The boundary is semantic and organizational, not automatically a deployment boundary.

### Context Map

A view of relationships, dependencies, and integration between bounded contexts. It helps expose upstream/downstream influence, translation, and collaboration expectations. It is a communication model, not a mandatory topology diagram.

### Domain model

A selected conceptual model of domain knowledge and behavior used to solve a problem. It is not necessarily a complete mirror of the real world or a database schema.

### Model-Driven Design

An approach where the model informs implementation and the implementation remains faithful enough to support ongoing learning. Model and code evolve through collaboration rather than documentation being frozen separately.

### Strategic design

Work on domain scope, subdomains, bounded contexts, teams, and context relationships. It decides where language/models differ before selecting tactical patterns.

### Tactical design

Patterns and modeling decisions used within a bounded context, such as entities, value objects, aggregates, and domain services. Tactical patterns do not replace strategic boundary choices.

### Continuous Integration of a domain model

Frequent integration of model and implementation changes among collaborators so one team’s code does not drift from the shared model. This includes communication, tests, and resolving language/model conflicts; it is not just a CI server running builds.

## Cross-item comparison

Core, supporting, and generic subdomains differ in strategic value, not necessarily code size. A bounded context defines one model’s meaning; a subdomain identifies a problem-area division. They may align but are not identical concepts.

## Examples

“Customer” can mean a marketing lead in one context and an invoiced legal party in another. A Context Map records how marketing’s lead information becomes a billing customer without forcing both contexts to share one oversized Customer class.

## Common mistakes

- Equating subdomains, bounded contexts, repositories, teams, and services one-to-one.
- Treating ubiquitous language as a universal company-wide vocabulary.
- Modeling every real-world detail instead of the model needed for a problem.
- Treating continuous integration as only automated compilation.

## Knowledge checks with answers

1. **What defines a bounded context?** A consistent model/language boundary.
2. **Is a core subdomain a service?** Not necessarily; deployment is a separate decision.
3. **Why can the same word differ across contexts?** Each model serves different policies and workflows.

### Exact terms covered

- `Domain`
- `Core Domain`
- `Subdomain`
- `Core subdomain`
- `Supporting subdomain`
- `Generic subdomain`
- `Ubiquitous language`
- `Bounded Context`
- `Context Map`
- `Domain model`
- `Model-Driven Design`
- `Strategic design`
- `Tactical design`
- `Continuous Integration of a domain model`

### Exact terms covered

- `Domain`
- `Core Domain`
- `Subdomain`
- `Core subdomain`
- `Supporting subdomain`
- `Generic subdomain`
- `Ubiquitous language`
- `Bounded Context`
- `Context Map`
- `Domain model`
- `Model-Driven Design`
- `Strategic design`
- `Tactical design`
- `Continuous Integration of a domain model`
