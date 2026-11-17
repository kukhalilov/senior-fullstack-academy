# system design foundations and infrastructure building blocks — Big-picture orientation and mental model

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.rfc-editor.org/rfc/rfc8446), [reference 3](https://www.rfc-editor.org/rfc/rfc9293), [reference 4](https://www.rfc-editor.org/rfc/rfc6455), [reference 5](https://www.rfc-editor.org/rfc/rfc9000), [reference 6](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 7](https://hld.handbook.academy/curriculum/prerequisites/), [reference 8](https://hld.handbook.academy/curriculum/building-blocks/), [reference 9](https://man7.org/linux/man-pages/man7/epoll.7.html), [reference 10](https://man7.org/linux/man-pages/man7/io_uring.7.html), [reference 11](https://man.freebsd.org/cgi/man.cgi?query=kqueue).

## Problem and purpose

A system design explains how a user action travels through clients, networks, services, and data stores and how the system behaves under growth and failure. Begin with a measurable product outcome, model ordinary and peak traffic, sketch the simplest complete request path, and add infrastructure only where its benefit is clear. A load balancer spreads requests; a cache avoids repeated work; a queue separates producers from consumers; a database preserves authoritative state. None is a universal scalability switch.

## Plain-language mental model

First understand the promise to the user. Then trace data and control from the user to the authoritative state and back. Treat every network hop as a possible delay or failure. Separate synchronous work needed for the response from durable asynchronous work that can finish later.

### Begin with the user story, not the component names

Imagine a customer opens a product page and presses **Buy**. The page sends a request; the service checks that the item is available and that the customer may buy it; the system records the order; then the page shows a result. Draw that path with ordinary words before choosing a CDN, gateway, queue, cache, database, or cloud product. If a box cannot be tied to a user need, a measured bottleneck, or a failure requirement, leave it out of the first design.

Now ask what can go wrong: the phone may lose Wi-Fi after sending the request; the order may have been saved even though the reply was lost; two customers may try to buy the last item; or a recommendation service may be slow. Decide what the customer should see in each case. Only then introduce technical terms and tools that solve those concrete problems.

### A beginner's design sequence

1. Describe the main user actions and what counts as success.
2. State what must never happen (for example, charge twice or sell the same last item twice).
3. Estimate how many users and requests the design must handle; use rough ranges and label assumptions.
4. Draw one complete request and response, showing where important data is saved.
5. Walk through a timeout, a busy service, and a failed machine. Decide what the user sees and how work recovers.
6. Add a technical mechanism only when it addresses one of these requirements, then explain its cost and limits.

You can apply this sequence before knowing the names of every technology. The later lessons teach those names and compare alternatives after the problem is understandable.

## How the parts fit together

```text
user goal → requirements + workload → simplest correct end-to-end path
          → ownership + contracts → capacity, consistency, and security
          → failure behavior + observability → measured iteration
```

## Concept map

The major choices fall into five connected questions: where requests enter and how they are routed; where authoritative and derived data live; how work is coordinated across processes; which guarantees users observe during delay or failure; and how the service is operated, secured, and evolved. A component is useful only when it answers one of those questions.

## End-to-end walkthrough

For a product catalog, a browser calls an HTTPS API through a CDN and gateway. The API authenticates the caller, reads a bounded query from a database or cache, and returns a versioned response. If images are immutable, the CDN can serve them close to users. If an optional recommendation dependency is slow, the catalog response can omit recommendations within a deadline. Instrument the path, load-test realistic traffic, and add replicas or partitions only after measurements identify the constrained resource.

## When to use it and tradeoffs

Use these concepts when defining a new service, reviewing a scaling proposal, investigating an incident, or preparing an architecture interview. Prefer the smallest design that meets measured goals. Distribution improves some forms of scale and isolation but adds network failure, partial success, consistency choices, and on-call burden.

## What later lessons cover

The concepts lesson develops the decision process and failure reasoning. Reference lessons explain each named item in bounded groups. Practice and interview lessons apply the ideas to realistic scenarios. Existing .NET, React, SQL, security, and operations tracks remain the place for framework-specific APIs and configuration.
