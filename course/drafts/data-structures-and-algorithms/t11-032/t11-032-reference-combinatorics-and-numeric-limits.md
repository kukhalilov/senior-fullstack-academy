# integer arithmetic, primes, gcd, and modular math — Reference: Combinations, constraints, and numeric safety

## Scope and version

This lesson covers binomial coefficients and implementation boundaries, not advanced combinatorics. See [USACO Guide modular arithmetic](https://usaco.guide/gold/modular) and [USACO Guide combinatorics](https://github.com/cpinitiative/usaco-guide/blob/master/content/4_Gold/Combinatorics.mdx).

## How this group fits the mental model

Combinatorial counts often grow beyond machine integers, so a problem may request a residue. The algebra used to compute that residue must respect the modulus's properties and the range of every factorial and product.

## Supplied names explained

- **Factorial** — `n!` is the product of integers from 1 through `n`, with `0!=1`. Its size grows rapidly and exceeds fixed-width integer ranges at small `n`.
- **Binomial coefficient** — `C(n,k)=n!/(k!(n-k)!)` counts ways to choose `k` of `n` items. It is symmetric in `k` and `n-k`; use `k=min(k,n-k)` for multiplicative methods.
- **Pascal recurrence** — `C(n,k)=C(n-1,k-1)+C(n-1,k)` with boundary values `C(n,0)=C(n,n)=1`. It avoids division but a table may take `O(nk)` time/space and values can still overflow unless reduced safely.
- **Factorial and inverse-factorial tables** — Under a prime modulus `p` and maximum index `N<p`, precompute factorials and inverse factorials; then `C(n,k)=fact[n]*invFact[k]*invFact[n-k] mod p`. This formula needs invertibility and safe modular multiplication.
- **Prime-modulus assumption** — Fermat-based inverses and common factorial table formulas rely on `p` being prime. Composite moduli need different methods and may have noninvertible factorial residues.
- **Index below prime modulus assumption** — If `n>=p`, then `n!` is divisible by `p` and is zero modulo `p`, so its inverse does not exist. For larger indices use a method that handles base-`p` digits or prime factors, if constraints require it.
- **Overflow-safe multiplication** — Promote operands before multiplying when a wider type suffices; otherwise use repeated doubling/addition or big integers. Reducing after overflow cannot recover lost information.
- **Signed absolute-value minimum edge case** — `int.MinValue` has no positive magnitude representable in `int`; `Math.Abs(int.MinValue)` throws in checked behavior or cannot represent the value. Widen first or special-case it.
- **Integer square-root boundary** — To check `d*d <= n`, widen the product or use `d <= n/d` for positive `d`. Floating-point square roots can round around perfect squares; verify with integer arithmetic.
- **Floating-point rounding hazard** — Floating-point values cannot represent every large integer exactly. Do not use `double` multiplication or `sqrt` as an unchecked substitute for exact integer bounds.

## Cross-item comparison

Pascal recurrence avoids modular division but uses a table and may have large intermediate values. Factorial/inverse-factorial tables make many queries fast but require prime and index conditions. Multiplicative formulas can reduce memory but require exact cancellation or modular inverse reasoning. Numeric safety is part of the proof, not a final implementation detail.

## Examples

For `C(5,2)`, Pascal gives `C(4,1)+C(4,2)=4+6=10`. Under prime modulus 7, factorial method gives `120 * inv(2) * inv(6) mod 7`; it is valid because 5<7 and denominators are nonzero modulo 7. At `n=7`, `7! mod 7=0`, so it cannot have an inverse.

## Common mistakes

- Computing factorials in a fixed-width type before taking the modulus.
- Dividing by `k!` modulo a composite modulus without proving it invertible.
- Applying an inverse-factorial table when the largest index is at least the prime modulus.
- Reducing an already overflowed multiplication.
- Comparing `d*d` in the same narrow type without checking overflow.
- Taking `Math.Abs` of the minimum signed integer in its own type.

## Knowledge checks with answers

1. **Why must inverse factorial indices remain below prime `p` in this method?** At or above `p`, factorial is zero modulo `p` and has no inverse.
2. **What safer trial-division condition avoids `d*d` overflow?** `d <= n/d` for positive `d`.
3. **Why can Pascal recurrence still overflow?** Its exact integer coefficients can be very large before any modular reduction.
