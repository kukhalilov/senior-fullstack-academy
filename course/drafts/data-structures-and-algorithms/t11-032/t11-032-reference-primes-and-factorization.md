# integer arithmetic, primes, gcd, and modular math — Reference: Primality, sieves, and factorization

## Scope and version

These algorithms concern positive integers and bounded ranges. See [CP-Algorithms: Sieve of Eratosthenes](https://cp-algorithms.com/algebra/sieve-of-eratosthenes.html) and [USACO Guide: Divisibility](https://usaco.guide/gold/divisibility).

## How this group fits the mental model

Trial division answers one primality query by checking possible factors. A sieve answers all queries up to a bound by sharing factor work. Factorization exposes the prime exponents underlying divisor counts and LCM/GCD.

## Supplied names explained

- **Trial-division primality test** — For integer `n>1`, test divisors from 2 upward until one divides or the candidate exceeds the square-root boundary. If none divides, `n` is prime.
- **Square-root trial bound** — A composite `n=ab` has at least one factor no greater than `sqrt(n)`. Use `d <= n/d` for positive integers to avoid overflow in `d*d`; handle small `n` first.
- **Sieve of Eratosthenes** — Mark composites up to a limit; each unmarked value greater than one is prime. It answers all range primality queries efficiently.
- **Composite multiple marking from p squared** — For prime `p`, begin at `p*p`; multiples `2p` through `(p-1)p` already have smaller prime factors. Use a wide type for the initial product when limits could overflow.
- **O(n log log n) sieve bound** — The marking work sums roughly `n/p` for primes `p<=sqrt(n)`, yielding `O(n log log n)` time and `O(n)` memory for the straightforward sieve.
- **Prime factorization** — Repeatedly divide by prime factors and record exponents; any remaining value greater than one is prime. Trial factorization is `O(sqrt(n))` divisions in a basic implementation.
- **Smallest-prime-factor table** — Precompute the smallest prime divisor for each value up to a maximum. Factor each bounded value by repeated SPF lookup and division; preprocessing costs additional memory and time.
- **Divisor enumeration from prime exponents** — If `n=product p_i^e_i`, each divisor independently chooses an exponent from zero through `e_i`, so there are `product(e_i+1)` positive divisors. Generate these products carefully within numeric bounds.
- **Prime-counting prefix array** — After a sieve, define `prefix[x]` as the number of primes up to a chosen boundary (state whether inclusive). Then interval counts are prefix differences with adjusted endpoints.
- **Integer multiplication overflow in p squared** — `p*p` can overflow before comparison in fixed-width types. Promote before multiplying or use a bound such as `p <= limit/p`.

## Cross-item comparison

Trial division is suitable for isolated small numbers; a sieve amortizes work over a dense bounded range. SPF tables are useful when many factorizations are needed; a single factorization may not justify their setup. Both sieves and factorization depend on limits that make storage and intermediate products safe.

## Examples

For 84, divide by 2 twice to get 21, then by 3 and 7: `84=2^2*3*7`. Its divisor count is `(2+1)(1+1)(1+1)=12`. In a sieve through 20, mark multiples of 2 from 4, of 3 from 9, then of 5 from 25 which is already beyond the limit; unmarked values above one are primes.

## Common mistakes

- Declaring 1 prime or treating values below 2 as candidates.
- Testing divisors through `n` instead of through `sqrt(n)`.
- Starting marks at `2p` instead of `p²` (still correct but repeats work).
- Overflowing `p*p` before the bound check.
- Defining prefix counts inconsistently at interval endpoints.
- Forgetting a remaining factor greater than one after trial divisions.

## Knowledge checks with answers

1. **Why is checking through the square root enough?** Factors above it pair with a factor below it.
2. **Why start marking at `p²`?** Smaller multiples have already been marked by smaller primes.
3. **How many divisors has `2²*3*7`?** 12.
