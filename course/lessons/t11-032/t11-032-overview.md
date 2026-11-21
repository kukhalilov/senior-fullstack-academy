# integer arithmetic, primes, gcd, and modular math — Big-picture orientation and mental model

## Problem and purpose

Number theory turns divisibility, primality, and remainders into efficient algorithms. It appears in array problems, huge exponents, counting, cryptography, and constraints where direct multiplication or enumeration would overflow or take too long.

The core GCD, sieve, and modular patterns are summarized in [USACO Guide divisibility](https://usaco.guide/gold/divisibility) and [USACO Guide modular arithmetic](https://usaco.guide/gold/modular).

## Plain-language mental model

Divisibility asks which whole-number steps land exactly on a value. GCD finds the largest shared step size. Prime numbers are the indivisible building blocks of positive integers. Modular arithmetic groups integers by their remainder after division by a modulus, so large calculations can be kept within a bounded range.

## How the parts fit together

Euclid's algorithm reduces a GCD problem because common divisors of `a` and `b` are exactly common divisors of `b` and `a mod b`. A sieve solves many primality queries together by marking multiples. Binary exponentiation repeatedly squares a base and halves the exponent. Modular inverses allow division only when the divisor has a multiplicative inverse modulo the chosen modulus. These are related tools, but each has preconditions: bounds, primality, coprimality, and safe intermediate arithmetic.

## Concept map

| Goal | Core method | Main condition or cost |
|---|---|---|
| Pairwise common divisor | Euclidean algorithm | `O(log min(a,b))` |
| Many primes below a limit | Sieve of Eratosthenes | `O(n log log n)` time, `O(n)` storage |
| Large exponent | Binary exponentiation | `O(log e)` multiplications |
| Huge exponent given as digits | Process digits by place value | Avoid constructing the exponent |
| Divide modulo `m` | Multiply by modular inverse | Inverse exists iff `gcd(a,m)=1` |
| Count trailing zeros of factorial | Count factors of 5 | Repeated division, logarithmic in `n` |

## End-to-end walkthrough

For `2^100 mod 1337`, do not construct `2^100`. Binary exponentiation repeatedly squares and reduces modulo 1337, keeping every residue bounded. For an exponent supplied as decimal digits, process one digit at a time: if the prefix exponent is `e` and next digit is `d`, the new exponent is `10e+d`, so update the residue as `res^10 * base^d mod 1337`. The same arithmetic works although 1337 is composite; it does not require a modular inverse.

## When to use it and tradeoffs

Use the sieve when many primality answers share a known upper bound; use trial division for one small query. Use Euclid for GCD and extended Euclid when a modular inverse or Diophantine coefficients are needed. Use modular arithmetic to bound values, but reduce only after ensuring the multiplication itself cannot overflow. For large integer inputs in C#, use a wider integer or a safe multiplication technique. Avoid floating-point square roots as exact loop bounds unless corrected with integer comparisons.

## What later lessons cover

The concepts lesson connects divisibility, primality, remainders, exponentiation, and numeric limits. Four reference lessons cover GCD/LCM, sieves/factorization, modular residues/inverses, and combinatorics/safety. Practice applies these ideas to prime counting, powers, factorial zeros, GCD, Bézout's identity, and a decimal-array exponent.
