# end-to-end system design case studies — Reference: Excalidraw

Sources: [Excalidraw GitHub project](https://github.com/excalidraw/excalidraw), [Excalidraw developer docs: FAQ](https://docs.excalidraw.com/docs/%40excalidraw/excalidraw/faq), [Excalidraw Plus: Share and collaborate](https://plus.excalidraw.com/guides/share-and-collaborate), [HLD Handbook: Diagramming Skills for System Design Interviews](https://hld.handbook.academy/curriculum/interview-framework/diagramming-skills/).

## Scope and version

Excalidraw is a hand-drawn-style virtual whiteboard and diagram editor, available as a hosted application and as an open-source React component/project. This lesson focuses on using it to communicate system designs and distinguishes features of the hosted app from capabilities of the embeddable package. Collaboration, sharing, export, and plan features can change; verify the current product and interview environment. Sources checked 2026-11-21.

## How this group fits the mental model

A whiteboard is a communication surface, not the design itself. A useful architecture diagram shows the system boundary, major components, data ownership, and a few labeled flows. Visual neatness matters less than whether the interviewer can follow the request path and understand why each component exists. A lightweight sketch is often faster than learning a tool’s advanced controls during an interview.

## Supplied names explained

- **Excalidraw editor:** canvas-based drawing with an intentionally sketch-like visual style, useful for boxes, arrows, labels, and quick revisions. The project repository describes the editor and its embeddable component.
- **Hosted application and sharing:** the hosted app offers collaboration/sharing workflows; exact session and link behavior depends on the current product. A shared URL may convey board access, so do not put confidential interview or customer information into a public or broadly shared board.
- **Embeddable library:** the React package exposes the drawing editor and APIs, but its FAQ explicitly says the package does not include collaboration by itself because collaboration is host-specific. An application embedding it must build or integrate its own collaboration and persistence design.
- **Persistence and export:** distinguish a local/exported drawing from a cloud-hosted board or live session. Confirm how to save, reopen, and export your work before relying on it; do not assume all modes have identical retention or privacy guarantees.
- **Interview diagram practice:** prepare a small visual vocabulary: boxes for services, cylinders or labeled boxes for stores, arrows for calls/events, dashed lines for asynchronous work, and short labels for protocols or data. Keep one read path and one write path legible, group optional components separately, and edit the diagram as assumptions change.

## Cross-item comparison

| Tool style | Useful for | Trade-off |
| --- | --- | --- |
| Excalidraw | Fast informal architecture sketches and hand-drawn diagrams | Hosted-app collaboration and storage are distinct from the open-source editor package |
| Miro | Shared visual workspace with broader collaboration, facilitation, and diagramming features | More surface area to manage; feature access and sharing controls vary by plan |
| Plain text or a simple drawing surface | Fastest fallback when tools are unavailable | Less spatial flexibility; still sufficient if flows and boundaries are clear |

## Examples

To sketch a CI/CD system, draw source repository → event intake → workflow scheduler → isolated runner pool → artifact store → deployment controller. Label the trusted and untrusted paths, mark where secrets are available, and show cache separately from immutable artifacts. If the interviewer asks about fork pull requests, update the boundary visibly rather than adding a paragraph of disconnected notes. Keep the diagram readable at interview scale and narrate changes as you make them.

## Common mistakes

- Assuming the Excalidraw React package supplies hosted collaboration, persistence, or access control automatically.
- Relying on a shared link without understanding who can view or edit it and how long the board persists.
- Spending minutes aligning icons or choosing colors while the data flow is unclear.
- Drawing unlabeled arrows that hide whether a path is synchronous, asynchronous, or bidirectional.
- Using product-specific iconography before the logical component and responsibility are understood.
- Sharing secrets, customer data, or private architecture on a public board.
- Depending on a particular tool without checking the interview’s permitted software and access setup.

## Knowledge checks with answers

1. **Does the Excalidraw embeddable package provide real-time collaboration out of the box?** No. Its developer FAQ says collaboration is host-specific and not built into the package.
2. **What belongs in an interview architecture diagram?** Components, boundaries, ownership, labeled flows, and the path that demonstrates the requirements.
3. **Is a shared link automatically private?** Do not assume that. Confirm current permissions and sharing behavior before putting sensitive content on a board.
4. **Should visual polish take priority over reasoning?** No. Optimize for readable flows and clear explanation.
5. **What is the safest fallback if the tool fails?** Continue with a simple sketch or structured text while preserving the same component and flow clarity.

## Review status

Reviewed 2026-11-21. Replaced the placeholder with a tool-focused lesson and checked the distinction between hosted Excalidraw collaboration and the open-source package, whose official FAQ states collaboration is not built in. Added interview diagram practices and privacy/access caveats. Version-sensitive product capabilities are explicitly subject to current documentation. No material omission remains in the supplied topic scope.
