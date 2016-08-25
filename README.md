# convchain

Vanilla javascript port of [ConvChain](https://github.com/mxgmn/ConvChain).

[Interactive demo](http://www.kchapelier.com/convchain-demo/)

## Installing and testing

With [npm](http://npmjs.org) do:

```
npm install convchain
```

## Basic example

```js
var ConvChain = require('convchain');

var samplePattern = Uint8Array.from([
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 0, 0, 0, 0, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1
]);

var width = 45,
    height = 20;

var convChain = new ConvChain(samplePattern);

var generatedPattern = convChain.generate([width, height], 3, 0.5, 4); // a flat Uint8Array

// some code to display the result
for (var y = 0; y < height; y++) {
    var s = '';
    for (var x = 0; x < width; x++) {
        s += ' ' + generatedPattern[x + y * width];
    }
    console.log(s);
}
```

## Public API

### Constructor

**new ConvChain(sample[, sampleSize])**

 - *sample :* Sample pattern as a flat array or a 2D array.
 - *sampleSize :* Indicate the width and height of the sample when used with a flat array, if omitted the sample pattern is assumed to be a square.

```js
var testSample = Uint8Array.from([
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
]); //flat array

var convChain = new ConvChain(testSample, [14, 10]);
```

```js
var testSample = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]; //2D array

var convChain = new ConvChain(testSample);
```

### Methods

**convChain.setSample(sample[, sampleSize])**

Same arguments as the constructor.

**convChain.generate(resultSize, n, temperature, iterations[, rng])**

Generate a new pattern based on the sample pattern. The generated pattern is returned as a flat Uin8Array.

 - *resultSize :* Width and height of the generated pattern.
 - *n :* Receptor size, an integer greater than 0.
 - *temperature :* Temperature, a float.
 - *iterations :* Number of iterations.
 - *rng :* A function to use as random number generator, defaults to Math.random.

```js
var result = convChain.generate([100, 50], 3, 0.5, 4);
```

**convChain.iterate(field, resultSize, n, temperature[, tries[, rng]])**

Execute a specific number of operations on a given pattern.

 - *field :* An existing pattern given as a flat Uint8Array. If *null* is given, a noisy pattern will be used instead.
 - *resultSize :* Width and height of the generated pattern.
 - *n :* Receptor size, an integer greater than 0.
 - *temperature :* Temperature, a float.
 - *tries :* Number of operations to execute, default to the result's width multiplied by the result's height
 - *rng :* A function to use as random number generator, defaults to Math.random.

```js
var field = null;

for (var i = 0; i < 32; i++) {
    field = convChain.iterate(field, [64, 64], 3, 0.2, 128);

    // ... do something with the return pattern here
}
```

## Changelog

### [1.1.0](https://github.com/kchapelier/convchain/tree/1.1.0) (2018-08-25)

 * Implement the iterate method.

### [1.0.0](https://github.com/kchapelier/convchain/tree/1.0.0) (2018-08-21)

 * First implementation.

### License

MIT
