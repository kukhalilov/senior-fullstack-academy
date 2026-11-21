# system design requirements estimation capacity and tradeoffs — Reference: Demand shape, resource estimates, and capacity headroom

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework) and [Google SRE: Service Best Practices](https://sre.google/sre-book/service-best-practices/).

## Scope and version

Capacity is estimated from workload, measured resource use, redundancy, and uncertainty. This lesson avoids provider-specific SKU sizing.

## How this group fits the mental model

Convert demand into resource requirements, test peak/failure scenarios, preserve headroom, then revise the model using actual workload measurements.

## Supplied names explained

### Request arrival rate

The number of incoming operations per unit time. Define which operations count and where they are measured.

### Average request rate

Mean arrivals across a chosen interval. It is useful for baseline cost but can hide rush periods and bursts.

### Peak request rate

The maximum or high-percentile rate during a specified period. Define interval length; a one-second spike differs from an hour-long peak.

### Burst traffic

A short concentrated surge that can overwhelm buffers or autoscaling even when average demand is low. Test burst shape and duration, not just steady throughput.

### Concurrency

The number of in-flight operations at once. It depends on arrival rate and service time; long waits can increase concurrency and exhaust connections even at moderate throughput.

### Read-to-write ratio

The relative volume of read and mutation operations. Different paths may stress CPU, indexes, locks, or storage differently and can inform separate read scaling/projections.

### Request and response payload size

Bytes transferred per operation. Payload affects network, memory, serialization, and storage costs; use realistic distributions, not only averages.

### Data growth rate

The rate durable data expands, influenced by write volume and record/index size. Include replicas, backups, and derived data where calculating storage.

### Retention period

How long data is kept. It shapes storage cost, query size, archive needs, deletion policy, and compliance obligations.

### Resource-to-capacity ratio

How much of a resource’s available capacity is consumed at a given workload. Identify bottleneck resources and avoid planning sustained operation near saturation when variance or failure can exceed limits.

### Capacity forecast

A model projecting needed resources at current and future demand. Record assumptions, resource profiles, growth, reliability reserve, and uncertainty range.

### Load test

Exercises a system under representative traffic to measure throughput, latency, resource saturation, and failures. Validate realistic data, dependency behavior, and ramp/burst patterns; a load test is not automatically a production guarantee.

### Capacity headroom

Unused capacity reserved for variability, failover, growth, or deployment. Set based on workload variance and recovery requirements; too little risks saturation, too much wastes cost.

### N+1 redundancy

Capacity sufficient to meet the required load after losing one failure unit (such as node/zone, depending on the model). State what “N” is and whether failure domains are independent.

### N+2 redundancy

Capacity sufficient after two such failures. It costs more and may be required for higher risk/tolerance; it does not protect against shared dependencies or correlated failures unless designed for them.

### Day-one versus steady-state demand

Initial adoption and mature demand can differ. Avoid provisioning the full speculative future fleet day one; also ensure growth and migration paths are tested.

### Forecast validation

Compare predicted resource use and growth with load-test and production data. Update model assumptions when real utilization, seasonality, or request mix differs.

## Cross-item comparison

Average load informs baseline, peak and burst shape resilience, and concurrency drives in-flight resource use. N+1/N+2 describe failure capacity only relative to explicit failure units and independence assumptions.

## Examples

At 100 requests/s and 0.2 s average service time, a rough steady-state estimate is about 20 in-flight requests (Little’s Law under stable assumptions). A four-times burst and slower downstream dependency increase concurrency; measure tail service time and connection use rather than relying on this simple estimate alone.

## Common mistakes

- Sizing only from average requests/s.
- Ignoring payload, data retention, index/replica, and backup growth.
- Treating autoscaling as instantaneous.
- Calling N+1 safe without defining failure domains.
- Confusing forecast precision with certainty.

## Knowledge checks with answers

1. **Why model bursts separately?** Short surges can exceed buffers/autoscaling limits despite modest averages.
2. **What does N+1 mean?** Meet target after one defined failure unit is lost.
3. **How improve forecast quality?** Validate model against realistic load tests and production measurements.

### Exact terms covered

- `Request arrival rate`
- `Average request rate`
- `Peak request rate`
- `Burst traffic`
- `Concurrency`
- `Read-to-write ratio`
- `Request and response payload size`
- `Data growth rate`
- `Retention period`
- `Resource-to-capacity ratio`
- `Capacity forecast`
- `Load test`
- `Capacity headroom`
- `N+1 redundancy`
- `N+2 redundancy`
- `Day-one versus steady-state demand`
- `Forecast validation`

### Exact terms covered

- `Request arrival rate`
- `Average request rate`
- `Peak request rate`
- `Burst traffic`
- `Concurrency`
- `Read-to-write ratio`
- `Request and response payload size`
- `Data growth rate`
- `Retention period`
- `Resource-to-capacity ratio`
- `Capacity forecast`
- `Load test`
- `Capacity headroom`
- `N+1 redundancy`
- `N+2 redundancy`
- `Day-one versus steady-state demand`
- `Forecast validation`
