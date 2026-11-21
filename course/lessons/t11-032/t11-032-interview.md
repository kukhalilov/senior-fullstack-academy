# integer arithmetic, primes, gcd, and modular math — Interview questions and reasoning

## Core questions

These number-theory interview topics follow [USACO Guide divisibility](https://usaco.guide/gold/divisibility) and [USACO Guide modular arithmetic](https://usaco.guide/gold/modular).

1. Why does Euclid's algorithm preserve the GCD?
2. When is a sieve preferable to trial division?
3. How does binary exponentiation reduce work?
4. When can you divide modulo `m`?
5. How do you count trailing zeroes in `n!`?
6. What numeric hazards remain after taking residues?

## Concise interview answers

1. `gcd(a,b)=gcd(b,a mod b)` because both pairs have the same common divisors.
2. A sieve is preferable when many primality queries share a bounded dense range; trial division suits isolated small values.
3. Square the base and halve the exponent, multiplying into the result for set exponent bits; this uses `O(log n)` multiplications.
4. Only when the divisor has a modular inverse, exactly when it is coprime to the modulus.
5. Count multiples of 5, then extra factors from 25, 125, and higher powers by repeated division.
6. A product can overflow before `%` reduces it; use a proven wider type or a safe multiplication method.

## Deep follow-up answers

**Does Fermat's inverse work for any modulus?** No. For prime `p`, nonzero `a mod p` has inverse `a^(p-2)`. For a composite modulus, an inverse exists exactly when `gcd(a,m)=1`, and extended Euclid can compute it. If the GCD is not one, modular division by that value is not valid as a unique inverse operation.

**Why does `Pow(x,n)` need a wider exponent?** `int.MinValue` has magnitude `2^31`, which does not fit in positive `int`. Widen to `long` before negating. Separately, the output is floating point, so tiny results can underflow and comparisons need tolerance.

**Why is the `n!` zero count a sum of quotients?** Every zero uses one factor 5 paired with a factor 2. Multiples of 25 contribute two fives, 125 contribute three, and so on; summing `floor(n/5^k)` counts each factor once.

**How can a huge decimal exponent be processed?** If a processed prefix is exponent `e` and the next decimal digit is `d`, the new exponent is `10e+d`, so update `r` to `r^10*a^d mod m`. This does not require the modulus to be prime or the base to have an inverse.

## Scenario questions

1. A GCD loop checks divisors until `d*d <= n`. What happens near integer limits, and how can the comparison be made safe?
2. A combination solution uses factorial inverses under modulus 12. Which assumption fails?
3. A modular multiply takes `long` operands and applies `%` afterward. What product bound must be proved first?
4. An LCM implementation multiplies before dividing by GCD. Give a case where its intermediate overflows although the final LCM fits.

## Tradeoffs and alternatives

Trial division uses little setup; a sieve spends `O(n)` storage to answer a whole bounded range. SPF preprocessing accelerates many factor queries but is wasteful for one. Fermat inverses are simple and fast for prime moduli; extended Euclid also handles composite moduli when coprime. Pascal's recurrence avoids modular division but uses table space and can have large exact values; factorial tables answer many combinations quickly under strict prime/index conditions.

## Common weak answers

- “Take modulo after multiplication” without bounding the intermediate.
- Applying Fermat to a composite modulus.
- Calling a nonzero residue invertible without checking its GCD with the modulus.
- Using `Math.Abs(int.MinValue)` or `-int.MinValue` in `int`.
- Using a floating-point square root as an unchecked exact boundary.
- Constructing an enormous factorial or decimal exponent directly.

## Self-check rubric

Score each from 0 (missing) to 2 (clear and correct): GCD invariant; sieve boundary; exponentiation invariant; inverse preconditions; overflow reasoning; signed edge cases; complexity. A strong answer scores at least 11/14 and states when a shortcut's assumptions fail.
