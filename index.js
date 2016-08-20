"use strict";

var ConvChain = function ConvChain(source) {
    this.source = source;
};

ConvChain.prototype.execute = function (n, temperature, size, iterations, rng) {
    rng = rng || Math.random;

    var sample = this.source;

    var field = new Array(size);

    for (var i = 0; i < size; i++) {
        field[i] = new Array(size);
    }

    var weights = new Float32Array(1 << (n * n));

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
        return pattern((x, y) => p[n - 1 - y + x * n]);
    };

    var reflect = function reflect (p) {
        return pattern((x, y) => p[n - 1 - x + y * n]);
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

    var k, x, y;

    var sampleWidth = sample[0].length,
        sampleHeight = sample.length;

    for (y = 0; y < sampleHeight; y++) {
        for (x = 0; x < sampleWidth; x++) {
            var p0 = pattern((dx, dy) => sample[(x + dx) % sampleWidth][((y + dy) % sampleHeight)]);
            var p1 = rotate(p0);
            var p2 = rotate(p1);
            var p3 = rotate(p2);
            var p4 = reflect(p0);
            var p5 = reflect(p1);
            var p6 = reflect(p2);
            var p7 = reflect(p3);

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
        if (weights[k] <= 0) weights[k] = 0.1;
    }

    for (y = 0; y < size; y++) {
        for (x = 0; x < size; x++) {
            field[x][y] = rng() < 0.5;
        }
    }

    for (k = 0; k < iterations * size * size; k++) {
        var r = (rng() * size * size) | 0;
        x = (r % size) | 0;
        y = (r / size) | 0;

        var q = 1;

        for (var sy = y - n + 1; sy <= y + n - 1; sy++) {
            for (var sx = x - n + 1; sx <= x + n - 1; sx++) {
                var ind = 0,
                    difference = 0;

                for (var dy = 0; dy < n; dy++) for (var dx = 0; dx < n; dx++) {
                    var X = sx + dx;
                    if (X < 0) X += size;
                    else if (X >= size) X -= size;

                    var Y = sy + dy;
                    if (Y < 0) Y += size;
                    else if (Y >= size) Y -= size;

                    var value = field[X][Y];
                    var power = 1 << (dy * n + dx);
                    ind += value ? power : 0;
                    if (X == x && Y == y) difference = value ? power : -power;
                }

                q *= weights[ind - difference] / weights[ind];
            }
        }


        if (q >= 1) {
            field[x][y] = !field[x][y];
            continue;
        }

        if (temperature != 1) {
            q = Math.pow(q, 1.0 / temperature);
        }

        if (q > rng()) {
            field[x][y] = !field[x][y];
        }
    }

    return field;
};

var testSample = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0],
    [0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0],
    [0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0],
    [0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0],
    [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0],
    [0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0],
    [0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0],
    [0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,0,0,1,1,0],
    [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];


var time = Date.now();

var size = 15;
var conv = new ConvChain(testSample);

var result = conv.execute(3, 0.5, size, 50);

result.forEach((v) => {
    var s = '';
    v.map(v => { s = s + (v ? 'O' : '.') + ' '; });
    console.log(s);
});

console.log(Date.now() - time);
