# end-to-end system design case studies — Reference: Dynamic Time Warping (DTW)

Sources: [HLD Handbook](https://hld.handbook.academy/), [Salvador and Chan, Toward Accurate Dynamic Time Warping in Linear Time and Space](https://static.aminer.cn/upload/pdf/228/1717/832/53e9b7f5b7602d97043a5fab_0.pdf), [The influence of global constraints on time-series similarity](https://arxiv.org/abs/1107.0134), [The R Journal: Time-Series Clustering using dtwclust](https://journal.r-project.org/articles/RJ-2019-023/).

## Scope and version

This lesson covers classic dynamic programming DTW for comparing two ordered time series that may exhibit similar shapes at different local speeds. It does not prescribe a distance for every domain. Local cost, normalization, admissible path constraints, multivariate handling, and missing-value policy must match the data and task.

## How this group fits the mental model

Euclidean distance compares sample `i` only with sample `i`; if one sensor signal follows the same pattern slightly faster, pointwise alignment can make the sequences look far apart. DTW finds a low-cost monotonic path through a pairwise cost matrix, allowing one point to align with multiple points in the other sequence. This can recognize similar patterns with local timing variation.

Classic unconstrained DP examines an `n × m` cost matrix, giving O(nm) time and usually O(nm) memory if the full path is stored (distance-only computation can use rolling rows). That cost makes all-pairs search expensive. Constraints and lower bounds can reduce work, but they also change which alignments are allowed; a too-tight constraint can exclude the best valid match.

## Supplied names explained

- **Local cost:** pointwise distance between samples, often absolute or squared difference after feature scaling. The chosen cost determines which signal dimensions matter.
- **Accumulated cost matrix:** DP table whose cell stores local cost plus the best valid predecessor cost.
- **Warping path:** monotonic sequence of matrix cells connecting sequence starts to ends, typically with horizontal, vertical, and diagonal moves. Path constraints prevent pathological alignments.
- **Global constraint/window:** limits the path to a region, such as a Sakoe–Chiba band near the diagonal or an Itakura-style region. It can reduce computation and encode a maximum timing distortion.
- **Normalization:** controls scale/offset effects, such as z-normalizing sequences; normalization can remove meaningful magnitude or level information, so apply only when appropriate.
- **Path length normalization:** optional divisor for accumulated distance to reduce bias caused by different path lengths; formula choice changes ranking and needs evaluation.
- **Subsequence DTW:** aligns a query against a segment of a longer stream rather than requiring both full sequences to align start-to-end; output and endpoints differ from classic global DTW.
- **Lower bound/pruning:** inexpensive bound used to reject candidates that cannot beat the current best, provided the bound is valid under the chosen constraints/cost.

## Cross-item comparison

| Method | Alignment assumption | Useful when | Limitation |
| --- | --- | --- | --- |
| Euclidean distance | Sample indices already align | Same-length, synchronized signals and large candidate search | A small time shift can create a large distance |
| DTW | Monotonic local time warping is permitted | Similar temporal shape with variable pace | Can over-align unrelated patterns and has O(nm) base cost |
| Constrained DTW | Warping restricted by a window/path rule | Timing variation has a known bound; fewer cells to evaluate | A constraint can exclude valid matches or change nearest-neighbor relationships |
| Edit-distance-style sequence metrics | Insertions/deletions/substitutions modeled explicitly | Discrete event sequences with gaps/insertions | Costs/semantics differ; not interchangeable with numeric DTW |

## Examples

Two walking sensors record the same gait cycle, but one person walks more slowly. Raw Euclidean distance aligns samples by index and mismatches peaks; DTW can stretch/compress local sections to align the sequence shape. If the algorithm is allowed to map a tiny section to a very long interval, it may produce a deceptively low cost for the wrong pattern. Choose a plausible band based on sampling variability and domain limits, then compare results against labeled examples.

For a catalog with millions of reference sequences, do not run unconstrained DTW against every long record for every request without a cost model. Normalize/featurize consistently, use candidate retrieval/lower bounds, apply a justified warping window, cache reusable reference summaries, and measure p95 latency, memory, candidate count, and false matches. Test varying sequence lengths, missing samples, amplitude changes, time shifts, repeated motifs, and adversarially long inputs.

## Common mistakes

- Treating DTW as a metric with all metric properties; common DTW formulations may not satisfy triangle inequality and cannot always use metric-tree pruning.
- Assuming the lowest DTW cost always means semantic similarity; unrestricted warping can align unrelated events.
- Comparing raw sequences without deciding normalization, dimensions, missing values, sample rate, and local cost.
- Claiming a warping window is only an optimization; it changes the allowed alignment and can change neighbors.
- Using O(nm) full matrices for large sequences/candidate sets with no time/memory limits.
- Applying classic global DTW when the use case requires subsequence matching or open-end alignment.
- Averaging/reducing time series before alignment in a way that erases the pattern being detected.
- Ignoring path-length normalization and comparing scores from different sequence lengths as if directly equivalent.

## Knowledge checks with answers

1. **Why can DTW match two sequences with different duration?** Its monotonic warping path can align one sample with multiple samples in the other sequence, allowing local pace changes.
2. **What is the base computation for lengths `n` and `m`?** The classic DP fills O(nm) cells; memory can be reduced for distance-only computation, but reconstructing the path needs additional storage or recomputation.
3. **Does tightening the Sakoe–Chiba band preserve the unconstrained answer?** Not always. It may speed computation but can exclude the unconstrained optimal path and change distances/ranking.
4. **When is Euclidean distance preferable?** When samples are already aligned and synchronized, because it is simpler and typically cheaper.

## Review status

Complexity and constraint effects are checked against the cited DTW research and time-series literature. This lesson remains pending complete claim-by-claim audit and manifest omission check.
