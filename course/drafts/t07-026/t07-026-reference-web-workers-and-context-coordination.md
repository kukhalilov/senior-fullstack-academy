# Browser persistence offline operation and web workers — Reference: Web workers and communication between browser contexts

## Scope and version

This lesson compares computation workers and service workers, and explains the supplied communication concepts. Browser support and transferable types depend on the target platform.

## How this group fits the mental model

Workers help separate work from the page’s main thread, but each worker type has different ownership and lifecycle. Communication is explicit: the page sends data, the worker computes, and results return as messages. Moving work does not make it free; cloning large objects costs time and memory.

## Supplied names explained

- `Main-thread work and responsiveness` — The main thread handles page scripting, rendering coordination, and user events. Long computation can delay input and paint, so profile before moving suitable work elsewhere.
- `Dedicated Worker` — A worker associated with a particular creating context. It is useful for isolated computation such as parsing or transforming data and can be terminated by its owner.
- `SharedWorker` — A worker that compatible same-origin browsing contexts can connect to. It can coordinate shared work, but support, lifecycle, and deployment complexity should be assessed for target browsers.
- `Service Worker comparison` — A service worker is event-driven and primarily mediates requests and application lifecycle for controlled clients; it is not a general always-running shared compute worker.
- `postMessage data copy` — Messages generally use structured cloning to copy supported data. Large payloads can add CPU and memory costs; send only what the receiver needs.
- `Transferable objects` — Supported resources can be transferred so ownership moves instead of copying the underlying data. After transfer, the sender may no longer use that resource; design ownership explicitly.
- `Structured clone limits` — The cloning algorithm supports many structured values but not every JavaScript value, and some objects have special behavior. Handle clone errors and avoid relying on functions or DOM nodes crossing the boundary.
- `Worker lifecycle and termination` — Dedicated workers can be terminated, and worker contexts can encounter errors or be shut down. Make work restartable where needed; do not keep sole copies of important state in worker memory.
- `Cross-tab coordination` — Tabs can communicate or coordinate through browser messaging/storage mechanisms, but messages can be missed if a tab is closed or suspended. Persist durable state and reconcile rather than treating a live message channel as the source of truth.

## Cross-item comparison

Dedicated workers serve one creating context; SharedWorkers can serve connected contexts; service workers receive browser events and can mediate fetches. Structured cloning copies data; transfer moves ownership for supported resources. Durable coordination belongs in persistent storage or a server protocol, not only in volatile worker memory.

## Examples

Move a large local search-index build to a Dedicated Worker after profiling confirms it blocks input. Send the minimum required records, or transfer an appropriate buffer when ownership can move. If another tab should learn that data changed, publish a notification but have it reread the committed database state.

## Common mistakes

- Moving an algorithm into a worker without measuring data-copy costs.
- Expecting a worker to access or update the DOM directly.
- Assuming a message to another tab will be delivered after that tab has been suspended or closed.
- Using the service worker as a permanently running job processor.

## Knowledge checks with answers

1. What is the main tradeoff of structured cloning large payloads? Copying costs time and memory.
2. What changes when an object is transferred? Ownership moves; the sender may lose access.
3. Should a cross-tab notification be the durable record of a change? No; persist the change and let contexts reconcile from durable state.

### Sources

- [Using web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [Structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
