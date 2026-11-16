# modular monolith layered hexagonal clean architecture — Reference: Ports and adapters around an application core

Sources: [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture) and [Microsoft architectural principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles).

## Scope and version

This lesson explains the roles in Ports and Adapters architecture. It does not prescribe six layers or a project layout.

## How this group fits the mental model

The application core states what it needs through ports; adapters translate external technologies and actors to those contracts. This keeps the core’s policy from depending directly on transport or persistence details.

## Supplied names explained

### Hexagonal architecture

A boundary model that places an application core at the center and allows interaction through ports and adapters. “Hexagonal” illustrates multiple sides/entry points; it does not require six layers or interfaces.

### Ports and Adapters architecture

Another name for the model: ports define interaction protocols meaningful to the core, and adapters translate technologies/actors into those protocols. There can be multiple adapters for one port or multiple ports for different capabilities.

### Application core

The policy and use-case behavior that should remain independent of external technology details. It may include domain behavior and application orchestration according to the system’s needs. Keep framework objects from becoming implicit core dependencies.

### Primary (driving) actor

An actor that initiates application behavior, such as a user, scheduler, or external caller. It drives the core through an inbound port, directly or through an adapter.

### Secondary (driven) actor

An external capability the core needs, such as storage or a payment provider. The core calls an outbound port; an adapter connects that contract to the actual actor.

### Inbound port

A core-facing contract describing an operation an actor may request. It should express application intent, not mirror a transport controller signature or expose framework request objects.

### Outbound port

A core-owned contract for an external capability the application needs. It expresses the required behavior and result/error semantics. Infrastructure supplies an adapter implementation.

### Primary adapter

Translates a driving actor’s technology into an inbound port call, such as HTTP route/controller, CLI handler, or test driver. It maps transport data and results while keeping transport concerns at the edge.

### Secondary adapter

Implements an outbound port using a driven technology, such as a relational database or external API. It translates between provider-specific types and the core contract and handles integration failures.

### Technology-specific adapter

An adapter bound to a concrete framework/provider protocol. Isolate it so replacing a library or transport does not force core policy to change. Avoid abstracting every library call when no replacement seam or test benefit exists.

### Port protocol

The semantics of messages, operations, errors, ordering, and guarantees at a port. A method signature alone is not the full contract; callers need to understand idempotency, consistency, and failure behavior where relevant.

### Adapter translation

Mapping of input/output types, errors, transactions, and semantics between a technology and a port. Translation must preserve meaning; silently weakening a provider guarantee or dropping fields can create correctness/security defects.

## Cross-item comparison

Primary adapters translate requests entering the core; secondary adapters translate capability calls leaving it. Inbound ports are implemented by the core; outbound ports are implemented by adapters. Actors are external participants, not layers.

## Examples

An HTTP primary adapter maps `POST /orders` JSON to `PlaceOrder`. The core invokes an outbound `OrderStore` port. A SQL secondary adapter translates it to database operations. A test adapter can call the inbound port directly and provide an in-memory outbound implementation.

## Common mistakes

- Drawing six technical layers because of the “hexagonal” name.
- Letting an HTTP request DTO become the core contract.
- Making the core depend on database-specific exceptions.
- Treating test doubles as proof that every port is useful.
- Ignoring protocol semantics such as timeout, retry, and idempotency.

## Knowledge checks with answers

1. **Who owns an outbound port?** The application core that needs that capability.
2. **What does a primary adapter do?** Translate an initiating actor’s protocol to the core.
3. **What does a secondary adapter do?** Implement a core-owned capability using an external technology.

### Exact terms covered

- `Hexagonal architecture`
- `Ports and Adapters architecture`
- `Application core`
- `Primary (driving) actor`
- `Secondary (driven) actor`
- `Inbound port`
- `Outbound port`
- `Primary adapter`
- `Secondary adapter`
- `Technology-specific adapter`
- `Port protocol`
- `Adapter translation`

### Exact terms covered

- `Hexagonal architecture`
- `Ports and Adapters architecture`
- `Application core`
- `Primary (driving) actor`
- `Secondary (driven) actor`
- `Inbound port`
- `Outbound port`
- `Primary adapter`
- `Secondary adapter`
- `Technology-specific adapter`
- `Port protocol`
- `Adapter translation`
