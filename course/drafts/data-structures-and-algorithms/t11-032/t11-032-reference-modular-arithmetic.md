# integer arithmetic, primes, gcd, and modular math — Reference: Residues, powers, and inverses

## Scope and version

This lesson covers modular arithmetic modulo positive `m`, including composite moduli. See [USACO Guide: Modular arithmetic](https://usaco.guide/gold/modular) and [CP-Algorithms: Modular inverse](https://cp-algorithms.com/algebra/module-inverse.html).

## How this group fits the mental model

Residues let calculations stay bounded while preserving addition and multiplication relationships. Exponentiation can be accelerated by repeated squaring. Division needs more care: replace a denominator only when a multiplicative inverse exists.

## Supplied names explained

- **Modulo equivalence class** — Integers `a` and `b` are congruent modulo `m>0` when `m` divides `a-b`; they have the same canonical remainder class.
- **Normalize negative remainder** — C# remainder may be negative for a negative dividend. For positive `m`, use `((x % m) + m) % m` to obtain a residue in `[0,m-1]`, ensuring the intermediate addition is safe.
- **Modular addition** — `(a+b) mod m` can reduce operands first and add, but the sum must still fit the type. With canonical residues, a wide intermediate or branch-based addition may be needed for very large `m`.
- **Modular subtraction** — `(a-b) mod m` may be negative in C#. Normalize it or use `(a-b+m)%m` only when `a-b+m` is proven safe and operands are canonical.
- **Modular multiplication** — Reduce operands and compute their product modulo `m`; the product can overflow before reduction. Use a wider type, arbitrary precision, or a safe multiplication algorithm depending on bounds.
- **Binary exponentiation** — Compute powers by squaring the base and halving a nonnegative exponent, multiplying the result when a bit is set. Modular reduction after each multiplication bounds residues; complexity is `O(log e)` multiplications.
- **Modular inverse** — `a^-1 mod m` satisfies `a*a^-1 ≡ 1 (mod m)`. It exists exactly when `gcd(a,m)=1`; it is not ordinary division.
- **Extended-Euclid inverse for coprime modulus** — Extended Euclid gives `ax+my=gcd(a,m)`. When the GCD is one, `x mod m` is the inverse. This supports composite moduli when the operand is coprime.
- **Fermat inverse for prime modulus** — For prime `p` and `a mod p != 0`, Fermat's little theorem gives `a^(p-2) mod p` as the inverse. This is not a general inverse formula for composite moduli.
- **Modular division preconditions** — To divide by `b` modulo `m`, require `gcd(b,m)=1`, then multiply by its inverse. If no inverse exists, the division operation may have no solution or multiple solutions; ordinary division is invalid.

## Cross-item comparison

Binary exponentiation is a way to compute powers, not a method for proving a value invertible. Fermat's formula requires a prime modulus and nonzero residue; extended Euclid works for any positive modulus when coprimality holds. Modular addition/multiplication preserve congruence, while division needs the extra inverse condition.

## Examples

Modulo 7, the inverse of 3 is 5 because `3*5=15 ≡ 1`. Modulo 8, 3 has inverse 3, but 2 has none because `gcd(2,8)=2`. Thus `1/2 mod 8` is not defined as multiplication by a unique inverse.

## Common mistakes

- Dividing residues as ordinary integers.
- Applying Fermat's exponent `p-2` when the modulus is composite or the residue is zero.
- Assuming `%` always returns a nonnegative result in C#.
- Multiplying two large residues in `long` without checking their product bound.
- Using a prime modulus in a proof when the problem supplies a composite one.

## Knowledge checks with answers

1. **When does `a` have an inverse modulo `m`?** Exactly when `gcd(a,m)=1`.
2. **Does 2 have an inverse modulo 8?** No.
3. **What does Fermat give for nonzero `a mod p`?** The inverse `a^(p-2) mod p`, when `p` is prime.
