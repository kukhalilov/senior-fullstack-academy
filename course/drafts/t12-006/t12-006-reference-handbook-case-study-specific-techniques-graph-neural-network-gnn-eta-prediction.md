# end-to-end system design case studies — Reference: Graph Neural Network (GNN) ETA prediction

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google Maps: ETA Prediction with Graph Neural Networks](https://arxiv.org/abs/2108.11482), [DuETA: graph learning for ETA at Baidu Maps](https://arxiv.org/abs/2208.06979), [CompactETA at KDD 2020](https://www.kdd.org/kdd2020/accepted-papers/view/compacteta-a-fast-inference-system-for-travel-time-prediction.html), [FRIGATE: spatio-temporal forecasting on road networks](https://arxiv.org/abs/2306.08277).

## Scope and version

This case study explains how graph neural networks can help estimate travel time over a road network. It focuses on the model-serving system and its data/evaluation pipeline, not on one mandatory architecture. The cited ETA research spans 2020–2022; a 2023 FRIGATE paper adds a related traffic-forecasting example focused on sparse sensors, missing histories, and changing road connectivity. Sources were checked on 2026-11-21 and show research designs rather than a current guarantee about any mapping service. Models and traffic systems evolve, and a GNN is not inherently more accurate than a strong route-aware baseline.

## How this group fits the mental model

Given a candidate route, an ETA service predicts when the traveler will arrive. A simple baseline estimates each road segment's travel time from length and speed, then combines the segments. Real travel time depends on more than independent segments: traffic on connected roads, turns, bottlenecks, incidents, time of day, weather, route geometry, and the time horizon can all affect the result.

A road network naturally forms a graph. Nodes may represent road segments or intersections; directed edges encode permitted transitions or adjacency. A graph neural network (GNN) repeatedly combines information from a node with information from its graph neighbors. This lets a segment representation include learned context from connected segments. The graph is an input structure, not a promise that physically adjacent roads always have correlated conditions; the model, graph construction, and live features must establish useful relationships.

The full system has several layers: map matching and route construction; historical and real-time feature retrieval; model inference; aggregation into a route ETA and uncertainty; response serving; and feedback from completed trips. The GNN is one component. A stale traffic feed, incorrect route, map-version mismatch, data leakage, or unstable online service can make the end-to-end ETA poor even if the neural network is sophisticated.

## Supplied names explained

- `Graph Neural Network (GNN) ETA prediction` — Predicts travel time using a learned model that incorporates road-network relationships. Research examples include graph/message-passing components combined with temporal and route representations; exact node/edge definitions, model layers, and serving designs vary by system.

### Data and prediction path

1. **Construct a candidate route.** The routing system supplies an ordered sequence of road segments, turn transitions, and possibly alternative routes. ETA predicts travel on the supplied route; it does not necessarily choose the best route unless route choice is explicitly part of the model.
2. **Build a versioned road graph.** Represent directionality, intersections, segment boundaries, turn restrictions, road classes, and connectivity. Keep graph/map versions consistent with routing and feature production. A graph update that splits or merges segments can invalidate cached IDs and historical joins.
3. **Gather features at prediction time.** Static features can include segment length, road class, speed limit, or geometry. Dynamic features can include recent observed speeds, travel times, incident reports, weather, and historical patterns for the expected departure window. Every feature must be available at the prediction timestamp; future information leaking into training creates misleading offline accuracy.
4. **Encode route and neighborhood context.** A GNN layer aggregates messages along defined edges or learned relationships. Temporal components model recent and recurring traffic variation. Route pooling or sequence encoding combines segment estimates into a route-level representation. Some published systems use supersegments or route-level representations to capture longer-range context; this is a design option, not a standard requirement.
5. **Predict and aggregate.** The model may estimate segment times and combine them, or directly estimate route duration. If summing segment estimates, account for turns, stops, waiting, and dependencies not represented by the segments. Produce calibrated uncertainty or quantiles when downstream decisions need risk bounds; a point estimate alone hides possible error.
6. **Serve under latency limits.** Precompute static graph embeddings where useful, batch compatible queries, cache safe features, and bound graph neighborhood size. Measure feature-fetch latency separately from inference. A research model's reported inference time under a particular environment is not a production SLA for another graph size, hardware, or request mix.
7. **Learn from completed trips.** Join actual travel outcomes to the route and features as they were known at departure. Account for cancellations, route changes, missing GPS, map-matching error, and selection bias. Store model, graph, feature, and routing versions for reproducibility.

## Cross-item comparison

This lesson has one assigned item, so no within-group comparison applies. Compare a GNN with a strong segment-speed baseline, gradient-boosted trees using route summaries, a temporal model over segment sequences, and a hand-engineered traffic model. A GNN is more attractive when spatial dependencies and graph structure add predictive information. A simpler model may be cheaper, easier to debug, and just as accurate for short or sparse routes.

Compare two modeling choices separately: predict segment-level travel times and aggregate them, or predict route duration directly. Segment estimates can be inspected and reused, but errors can accumulate and correlations can make a naive sum miscalibrated. Direct route models can capture route-level patterns but may generalize poorly to route lengths or combinations not seen in training. Evaluate both on route-level outcomes and relevant slices.

ETA prediction is not route optimization. A routing service may request ETAs for multiple candidate paths and choose one under travel time, reliability, toll, safety, or user preference constraints. Optimizing a point estimate can create unstable route switching; use consistent cost functions, hysteresis or route-change penalties where appropriate, and test the downstream routing policy.

## Examples

### A traffic incident upstream

An accident slows one arterial segment. A segment-only baseline may react only after that segment's observed speed falls. A graph-aware model can use connected-road signals or congestion propagation patterns if its graph and features encode them. It still cannot know an unreported incident immediately. Monitor stale feature age, incident-feed delay, and prediction error around disruptions; fall back to a recent or historical estimate when live signals are missing.

### Offline evaluation

Split training and evaluation by time, not random rows, so future observations do not leak into past prediction. Also test geographic holdouts or new road segments to estimate generalization. Compare against the existing ETA baseline on the same routes and timestamps. Measure MAE or median absolute error, signed bias (especially systematic lateness), tail error, calibration, and service-level outcomes. Segment results by city, route length, road class, time of day, weather, incident status, and sparse-data regions. A lower average error can hide a severe regression in a low-volume area.

### Online serving and safe rollout

Shadow the new model against production traffic without changing user-visible ETAs. Verify feature parity, latency, error rates, and model outputs. Then canary by region or traffic cohort, comparing predeclared metrics and operational guardrails. Keep a fast rollback to the previous model and a deterministic fallback when graph/feature dependencies fail. Record model and graph versions with each result so an unexpected prediction can be reproduced.

## Accuracy, uncertainty, and safety

ETA error is asymmetric in user impact. Arriving earlier than predicted may be acceptable for some use cases; arriving later can cause missed appointments or pickup failures. Track signed error and late-tail quantiles, not only mean absolute error. Calibrate prediction intervals on held-out, temporally appropriate data and recheck calibration as traffic patterns drift.

Distinguish model uncertainty from input and system failures. A confident prediction from stale traffic or a mismatched map graph is not trustworthy. Gate or degrade predictions when essential features are missing, confidence is low, or map versions disagree. For dispatch or safety-critical use, expose uncertainty to the downstream decision and preserve conservative operational limits.

Monitor drift in road topology, route mix, feature distributions, traffic behavior, and actual residuals. Re-train and re-evaluate through a reproducible pipeline; do not automatically promote a new model solely because offline aggregate loss improved. Guard against feedback loops: routing changes which roads vehicles take, which changes the data observed on those roads.

## Common mistakes

- Assuming that using a GNN guarantees better ETA accuracy.
- Treating a road graph as undirected or ignoring turns, direction, and map-version consistency.
- Leaking future traffic observations or using features unavailable at request time.
- Reporting only overall MAE and hiding systematic lateness or regional/route-length regressions.
- Summing segment estimates while ignoring correlated errors, turns, stops, and route changes.
- Confusing ETA prediction with route selection or dispatch optimization.
- Quoting a research paper's latency or accuracy as a production guarantee for a different workload.
- Ignoring feature freshness, map matching, missing data, and upstream service latency.
- Deploying a model without shadow mode, canary, rollback, and versioned prediction logs.
- Treating a point estimate as certainty when downstream decisions need a risk range.

## Knowledge checks with answers

1. **What does a GNN add to ETA prediction?** It can learn representations that combine traffic and road-context information across a graph; it does not guarantee that the graph or learned neighborhood improves accuracy.
2. **Does an ETA model normally choose the route?** Not necessarily. A route planner may provide candidate routes to the ETA model, then choose among them using ETA and other costs.
3. **Why time-based evaluation splits?** Randomly mixing time can let future patterns leak into training and make offline results unrealistically optimistic.
4. **Why measure signed and tail errors?** Average absolute error does not show systematic late estimates or rare large delays that can dominate user harm.
5. **What should happen when live traffic features are stale?** Detect freshness, use an explicit fallback or degrade confidence, and avoid presenting a stale-input prediction as current certainty.

## Practice

Design an ETA service for rideshare routes. Define graph nodes/edges, static and time-varying features, model/baseline alternatives, prediction output including uncertainty, feature freshness policy, offline time/geography splits, online canary metrics, and fallback behavior. Explain how a map update, traffic incident, and missing feature store response affect the prediction and how you would detect each failure.
