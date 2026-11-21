# end-to-end system design case studies — Reference: Regional media routing

Sources: [HLD Handbook](https://hld.handbook.academy/), [Amazon Chime SDK meeting and media regions](https://docs.aws.amazon.com/chime-sdk/latest/dg/sdk-available-regions.html), [Selecting a media region](https://docs.aws.amazon.com/chime-sdk/latest/dg/using-meeting-regions.html), [Amazon Chime SDK WebRTC media](https://docs.aws.amazon.com/chime-sdk/latest/dg/webrtc-media.html), [RFC 8825: WebRTC overview](https://www.rfc-editor.org/rfc/rfc8825.html), [RFC 8656: TURN relay](https://www.rfc-editor.org/rfc/rfc8656.html).

## Scope and version

This lesson covers placement of interactive media sessions across geographic regions. AWS Chime SDK documentation is one concrete provider example; region availability, API behavior, and residency obligations change, and were checked on 2026-11-21. The routing principles apply to WebRTC SFUs, conferencing backends, and media relays, but do not assume their APIs are identical.

## How this group fits the mental model

Choose where a room's media is processed and where its control state lives. Routing each participant to the individually nearest server can lower that participant's edge latency but split one room across regions, increasing inter-region media hops, jitter, egress cost, and coordination complexity. Routing one room to a single region gives the room an authoritative media plane and often simplifies membership and recording, but some participants may be far from it.

The optimization target depends on the product: one-to-one calls may optimize both endpoints' path; global conferences may minimize a weighted sum of participant latency; regulated recording may require a region; large broadcasts may use regional ingress and a distribution tree. “Nearest region” is a heuristic, not necessarily the best room-wide choice or proof of legal residency.

## Supplied names explained

- **Control region:** hosts management APIs and meeting lifecycle/control events in some managed services. It may differ from the media region.
- **Media region:** where participants connect for actual real-time media processing. In Amazon Chime SDK Meetings, the media region is specified at meeting creation; clients connect to that meeting's media region.
- **Room/meeting affinity:** keep participants of one interactive room attached to compatible media state or a coordinated cluster. Moving a single participant or failing over a worker needs explicit migration/rejoin semantics.
- **Nearest-region selection:** select a media region using client location/network measurement or provider endpoint guidance. Re-evaluate after material network changes, but avoid oscillation by pinning an established call unless quality/failover policy says otherwise.
- **Cross-region forwarding:** path between media servers or SFUs when a room spans regions. It can reduce client distance for some users but adds backbone bandwidth, encryption/authorization, forwarding, and failure modes.
- **Regional failover:** create/rejoin a session in another region when capacity or health fails. It may interrupt ongoing media; control state, credentials, recording, and room membership must be recoverable.
- **Residency and processing location:** data-governance constraints on where media, metadata, recordings, analytics, and support access occur. A region label alone does not establish compliance; verify the service's full data path and applicable contract/law.

## Architecture and routing flow

1. **Discover requirements.** Ask participant geography, expected room size, latency target, call continuity, recording/transcription path, data residency, failover objective, and service budget. Separate control-plane availability from media-plane quality.
2. **Select a candidate region.** Filter regions by feature availability, account enablement, capacity, residency policy, and required media features. A provider may expose a nearest-region endpoint; treat its result as a candidate based on provider criteria, not a universal global latency optimum.
3. **Assign a room authority.** Create the meeting and persist its region/cluster, room ID, configuration version, and ownership. Ensure retries of meeting creation are idempotent or can discover the existing meeting rather than creating duplicate rooms.
4. **Join clients consistently.** Return the selected region and short-lived join credentials from the trusted service. Clients should not choose arbitrary regions that bypass region policy or create split-brain room state.
5. **Monitor the actual path.** Measure client-to-media RTT, packet loss, jitter, bitrate, ICE path type, reconnects, and region-level capacity. A control API's successful response does not prove the media path is healthy.
6. **Handle poor-path exceptions.** If some users have high latency to the room region, consider a regional SFU cascade or a room migration only if the architecture supports it and the added inter-region cost is acceptable. Don't independently rehome users without a design for synchronized room state and media forwarding.
7. **Fail over deliberately.** Detect region/worker failure, preserve or reconstruct room state, issue new join credentials, reconnect or move participants, and mark recording gaps. State whether active calls drop, reconnect, or continue on a degraded route; do not claim transparent failover unless tested end to end.
8. **Keep the whole data path compliant.** Check media, signaling metadata, logs, recordings, transcription, analytics, backups, and operator access. Retention and deletion need to cover each path.

## Cross-item comparison

| Placement choice | Benefit | Cost or risk |
| --- | --- | --- |
| Pin all room media to one region | Simple authoritative room state and consistent processing location | Distant participants may see higher latency; region outage affects whole room |
| Choose each user’s nearest region independently | Low local client-to-edge latency | A room splits across regions; media forwarding and shared state become harder |
| Hierarchical regional SFUs | Regional ingress/egress with a room coordinator or root | Extra hop, inter-region bandwidth, routing and failure complexity |
| Provider-selected region | Fast to implement using provider availability/latency signals | Selection algorithm may be opaque and may not satisfy room-wide or compliance goals |
| Residency-constrained region | Helps enforce a documented processing boundary | May reduce available capacity or increase user latency; full data-flow review still required |

## Examples

### Distributed team call

Five attendees are in Europe and one in Central Asia. Pinning the room to a European region keeps five users near the media server but may give the sixth a longer path. A nearby regional SFU could improve that participant's ingress, while forwarding media to the room's authoritative region; measure the extra hop and service egress before choosing it. A per-user nearest-region policy that accidentally creates six unrelated room instances is incorrect.

### Meeting service with separate control and media regions

Amazon Chime SDK documents separate control and media regions; a meeting's media region is selected when it is created, and clients connect to that media region. This example demonstrates why the API endpoint region is not necessarily where RTP/media is processed. Store the meeting's actual media region and verify pipeline/recording compatibility for that region.

### Regional outage

If an SFU region becomes unhealthy, the control plane can create a replacement meeting or route clients through an alternate cluster if the service supports it. Participants may need to renegotiate ICE and rejoin; in-progress recording may split. Preserve an explicit state transition and user-visible reconnection path rather than silently creating a second authoritative room.

## Common mistakes

- Routing each participant independently to the nearest region without a room-level media/state design.
- Confusing API/control region with media-processing region.
- Treating a provider's nearest-region lookup as a legal residency guarantee or global optimum.
- Ignoring inter-region forwarding bandwidth, jitter, and egress charges.
- Assuming an active media session can migrate transparently across regions.
- Failing to pin room placement, so retries create duplicate rooms or participants split across authorities.
- Checking only media location while recordings, transcription, telemetry, or backups use other regions.
- Choosing a region based on geography alone and ignoring account enablement, service feature availability, and capacity.
- Using control-plane success as a substitute for measuring media-plane quality.

## Knowledge checks with answers

1. **Why not always send each participant to the nearest region?** A single room needs coordinated media and state; independently routing users can require cross-region forwarding or accidentally split the room.
2. **Can an API region identify where media flows?** Not necessarily. Some services separate control and media regions; inspect the meeting's media-region field and provider contract.
3. **Does a nearby SFU guarantee lower end-to-end latency?** No. It may reduce one leg but add forwarding hops; measure the complete path.
4. **What does regional failover promise?** Only what the system has implemented and tested: often rejoin/reconnect with interruption, not uninterrupted media continuity.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder text with a regional placement lesson. AWS Chime SDK documentation confirms its control/media-region distinction and meeting media-region selection; WebRTC references ground the media-plane context. The lesson keeps the provider example bounded and covers room affinity, region selection, cross-region forwarding, failover, measurement, and residency boundaries. No material omissions remain in the supplied topic scope.
