# end-to-end system design case studies — Reference: Bipartite matching for dispatch

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google OR-Tools assignment problem](https://developers.google.com/optimization/assignment), [Google OR-Tools minimum-cost flow](https://developers.google.com/optimization/flow/mincostflow), [Google OR-Tools CP-SAT](https://developers.google.com/optimization/cp/cp_solver).

## Scope and version

This case study models assigning simultaneous ride requests to available drivers or vehicles. It introduces bipartite matching and assignment optimization; real dispatch adds time, geography, fairness, capacity, and changing state. Solver choice and API details vary by library/version, so benchmark representative workloads and verify constraints against current solver documentation.

## How this group fits the mental model

Create two sets: requests on one side and available drivers on the other. Add an edge when a driver can feasibly serve a request. Give each edge a cost representing estimated pickup time, distance, service quality, or a weighted business objective. The assignment problem chooses compatible pairs while respecting constraints, such as one request and one driver per match. This is a mathematical model for a dispatch batch; it does not itself keep the data fresh or guarantee a real driver remains available.

The system must decide the batch horizon. A very short batch reduces rider wait but can make locally optimal matches that are globally poor. Waiting briefly can improve the set of choices, but increases delay and risks using stale availability. Exact optimization over a huge changing graph may be too slow; practical dispatch systems often partition geographically and re-optimize frequently.

## Supplied names explained

- **Bipartite graph:** vertices are divided into requests and drivers; edges only connect a request to a feasible driver.
- **Matching:** a set of edges where no request or driver appears more than once.
- **Maximum-cardinality matching:** serves the largest number of requests, regardless of edge cost, subject to feasibility.
- **Minimum-cost assignment:** chooses a feasible assignment minimizing total edge cost, often with dummy/unassigned options and penalties to represent unmatched requests.
- **Minimum-cost flow:** a broader network optimization model that can represent capacities and flow through network nodes; useful when the problem exceeds simple one-to-one assignment.
- **Constraints/objective:** hard constraints define what must never happen; soft preferences are encoded in an objective or penalties. Weight magnitudes must be chosen so one preference does not accidentally dominate a more important objective.
- **Receding-horizon dispatch:** repeatedly solve for current and near-future work, execute only the first decisions, then recompute as new requests/driver states arrive.

## Cross-item comparison

| Approach | When it fits | Caveats |
| --- | --- | --- |
| Greedy nearest-driver | Simple baseline, small batches, low latency | Can consume a scarce driver for a request with few alternatives and produce poor total assignment |
| Maximum matching | Maximize number of feasible requests served | Ignores quality/cost unless weighted; many matchings may tie |
| Minimum-cost assignment | Balance service count and travel/quality cost | Requires a careful cost model and explicit handling of unassigned requests, fairness, and priorities |
| Min-cost flow / CP-SAT / MIP | Capacities, quotas, multiple constraints, richer objectives | More expressive but solver complexity, runtime, infeasibility diagnosis, and tuning increase |
| Rolling local heuristic | High update rate and large changing demand | May be suboptimal globally; must measure service outcomes and avoid unfair systematic bias |

## Examples

There are two riders `R1`, `R2` and two drivers `D1`, `D2`. All pairings are feasible except `R2-D1`. Pickup-time costs are `R1-D1=2`, `R1-D2=4`, `R2-D2=3`. A greedy rule that gives `D2` to the first request `R1` at cost 4 leaves `R2` unmatched. The minimum-cost maximum-cardinality matching assigns `R1-D1` and `R2-D2`, serving both with total cost 5. This shows why choices should account for constrained alternatives, not just the current request’s nearest driver.

In production, compute candidate edges using fresh locations, vehicle capacity, service area, accessibility requirements, driver shifts, and safety rules. Solve a bounded batch (perhaps by geographic cell with spillover) under a strict time budget. Before committing assignments, atomically claim each driver and request using version checks/leases so concurrent dispatchers cannot assign the same driver twice. If the claim loses a race or the driver becomes unavailable, remove that edge and re-solve or run a safe fallback. Re-optimize only when the benefit exceeds the disruption and fairness costs of changing an existing match.

Define objective priorities explicitly: serve more requests, minimize pickup time, honor accessibility/vehicle constraints, avoid excessive driver repositioning, and distribute work fairly. Hard safety constraints should not be represented as weak penalties that the solver may violate to improve the total score.

## Common mistakes

- Modeling only the cost matrix and forgetting which edges are infeasible.
- Maximizing minimum matches while ignoring pickup time, fairness, priorities, or business penalties for leaving requests unassigned.
- Choosing a greedy match without considering that a driver may be the only feasible option for another request.
- Encoding a safety rule as a soft score penalty rather than a hard constraint.
- Using stale location/availability and assuming solver output is still valid at commit time.
- Failing to atomically claim both sides, so concurrent workers assign one driver/request multiple times.
- Waiting too long to accumulate a “better” batch and violating pickup-time objectives.
- Solving a city-wide exact problem with no time/capacity bound, then missing dispatch deadlines.
- Reassigning drivers repeatedly as a new optimum appears, harming trust and increasing canceled trips.
- Treating solver optimality as proof that the objective weights represent a fair or correct product policy.

## Knowledge checks with answers

1. **Why can greedy nearest-driver matching serve fewer riders?** It may consume a flexible driver needed by a rider with no other feasible edge; consider the whole matching, not only one edge.
2. **When should a rule be a hard constraint rather than a penalty?** When violating it is unacceptable, such as vehicle eligibility or safety; a finite penalty can still be outweighed by other costs.
3. **Does an optimal solver result guarantee a driver is still available?** No. The input snapshot may be stale; claim assignments atomically and handle conflicts/re-solving.
4. **Why use a short rolling horizon?** It balances a larger choice set against rider delay and stale driver state; execute near-term decisions and recompute as conditions change.

## Review status

Assignment and solver family descriptions are checked against OR-Tools documentation. The lesson remains pending full claim-by-claim audit and manifest omission check; production matching objectives are domain-specific.
