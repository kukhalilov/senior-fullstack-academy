# integer arithmetic, primes, gcd, and modular math — Core concepts and how they fit together

## Learning objectives

Derive Euclid's GCD recurrence, recognize when a sieve beats repeated primality tests, use binary exponentiation, state the exact modular-inverse condition, and check numeric bounds before applying algebraic shortcuts.

## Prerequisites

You should know integer division and remainder, factors and multiples, arrays, loops, and logarithmic complexity. In C#, integer division truncates toward zero, and `%` can be negative when its left operand is negative.

The general algorithm background is covered in [USACO Guide divisibility](https://usaco.guide/gold/divisibility) and [USACO Guide modular arithmetic](https://usaco.guide/gold/modular). Microsoft's [C# arithmetic-operator reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/division-operator) documents truncation-toward-zero division and remainder sign; [`Math.Abs`](https://learn.microsoft.com/en-us/dotnet/api/system.math.abs?view=net-10.0) documents the minimum-value overflow exception.

## Core concepts

**GCD and LCM.** The GCD is the greatest positive common divisor. Euclid's recurrence `gcd(a,b)=gcd(b,a mod b)` ends when the second value is zero. For nonnegative inputs, `gcd(0,a)=a`; define `gcd(0,0)` explicitly for an API, since mathematical conventions differ. The LCM for nonzero integers is `abs((a/gcd(a,b))*b)`; divide first to reduce intermediate magnitude and handle a zero input separately.

**Primes and factorization.** A composite positive integer has a factor no larger than its square root, so trial division checks candidates only while `d <= n/d` (avoiding overflow from `d*d`). A sieve marks multiples of each prime beginning at `p*p`, because smaller multiples already have a smaller prime factor. Repeated factor division yields prime exponents; an SPF table accelerates many factorizations up to a fixed limit.

**Residues.** Congruence modulo `m>0` groups values with the same remainder. Addition, subtraction, and multiplication respect congruence, but in fixed-width arithmetic `a*b` may overflow before `%m` runs. For a possibly negative remainder in C#, normalize with `((x % m) + m) % m` using a type wide enough for the addition.

**Exponentiation and inverses.** Binary exponentiation squares the base and consumes exponent bits, using logarithmically many multiplications. A modular inverse of `a` modulo `m` is a residue `x` with `ax ≡ 1 (mod m)`; it exists exactly when `gcd(a,m)=1`. If `m=p` is prime and `a` is not divisible by `p`, Fermat gives `a^(p-2)` as the inverse. Prime-modulus shortcuts cannot be applied to a composite modulus.

## Mechanisms and relationships

For factorial zeros, each zero requires a factor pair 2 and 5; factorials contain more factors of 2, so count the factors of 5: `floor(n/5)+floor(n/25)+...`. For modular combinations, factorial and inverse-factorial tables use `n!` and `(n!)^-1`; the common Fermat method requires a prime modulus and every factorial index below that prime so its residue is nonzero and invertible.

For extended Euclid, coefficients `x,y` satisfy `ax+by=gcd(a,b)`. Therefore an integer combination can equal one exactly when the GCD of the participating values is one. This is the criterion in the good-array problem.

## Worked examples

`gcd(48,18)=gcd(18,12)=gcd(12,6)=gcd(6,0)=6`. The LCM is `(48/6)*18=144`.

To find primes below 10, initialize 2 through 9 as candidates. For prime 2 mark 4,6,8; for 3 mark 9; no further unmarked prime needs marking. The unmarked values 2,3,5,7 are the four primes strictly below 10.

## Misconceptions and edge cases

- Modular division is not ordinary integer division followed by `%`.
- A nonzero residue is not always invertible for composite modulus; require coprimality.
- Fermat inverse `a^(p-2)` requires prime `p` and `a mod p != 0`.
- Reducing operands does not guarantee their product fits the machine type.
- `p*p` can overflow before a loop comparison; use a wider type or division-based bound.
- `Math.Abs(int.MinValue)` throws `OverflowException` because its positive magnitude is not representable as `int`.
- Floating-point `sqrt` can round near an integer boundary; verify with integer multiplication in a wider type.

## Knowledge checks with answers

1. **Why can Euclid replace `(a,b)` with `(b,a%b)`?** The common divisors are unchanged by subtracting a multiple of `b` from `a`.
2. **When does a modular inverse exist?** Exactly when the value and modulus are coprime.
3. **Why divide before multiplying for LCM?** It reduces the intermediate and therefore overflow risk.
4. **Why does the sieve start at `p*p`?** Smaller multiples already have a smaller prime factor and have been marked.
