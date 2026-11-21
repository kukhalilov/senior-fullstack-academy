
# JavaScript declarations, bindings, scope, and closures — Exercises and worked solutions

# Goals

Practice predicting which binding an identifier resolves to, when it becomes initialized, what scope a declaration uses, how closures observe changing values, and why scripts and modules differ.

# Worked example

```js
function makePair(start) {
  let value = start;
  return [() => value, next => { value = next; }];
}
const [read, write] = makePair(3);
write(8);
console.log(read()); // 8
```

`makePair` creates the binding `value`. Both returned functions were created in that lexical environment, so both access the same binding. The closure does not hold the initial value `3` as an immutable snapshot.

# Exercises

Predict each result before reading the solutions. Each snippet is independent. Unless stated, assume modern ECMAScript.

## Exercise 1: `var` initialization and scope

```js
function sample() {
  console.log(value);
  if (false) {
    var value = 12;
  }
}
sample();
```

Does this throw? Why is the declaration inside an unreachable block still relevant?

## Exercise 2: temporal dead zone and `typeof`

```js
console.log(typeof missingName);
{
  // console.log(typeof mode);
  let mode = "dark";
}
```

What does the first expression produce? What happens if the commented line is uncommented?

## Exercise 3: `const` binding versus object mutation

```js
const user = { name: "Ari" };
user.name = "Bo";
console.log(user.name);
// user = { name: "Cy" };
```

Which operation is allowed, and what error category applies if the reassignment line runs in an ES module?

## Exercise 4: block scope

```js
{
  var shared = "var";
  let local = "let";
}
console.log(shared);
// console.log(local);
```

What is printed, and what happens if the second log runs?

## Exercise 5: closures in loops

```js
const readers = [];
for (let i = 0; i < 3; i += 1) readers.push(() => i);
console.log(readers.map(read => read()));
```

What changes if `let` is replaced with `var`?

## Exercise 6: global script versus module

In a browser classic script, compare:

```js
var visible = 1;
let hidden = 2;
console.log(globalThis.visible, globalThis.hidden);
```

What common result should you expect? Why should this not be copied as a module-level rule?

## Exercise 7: declaration conflict

```js
let state = "ready";
var state = "running";
```

Does the second declaration execute and overwrite the first? Explain the phase and error type.

## Exercise 8: live closure binding

```js
function makeReader() {
  let status = "pending";
  const read = () => status;
  status = "complete";
  return read;
}
console.log(makeReader()());
```

Does the returned closure see the value from its creation moment or the later assignment?

## Exercise 9: function declaration in a block

```js
{
  function inside() { return 4; }
  console.log(inside());
}
// console.log(typeof inside);
```

Explain modern block scope and why a classic non-strict browser script has a limited compatibility caveat.

# Progressive hints

1. **Exercise 1:** `var` is scoped to the function and initialized before execution reaches the declaration.
2. **Exercise 2:** `typeof` distinguishes an unresolvable name from a lexical binding that exists but is uninitialized.
3. **Exercise 3:** `const` prevents reassignment to the binding; it does not freeze the object.
4. **Exercise 4:** Braces create lexical scope, not a new function variable environment.
5. **Exercise 5:** Ask whether each loop iteration creates a distinct binding or mutates one shared binding.
6. **Exercise 6:** Classic scripts use a Global Environment Record with separate object/declarative components; modules have module bindings.
7. **Exercise 7:** Redeclaration conflicts are checked before statement execution.
8. **Exercise 8:** Closures access bindings, which can change.
9. **Exercise 9:** Modern block declarations stay in their block; Annex B narrowly modifies some web-script cases.

# Complete solutions

## Solution 1

It prints `undefined`. `var value` is scoped to the function and its binding is initialized to `undefined` during declaration instantiation. The initializer `= 12` is never evaluated because the branch is false. A block does not contain a `var` declaration.

## Solution 2

The first expression prints `"undefined"` because `missingName` is unresolvable. Uncommenting the line throws `ReferenceError`: the lexical binding `mode` is already in scope but has not been initialized. The TDZ rule applies even to `typeof`.

## Solution 3

Changing `user.name` is allowed and the first log prints `"Bo"`. Reassigning the `const` binding is forbidden. In an ES module (strict code), executing that assignment throws `TypeError`; a parse-time declaration conflict would instead be a `SyntaxError`.

## Solution 4

The first log prints `"var"`, because `var` uses the surrounding variable environment. The second log throws `ReferenceError`, because `local` is scoped to the block and the reference occurs outside it.

## Solution 5

The result is `[0, 1, 2]`: `let` creates a per-iteration binding, and each arrow closes over its iteration's `i`. With `var`, the callbacks share one binding. After the loop it is `3`, so the result is `[3, 3, 3]`.

## Solution 6

In a fresh browser classic-script global environment, the common result is `1 undefined`: the eligible `var` declaration is associated with the global object's object component, whereas the `let` binding is in the global declarative component. Modules do not create such global declarations; both names are module-local.

## Solution 7

The code fails with a `SyntaxError` during declaration validation; the second declaration does not execute. A lexical declaration and a conflicting `var` declaration cannot bind the same name in that applicable scope. A `var` initializer assigning an already declared `let` variable would be different syntax and would still be invalid as a redeclaration.

## Solution 8

It prints `"complete"`. `read` closes over the `status` binding, and that binding is changed before the function is called. Closures preserve lexical access, not a snapshot of the string.

## Solution 9

Inside the block, `inside()` prints `4`. In modern semantics, the block declaration is scoped to the block, so outside `inside` is ordinarily unresolvable (`typeof inside` would be `"undefined"`). Annex B supplies selected web-compatibility behavior for eligible non-strict scripts; module and strict-code behavior does not use that same legacy extension. Avoid relying on it.

# Tests and edge cases

```js
import assert from "node:assert/strict";

function makePair() {
  let value = 1;
  return { read: () => value, set: next => { value = next; } };
}
const pair = makePair();
pair.set(5);
assert.equal(pair.read(), 5);

const perIteration = [];
for (let i = 0; i < 2; i += 1) perIteration.push(() => i);
assert.deepEqual(perIteration.map(read => read()), [0, 1]);

function varHoist() { return value; var value = 2; }
assert.equal(varHoist(), undefined);
```

Run module tests in a fresh module scope; do not use them to demonstrate sloppy mapped arguments or classic-script global-object declarations. Those require the correct execution context.

# Reflection questions

1. Is a bug caused by the wrong binding, or by reading the right binding before initialization?
2. Does a closure need to observe later updates, or should the program explicitly copy a snapshot?
3. Would a smaller block or function scope make ownership clearer?
4. Is an example relying on browser classic-script behavior that differs in modules?
5. Could a captured reference keep an unnecessarily large object graph reachable?

# Reflection answers

1. First check whether the identifier resolves to the intended binding; then check whether that binding has initialized before the read. A correct binding can still be read too early and throw in the TDZ.
2. A closure normally observes the current value of its captured binding. If the desired behavior is a snapshot, copy the needed primitive or object state explicitly when creating the callback.
3. Narrow blocks or functions can make ownership and lifetime clearer, reduce accidental name collisions, and make TDZ/read-order mistakes easier to see.
4. Yes. Classic scripts and modules have different top-level environments and strictness rules; test or explain global-object behavior only in the intended execution context.
5. Yes. A reachable closure may keep references alive; capture only the state the callback needs and release references when the callback is no longer needed.

# Sources

- [ECMAScript 2026: Executable Code and Execution Contexts](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- [ECMAScript 2026: Declarations and the Variable Statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026: Scripts and Modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
- [MDN: `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
