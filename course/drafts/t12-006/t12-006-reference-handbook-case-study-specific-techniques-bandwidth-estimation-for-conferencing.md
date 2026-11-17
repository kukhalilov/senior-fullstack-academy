# end-to-end system design case studies — Reference: Bandwidth estimation for conferencing

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 8836: Congestion Control Requirements for Interactive Real-Time Media](https://www.rfc-editor.org/rfc/rfc8836.html), [RFC 8888: RTCP Feedback for Congestion Control](https://www.rfc-editor.org/rfc/rfc8888.html), [RFC 8868: Evaluating Congestion Control for Interactive Real-Time Media](https://www.rfc-editor.org/rfc/rfc8868.html).

## Scope and version

This lesson focuses on adapting interactive RTP audio/video send rates to available network capacity. It is not a specification of one WebRTC bandwidth-estimation implementation; algorithms and browser behavior vary. Verify the chosen WebRTC stack’s current congestion-control and feedback support.

## How this group fits the mental model

Conference media competes with other traffic over a path whose capacity can change. If senders transmit faster than the path can carry, queues grow, delay increases, and packets are lost. Unlike file transfer, real-time media often cannot recover by retransmitting every late packet: an old video frame may be useless after its playout deadline. The sender therefore estimates a safe sending rate from receiver/network feedback and adapts media bitrate, frame rate, resolution, or simulcast/SVC layers.

The estimate is not a promise of reserved bandwidth. It is a feedback-driven control input that can be stale or noisy. A shared bottleneck across multiple conference participants, Wi-Fi contention, cross traffic, and asymmetric upload/download paths all affect observed quality.

## Supplied names explained

- **Available bandwidth estimate:** estimate of the rate the path can currently sustain for this flow; differs from link capacity and application bitrate.
- **RTCP feedback:** receiver-to-sender reports about packet reception, timing, loss, and possibly ECN marks, used by sender-side congestion control.
- **Rate adaptation:** changing encoded media bitrate and possibly resolution/frame rate/layers to fit the estimate and user experience target.
- **Congestion signal:** delay growth, loss, ECN marking, or other signal indicating queues or path pressure; no single signal is universally sufficient.
- **Feedback interval:** how often the receiver reports. More frequent reports can improve reaction but add overhead and can themselves be delayed or lost.
- **Circuit breaker:** safety mechanism that stops or significantly limits a persistently congestion-causing RTP flow; RTP itself does not provide congestion control.

## Cross-item comparison

| Control signal/action | Benefit | Limitation |
| --- | --- | --- |
| Packet-loss feedback | Detects dropped packets and can trigger a rate reduction | Wireless corruption and congestion can both cause loss; waiting for loss can react late |
| Delay/timing trend | Can detect queue buildup before severe loss | Measurement noise, route changes, and clock/feedback delay can mislead estimates |
| ECN feedback | Can signal congestion without dropping packets when supported end-to-end | Requires network path, endpoints, and negotiated protocol support; not universally available |
| Sender rate adaptation | Reduces media load by changing encoder rate/layers | Encoder has limits and adaptation takes time; abrupt changes can hurt quality |
| Circuit breaker | Bounds harm if control feedback is absent or ineffective | Last-resort protection, not a substitute for normal responsive congestion control |

## Examples

A participant starts a high-resolution video call on a Wi-Fi link that becomes congested when another household device begins a large download. The receiver reports rising packet transit delay and losses. The sender lowers its target bitrate and may reduce video layers/resolution while preserving audio; if the path recovers, it cautiously increases quality. The control loop must account for feedback delay so it does not oscillate rapidly between rates. If repeated feedback is missing, continuing at the old high rate can worsen congestion; RFC 8888 requires congestion-control algorithms to specify behavior for lost feedback and recommends a rapid rate reduction after multiple consecutive feedback losses because that may indicate path failure.

Estimate aggregate load, not only encoded video bits: audio, retransmissions/FEC, RTP/RTCP, encryption, and packet/IP/link overhead consume bandwidth. Monitor one-way and round-trip delay where available, jitter, loss, available bitrate, selected layer, freeze time, and feedback age by network type. Test changing capacity, competing flows, path migration, and loss of feedback.

## Common mistakes

- Equating Wi-Fi/ISP link speed with the capacity available to one media flow.
- Adapting bitrate from packet loss alone without considering delay, ECN, and path conditions.
- Ignoring feedback overhead, age, missing reports, asymmetric paths, and multiple streams sharing a bottleneck.
- Retrying every lost/late media packet even when it will arrive after its playout deadline and add congestion.
- Omitting audio and transport/protocol overhead from bandwidth estimates.
- Allowing the sending rate to remain high indefinitely when congestion feedback disappears.
- Treating the estimate as reserved capacity or a guarantee of video quality.
- Testing only a stable wired network rather than Wi-Fi contention and rapidly changing paths.

## Knowledge checks with answers

1. **Why does real-time video usually adapt instead of retransmitting everything?** A retransmission may arrive after the frame’s playout deadline and consume more bandwidth while the path is already congested.
2. **Is an available-bitrate estimate the same as physical link capacity?** No. It estimates what the flow can currently sustain under path sharing and observed conditions.
3. **What should happen if multiple congestion-feedback messages are lost?** The algorithm must define behavior; RFC 8888 recommends rapidly reducing send rate after multiple consecutive losses because path failure may be occurring.
4. **What else consumes capacity beyond encoded video?** Audio, protocol headers, RTCP, retransmissions/FEC, encryption framing, and network-layer/link overhead.

## Review status

Congestion-control requirements and RTCP feedback limits are checked against RFCs 8836, 8888, and 8868. This lesson remains pending full claim-by-claim audit and manifest omission check.
