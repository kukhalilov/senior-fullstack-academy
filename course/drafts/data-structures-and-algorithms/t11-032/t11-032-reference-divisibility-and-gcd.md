# integer arithmetic, primes, gcd, and modular math — Reference: Divisibility, GCD, LCM, and Euclid

## Scope and version

This is mathematical number theory; integer overflow and signed absolute-value behavior are called out for C# implementations. See [USACO Guide: Divisibility](https://usaco.guide/gold/divisibility) and [CP-Algorithms: Euclidean algorithm](https://cp-algorithms.com/algebra/euclid-algorithm.html).

## How this group fits the mental model

Divisors describe exact integer scaling. GCD summarizes shared divisibility, and LCM summarizes the smallest positive number divisible by both nonzero inputs. Euclid computes GCD by reducing the magnitude of the second argument on each step.

## Supplied names explained

- **Divisor and multiple** — `d` divides `n` when `n=dq` for an integer `q`; then `d` is a divisor and `n` a multiple. For positive values, divisor pairs can be checked only through the square root.
- **Greatest common divisor** — The largest positive integer dividing both inputs, defined for nonnegative inputs with at least one nonzero by the usual nonnegative result.
- **Euclidean algorithm** — Repeatedly set `(a,b)` to `(b,a mod b)` until `b==0`; the remaining `a` is the GCD. Each remainder is smaller, giving logarithmic iterations.
- **Extended Euclidean algorithm** — Computes `g=gcd(a,b)` and coefficients `x,y` with `ax+by=g`. It supports modular inverses and solves linear Diophantine equations when the target is divisible by `g`.
- **Least common multiple** — For nonzero integers, `lcm(a,b)=abs((a/gcd(a,b))*b)`. The zero case is conventionally zero. Divide by the GCD before multiplying to lower overflow risk, but still use a wide type or checked bound when the product may exceed it.
- **gcd(0,a) convention** — For `a>0`, `gcd(0,a)=a`; `gcd(0,0)` is often defined as zero in programming libraries, though the “largest positive common divisor” definition does not give a unique value there. State the chosen contract.
- **Coprime integers** — Their GCD is one. This is exactly the condition for an integer linear combination to equal one and for a residue to have an inverse modulo the other value.
- **Reduce before multiply to limit overflow** — Compute `(a/g)*b`, not `(a*b)/g`. This reduces but does not eliminate overflow; an answer may still exceed the destination type.
- **GCD of array by fold** — Start with the first value and replace the accumulator by `gcd(accumulator,next)` for each element. The result is the common divisor of the whole array.
- **GCD and linear Diophantine connection** — Equation `ax+by=c` has integer solutions iff `gcd(a,b)` divides `c`; Bézout coefficients produce a solution when divisible.

## Cross-item comparison

Euclid returns only the divisor; extended Euclid also returns coefficients and costs the same asymptotic number of divisions. Coprimality is a GCD predicate. LCM uses GCD to avoid duplicate prime factors, and divide-before-multiply is an overflow mitigation rather than a proof of safety.

## Examples

`gcd(48,18)=6`, with `48=6*8` and `18=6*3`; the LCM is `(48/6)*18=144`. For 6 and 10, Bézout's identity gives `2*6 + (-1)*10 = 2`; no integer combination equals 1 because their GCD is 2.

## Common mistakes

- Taking modulo by zero in Euclid's loop.
- Returning a negative GCD because inputs can be negative without normalizing signs.
- Computing `abs(int.MinValue)` in `int`.
- Multiplying before dividing by GCD.
- Assuming the reduced LCM multiplication cannot overflow.
- Treating a Bézout coefficient as unique; infinitely many representations may exist.

## Knowledge checks with answers

1. **What is `gcd(0,15)`?** 15.
2. **When does `ax+by=c` have integer solutions?** When `gcd(a,b)` divides `c`.
3. **Does divide-before-multiply guarantee no overflow?** No; it only lowers intermediate magnitude.
