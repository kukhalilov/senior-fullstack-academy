
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: perceivable time based media

# Scope and version

This reference covers nine supplied criteria from WCAG 2.2 Guideline 1.2. Level and media context are part of each criterion. Summaries follow the [W3C Recommendation](https://www.w3.org/TR/WCAG22/) and [Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/); precise exceptions and timing relationships must be checked in the normative text.

# How this group fits the mental model

Audio and video communicate through different channels. Captions convey relevant audio information in text, transcripts/media alternatives convey time-based information through another form, and audio description conveys important visual information spoken in the soundtrack. “Prerecorded” and “live” change which criteria apply.

# Supplied names explained

- `1.2.1 Audio-only and Video-only (Prerecorded) (A)` — Provide a time-based media alternative for prerecorded audio-only content. Prerecorded video-only needs a media alternative or an audio track that presents equivalent information.
- `1.2.2 Captions (Prerecorded) (A)` — Prerecorded audio in synchronized media needs captions, except when the media is itself a clearly labeled alternative for text.
- `1.2.3 Audio Description or Media Alternative (Prerecorded) (A)` — Prerecorded synchronized video needs audio description or a complete time-based media alternative conveying its information.
- `1.2.4 Captions (Live) (AA)` — Live synchronized audio content needs captions.
- `1.2.5 Audio Description (Prerecorded) (AA)` — Prerecorded synchronized video needs audio description for visual information not already conveyed by the soundtrack.
- `1.2.6 Sign Language (Prerecorded) (AAA)` — Provide sign-language interpretation for prerecorded audio content in synchronized media.
- `1.2.7 Extended Audio Description (Prerecorded) (AAA)` — When ordinary pauses are insufficient to insert needed description, provide an extended version that pauses the video to allow description.
- `1.2.8 Media Alternative (Prerecorded) (AAA)` — Provide an alternative for prerecorded synchronized media and prerecorded video-only media that presents equivalent information.
- `1.2.9 Audio-only (Live) (AAA)` — Provide an alternative for live audio-only content that presents equivalent information.

# Cross-item comparison

| Need | Typical mechanism | Important distinction |
| --- | --- | --- |
| Spoken words and relevant sounds | Captions | Include meaningful speaker identification/sound information, not only dialogue when needed |
| Visual information unavailable in audio | Audio description | Describe meaningful visuals during available pauses or extended pauses |
| Full time-based content in text | Transcript/media alternative | Must convey the information and relevant sequence, not merely summarize the topic |
| Live speech | Live captions | Prerecorded captions alone do not meet live content needs |

# Examples

A prerecorded lecture with a speaker and slide content may need synchronized captions for speech and significant sounds, plus audio description or a complete media alternative for visual information that is not otherwise conveyed. A transcript that omits a visual demonstration is not automatically a complete equivalent.

For live audio-only coverage, an alternative could be a live text presentation conveying the same information. A generic “live transcript available” link is not itself a guarantee that the alternative contains equivalent content.

# Common mistakes

- Confusing captions with subtitles that contain dialogue only when meaningful sound cues are also present.
- Assuming captions meet audio-description needs for video.
- Providing a short summary and calling it a complete media alternative.
- Applying prerecorded requirements to live content or vice versa.
- Forgetting audio-description criteria apply to meaningful visual information not otherwise conveyed.
- Treating AAA criteria as part of every AA conformance claim.

# Knowledge checks with answers

1. **What does 1.2.4 cover?** Captions for live synchronized audio content (AA).
2. **What does audio description provide?** Narrated meaningful visual information absent from the audio track.
3. **When is extended audio description relevant?** When ordinary pauses do not allow enough time to describe the visual information.
4. **Is a topic summary necessarily a media alternative?** No; it must provide the equivalent relevant information required by the criterion.
5. **Which criteria are AAA in this group?** 1.2.6, 1.2.7, 1.2.8, and 1.2.9.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI: Captions/Subtitles](https://www.w3.org/WAI/media/av/captions/)
- [WAI: Audio Description](https://www.w3.org/WAI/media/av/description/)
