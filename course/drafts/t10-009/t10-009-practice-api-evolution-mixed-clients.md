# architecture interviews tradeoffs requirements and constraints — Problem: Evolve an API used by old and new clients

Sources: [Azure API design and versioning](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/api-design), [Azure API design best practices](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)

## Goals

Practice contract compatibility, additive then removal sequence, capability detection, telemetry and deprecation under interview constraints.

## Worked example

A mobile client may remain installed for months while the backend must change a response and a required field. Propose a migration that avoids breaking deployed clients.

Prefer additive compatible changes: add optional response fields, tolerate unknown fields, and avoid changing existing meanings. If a required behavior is needed, introduce a new version or capability negotiation and migrate clients over a measured period. Observe old-client use before removing a contract.

## Exercises

1. Classify adding an optional response field, removing a field, changing a field's meaning, and making a previously optional request field required.
2. Plan a staged migration while some mobile clients remain installed for months.
3. What telemetry is needed before retiring the old contract, and how do you avoid collecting unnecessary personal data?
4. When is a new API version safer than an additive change?

## Progressive hints

1. Compatibility depends on how old clients parse and use the contract, not only on whether the server compiles.
2. Deploy tolerant server behavior before clients depend on new behavior.
3. Track client version/capability and endpoint/field use with suitable privacy controls.
4. A changed meaning or incompatible shape cannot be made safe by merely adding a field.

## Complete solutions

1. Adding a field is commonly compatible when clients tolerate unknown fields and the server tolerates omission from older requests. Removal, changed meaning, or newly required input can break clients; verify actual client behavior and contract rules.
2. Add the new field or endpoint without changing old semantics, deploy server support, release clients, observe adoption/errors, and keep the old path through the support window. Remove it only after usage, policy, and communication criteria are satisfied.
3. Measure supported client version/capability and contract usage, aggregate where possible, set retention/access controls, and avoid logging sensitive request payloads.
4. Version when the contract change cannot preserve old semantics or when independent migration is needed. Document support and retirement policy; parallel versions add testing and operational cost.

## Tests and edge cases

Run old and new client contract tests against each deployment stage. Test unknown response fields, omitted fields, null versus absent values, enum expansion, pagination defaults, retries, rollback during mixed versions, and a client that cannot be upgraded promptly.

## Reflection questions

What is the oldest client still in support, and what evidence permits removal?


Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?
