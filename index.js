"use strict";

/**
 * ConvChain constructor
 * @param {Array|Uint8Array} sample Sample pattern as a flat array or a 2D array
 * @param {int|Array} [sampleSize] Indicate the width and height of the sample when used with a flat array, if omitted assume the sample is a square
 * @constructor
 */
var ConvChain = function ConvChain (sample, sampleSize) {
    this.setSample(sample, sampleSize);
};

/**
 * Set the sample pattern
 * @param {Array|Uint8Array} sample Sample pattern as a flat array or a 2D array
 * @param {int|Array} [sampleSize] When used with a flat array indicate the width and height of the sample, if omitted assume the sample is a square
 */
ConvChain.prototype.setSample = function (sample, sampleSize) {
    if (typeof sample[0] === 'number') {
        // assume flat array
        this.sample = sample;

        if (!sampleSize) {
            // assume square sample

            this.sampleWidth = this.sampleHeight = Math.sqrt(sample.length) | 0;
        } else {
            this.sampleWidth = typeof sampleSize === 'number' ? sampleSize : sampleSize[0];
            this.sampleHeight = typeof sampleSize === 'number' ? sampleSize : sampleSize[1];
        }
    } else {
        // assume 2D array
        this.sampleWidth = sample[0].length;
        this.sampleHeight = sample.length;

        var flatArray = new Uint8Array(this.sampleWidth * this.sampleHeight),
            x,
            y;

        for (y = 0; y < this.sampleHeight; y++) {
            for (x = 0; x < this.sampleWidth; x++) {
                flatArray[x + y * this.sampleWidth] = sample[y][x];
            }
        }

        this.sample = flatArray;
    }
};

/**
 * Generate a pattern based on the sample pattern
 * @param {int|Array} resultSize Width and height of the generated pattern
 * @param {int} n Receptor size, an integer greater than 0
 * @param {float} temperature Temperature, a value between 0 and 1
 * @param {int} iterations Number of iterations
 * @param {function} [rng] A random number generator, default to Math.random
 * @returns {Uint8Array} Generated pattern, returned as a flat Uint8Array
 */
ConvChain.prototype.generate = function (resultSize, n, temperature, iterations, rng) {
    var sample = this.sample,
        sampleWidth = this.sampleWidth,
        sampleHeight = this.sampleHeight,
        resultWidth = typeof resultSize === 'number' ? resultSize : resultSize[0],
        resultHeight = typeof resultSize === 'number' ? resultSize : resultSize[1],
        field = new Uint8Array(resultWidth * resultHeight),
        weights = new Float32Array(1 << (n * n)),
        k,
        x,
        y;

    n = Math.max(n, 1);
    rng = rng || Math.random;

    var pattern = function pattern (fn) {
        var result = new Array(n * n),
            x,
            y;

        for (y = 0; y < n; y++) {
            for (x = 0; x < n; x++) {
                result[x + y * n] = fn(x, y);
            }
        }

        return result;
    };

    var rotate = function rotate (p) {
        return pattern(function (x, y) { return p[n - 1 - y + x * n]; });
    };

    var reflect = function reflect (p) {
        return pattern(function (x, y) { return p[n - 1 - x + y * n]; });
    };

    var index = function index (p) {
        var result = 0,
            power = 1,
            i;

        for (i = 0; i < p.length; i++) {
            result += p[p.length - 1 - i] ? power : 0;
            power *= 2;
        }

        return result;
    };

    for (y = 0; y < sampleHeight; y++) {
        for (x = 0; x < sampleWidth; x++) {
            var p0 = pattern(function (dx, dy) { return sample[((x + dx) % sampleWidth) + ((y + dy) % sampleHeight) * sampleWidth]; }),
                p1 = rotate(p0),
                p2 = rotate(p1),
                p3 = rotate(p2),
                p4 = reflect(p0),
                p5 = reflect(p1),
                p6 = reflect(p2),
                p7 = reflect(p3);

            weights[index(p0)] += 1;
            weights[index(p1)] += 1;
            weights[index(p2)] += 1;
            weights[index(p3)] += 1;
            weights[index(p4)] += 1;
            weights[index(p5)] += 1;
            weights[index(p6)] += 1;
            weights[index(p7)] += 1;
        }
    }

    for (k = 0; k < weights.length; k++) {
        if (weights[k] <= 0) {
            weights[k] = 0.1;
        }
    }

    for (y = 0; y < resultHeight; y++) {
        for (x = 0; x < resultWidth; x++) {
            field[x + y * resultWidth] = rng() < 0.5;
        }
    }

    for (k = 0; k < iterations * resultWidth * resultHeight; k++) {
        var r = (rng() * resultWidth * resultHeight) | 0,
            q = 1,
            sy,
            sx,
            dy,
            dx,
            ind,
            difference;

        x = (r % resultWidth) | 0;
        y = (r / resultWidth) | 0;

        for (sy = y - n + 1; sy <= y + n - 1; sy++) {
            for (sx = x - n + 1; sx <= x + n - 1; sx++) {
                ind = 0;
                difference = 0;

                for (dy = 0; dy < n; dy++) {
                    for (dx = 0; dx < n; dx++) {
                        var power = 1 << (dy * n + dx),
                            X = sx + dx,
                            Y = sy + dy,
                            value;

                        if (X < 0) {
                            X += resultWidth;
                        } else if (X >= resultWidth) {
                            X -= resultWidth;
                        }

                        if (Y < 0) {
                            Y += resultHeight;
                        } else if (Y >= resultHeight) {
                            Y -= resultHeight;
                        }

                        value = field[X + Y * resultWidth];

                        ind += value ? power : 0;

                        if (X === x && Y === y) {
                            difference = value ? power : -power;
                        }
                    }
                }

                q *= weights[ind - difference] / weights[ind];
            }
        }


        if (q >= 1) {
            field[x + y * resultWidth] = !field[x + y * resultWidth];
            continue;
        }

        if (temperature != 1) {
            q = Math.pow(q, 1.0 / temperature);
        }

        if (q > rng()) {
            field[x + y * resultWidth] = !field[x + y * resultWidth];
        }
    }

    return field;
};

module.exports = ConvChain;
