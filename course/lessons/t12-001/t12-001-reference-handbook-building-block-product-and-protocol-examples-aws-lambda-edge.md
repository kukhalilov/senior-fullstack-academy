# system design foundations and infrastructure building blocks — Reference: AWS Lambda@Edge

Sources: [CloudFront event triggers](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-cloudfront-trigger-events.html), [Event choice guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-how-to-choose-event.html), [Request/response flow](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-event-request-response.html), [Lambda@Edge restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge-function-restrictions.html), [CloudFront edge-function comparison](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-function-restrictions-all.html), [CloudFront quotas](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html).

## Scope and version

This lesson explains AWS Lambda@Edge as code associated with CloudFront request/response events. AWS changes supported runtimes, quotas, and restrictions; verify current documentation before release. Lambda@Edge is different from CloudFront Functions and from regional AWS Lambda: choose it for the specific event and capabilities the workload needs.

## How this group fits the mental model

CloudFront can serve a cached response or contact an origin. Lambda@Edge hooks into four points: viewer request, origin request, origin response, and viewer response. The placement matters. A viewer-request function runs before the cache lookup and therefore can run on every viewer request. An origin-request function runs when CloudFront needs to go to the origin; that path typically happens on a cache miss. Origin-response code can alter the origin result before it is cached/returned according to CloudFront behavior; viewer-response code acts on responses sent to viewers, subject to event restrictions.

This is a way to customize the CDN request path, not a general-purpose global application server. Keep logic bounded and understand whether its output varies by user, cookie, header, query parameter, or geography. If a personalized response is cached under a shared cache key, one user's data can leak to another. Configure cache and origin-request policies consistently with the function's inputs.

Lambda@Edge has deployment and runtime constraints. Current AWS documentation requires a numbered function version and a function in US East (N. Virginia), and lists unsupported Lambda features such as VPC access. The request-body include option exposes only bounded/truncated body portions depending on event type; it is not a way to process arbitrary large uploads at the edge. Treat these as release-specific deployment checks, not generic Lambda assumptions.

## Supplied names explained

- `AWS Lambda@Edge` — AWS Lambda functions replicated/associated through CloudFront for supported viewer and origin events. CloudFront determines when they run as part of its request flow; their code and deployment must satisfy Lambda@Edge-specific restrictions.

## Cross-item comparison

| Choice | Best fit | Main trade-off |
| --- | --- | --- |
| CloudFront Functions | Lightweight viewer request/response transformations with the narrower feature set documented by AWS | Less execution flexibility than Lambda@Edge; use the simplest supported edge hook |
| Lambda@Edge viewer event | Logic that must run for each viewer request/response and requires Lambda@Edge capabilities | Adds latency and invocation cost to that viewer path; response-event behavior has restrictions |
| Lambda@Edge origin event | Logic needed only when CloudFront interacts with the origin, such as origin routing or response transformation | Cache misses/origin responses define when it runs; caching can make invocation frequency differ from viewer traffic |
| Regional Lambda/API service | Business operations, database access, longer workflows, or broader AWS integrations | Runs in selected AWS regions; network distance and service orchestration remain part of the request path |

## Examples

### Choose event placement for URL rewriting

Suppose legacy URLs need a redirect to a canonical path. If the redirect must be computed for every incoming viewer request before cache lookup, a viewer-request hook may fit. If the rewrite only needs to change the request forwarded to the origin on a cache miss, an origin-request hook may avoid work on cache hits. Verify event semantics and whether CloudFront caches the generated result as intended. Test query strings, encoded paths, methods, and redirect status behavior.

### Add a response header safely

For a security header applied to cached content, determine whether the header should be part of the cached object or added for each viewer response. Configure the event and cache policy so the header does not depend on an unkeyed viewer attribute. Test cache hit and miss paths, error responses, and every configured behavior. Do not assume all response statuses are mutable in every event; AWS documents event-specific limits.

### Decide whether to inspect an upload body

For a form endpoint, a small body may be exposed with the include-body option. Large bodies are truncated to documented limits, so Lambda@Edge cannot reliably validate the entire large upload through this mechanism. Prefer a signed direct upload to object storage plus origin-side validation or scanning for large files.

## Common mistakes

- Treating viewer-request and origin-request as equivalent. One is tied to each viewer request; the other belongs to the origin-fetch path and interacts with cache hits differently.
- Ignoring cache-key variation when a function personalizes or rewrites output based on headers, cookies, query values, or identity.
- Assuming an origin-response or viewer-response function can alter every status code or response field. Check event-specific restrictions.
- Deploying `$LATEST`, a Lambda alias, or a function in an unsupported region rather than the required numbered version and region.
- Assuming ordinary Lambda VPC networking, runtime management, or all Lambda features are available at the edge.
- Parsing a supposedly complete large request body despite CloudFront's include-body truncation behavior.
- Putting database transactions or long business workflows into an edge hook when a regional service or queue is a better fit.
- Measuring only function runtime and ignoring cache hit ratio, invocation frequency, origin fetches, and end-to-end viewer latency.

## Knowledge checks with answers

1. **Which event runs before CloudFront checks its cache?** Viewer request. That makes it suitable for per-viewer request decisions, but it can add work on cache hits too.
2. **Why can an origin-request function have fewer invocations than viewer requests?** CloudFront can satisfy cache hits without going to the origin, so origin-request code is associated with the origin path.
3. **Can a Lambda@Edge function validate a multi-gigabyte upload body?** No. The include-body option exposes bounded data and can truncate large bodies; validate large uploads through a suitable origin or storage workflow.
4. **Why does cache-key design matter when edge code uses cookies?** If responses vary by a cookie but the cache key does not, a cached response can be served to a viewer for whom it was not generated.
5. **What deployment facts must be checked?** Numbered function version, required region, supported runtime and Lambda features, IAM trust role, event limitations, quotas, and current CloudFront configuration.

## Practice

Design a CloudFront path for a multi-tenant image application. Decide which logic belongs in CloudFront Functions, Lambda@Edge, regional Lambda, and the origin. Specify cache key dimensions, tenant authorization, URL rewriting, image transformation, error behavior, body handling, deploy/rollback strategy, and tests that distinguish cache hits from misses. Explain how you prevent one tenant's response from entering another tenant's cache path.
