# end-to-end system design case studies — Reference: MCU

Sources: [RFC 7667: RTP Topologies](https://www.rfc-editor.org/rfc/rfc7667.html), [W3C WebRTC specification](https://www.w3.org/TR/webrtc/), [RFC 8834: RTP Usage for WebRTC](https://www.rfc-editor.org/rfc/rfc8834.html).

## Scope and version

MCU means Multipoint Control Unit in conferencing systems. In the common media topology, the MCU receives participant streams, decodes them, mixes audio and/or composes video, then encodes one or more output streams for participants. RFC 7667 describes mixer topologies and their RTP properties. Implementations vary: some mix audio but forward video, or offer both MCU and SFU modes. Treat MCU as a topology family, not a guarantee that every signal is mixed identically.

## How this group fits the mental model

An MCU moves much of the per-participant composition work from clients to a server. A client can receive one composite video and mixed audio rather than many separate participant streams, which may help low-power devices and constrained downstream connections. The server must decode, synchronize, compose/mix, and encode media, consuming compute and adding processing latency. A single composite also reduces each viewer’s ability to independently resize, pin, or spatially arrange participants unless the service generates multiple outputs.

Audio and video have different mixing needs. Audio mixing may apply active-speaker selection, noise suppression, gain control, and echo-related processing. Video composition must choose layout, resolution, frame rate, and keyframe behavior. These choices affect quality and CPU cost; hardware acceleration, codecs, and resolution are key capacity variables.

## Supplied names explained

- **MCU**: a server topology that combines media from multiple participants into one or more output streams, commonly by decoding and re-encoding.
- **Mixer**: an RTP middlebox that receives media sources and produces a combined source or stream. RFC 7667’s mixer semantics include source identification and synchronization considerations.
- **Audio mix**: combined audio output. Avoid simply summing waveforms; use gain, clipping prevention, active-speaker or suppression policy, and latency constraints appropriate to the product.
- **Video composition**: assembling participant videos into a grid, speaker-focused layout, or other composite. Layout changes can require encoder/keyframe work and should be rate-limited.
- **Transcoding**: decode and re-encode into another codec, bitrate, or format. This enables broad compatibility or tailored outputs but is computationally expensive and may reduce quality.
- **Composite stream**: one output representing several inputs. It simplifies downstream subscription but hides individual input tracks unless the service also publishes separate streams.
- **Per-viewer output**: separate layouts or resolutions for different viewers. It improves customization but multiplies encoder and egress costs.

## Cross-item comparison

An MCU performs media processing and typically emits mixed/composited output. An SFU forwards selected original participant streams and lets clients render their own layouts. Mesh keeps media peer-to-peer and avoids a central media server but makes each client upload and encode for multiple peers. MCU often fits calls where client simplicity or a single broadcast-like composition matters; SFU often fits interactive calls needing flexible layouts and lower server media processing.

Hybrid systems are common: mix audio centrally, forward video selectively, and offer a composed stream for low-capability clients. Evaluate by media type and user experience rather than forcing one topology across all paths.

## Examples

For a webinar with one host and many viewers, the MCU composes host plus screen share into a fixed output and emits one encoded stream per quality tier. Viewers decode one stream, while the server scales encoding and distribution. For a small meeting, a per-viewer layout may allow each participant to pin someone; that increases output variants and compute. A design might therefore provide a shared low-cost composition plus optional SFU subscriptions for interactive participants.

Capacity tests should model codec, resolution, frame rate, participant count, layout count, simultaneous keyframe requests, and hardware acceleration. Measure processing latency and output quality under overload. Define degradation behavior such as reducing frame rate or dropping nonessential tiles before the service becomes unstable.

## Common mistakes

- Assuming every MCU combines audio and video in the same way.
- Ignoring decode/encode cost and added processing latency.
- Assuming one composite can satisfy every viewer’s layout preference.
- Counting participants without modeling resolution, frame rate, codec, and output variants.
- Treating MCU as an SFU that only forwards packets.
- Neglecting audio clipping, synchronization, and speaker policy.
- Failing to define behavior during overload or a failed media worker.

## Knowledge checks with answers

1. **What is the main difference between MCU and SFU?** MCU combines/produces media outputs; SFU selectively forwards separate streams.
2. **Why can an MCU simplify clients?** A client may decode one composed video instead of many independent participant videos.
3. **What is a major MCU cost?** Server-side media decoding, mixing/composition, and potentially encoding multiple outputs.
4. **When can a hybrid topology help?** When different users or media types need different trade-offs, such as centrally mixed audio plus selectively forwarded video.
