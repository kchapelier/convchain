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
    weights.fill(0);

    var k, x, y;

    for (y = 0; y < sample.length; y++) {
        for (x = 0; x < sample[y].length; x++) {
            var p0 = Pattern.createFromArray(sample, x, y, n);
            var p1 = p0.rotated();
            var p2 = p1.rotated();
            var p3 = p2.rotated();
            var p4 = p0.reflected();
            var p5 = p1.reflected();
            var p6 = p2.reflected();
            var p7 = p3.reflected();

            weights[p0.index()] += 1;
            weights[p1.index()] += 1;
            weights[p2.index()] += 1;
            weights[p3.index()] += 1;
            weights[p4.index()] += 1;
            weights[p5.index()] += 1;
            weights[p6.index()] += 1;
            weights[p7.index()] += 1;
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

    var energyExp = function (i, j) {
        var value = 1.0;

        for (var y = j - n + 1; y <= j + n - 1; y++) {
            for (var x = i - n + 1; x <= i + n - 1; x++) {
                value *= weights[Pattern.createFromArray(field, x, y, n).index()];
            }
        }

        return value;
    };

    var metropolis = function metropolis (i, j) {
        var p = energyExp(i, j);
        field[i][j] = (!field[i][j]);
        var q = energyExp(i, j);

        if (Math.pow(q / p, 1.0 / temperature) < rng()) {
            field[i][j] = (!field[i][j]);
        }
    };

    for (k = 0; k < iterations * size * size; k++) {
        metropolis((rng() * size) | 0, (rng() * size) | 0);
    }

    return field;
};

/*
public Pattern(int size, Func<int, int, bool> f) {
    data = new bool[size, size];
    Set(f);
}

public Pattern(bool[,] field, int x, int y, int size) {
    this(size, (i, j) => false);
    Set(
        (i, j) => field[
            (x + i + field.GetLength(0)) % field.GetLength(0),
            (y + j + field.GetLength(1)) % field.GetLength(1)
        ]
    );
}

private void Set(Func<int, int, bool> f) {
    for (int j = 0; j < Size; j++) {
        for (int i = 0; i < Size; i++) {
            data[i, j] = f(i, j);
        }
    }
*/

var Pattern = function Pattern (data, size) {
    this.data = data;
    this.size = size;
};

Pattern.createFromFunction = function (size, fn) {
    var data = new Array(size);

    for (var x = 0; x < size; x++) {
        data[x] = new Array(size);

        for (var y = 0; y < size; y++) {
            data[x][y] = fn(x, y);
        }
    }

    return new Pattern(data, size);
};

Pattern.createFromArray = function (field, x, y, size) {
    return Pattern.createFromFunction(size, (i, j) => field[(x + i + field.length) % field.length][(y + j + field[0].length) % field[0].length]);
};

Pattern.prototype.rotated = function () {
    return Pattern.createFromFunction(this.size, (x, y) => this.data[this.size - 1 - y][x]);
};

Pattern.prototype.reflected = function () {
    return Pattern.createFromFunction(this.size, (x, y) => this.data[this.size - 1 - x][y]);
};

Pattern.prototype.index = function () {
    var result = 0;

    for (var y = 0; y < this.size; y++) {
        for (var x = 0; x < this.size; x++) {
            result += this.data[x][y] ? 1 << (y * this.size + x) : 0;
        }
    }

    return result;
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

var result = conv.execute(3, 0.01, size, 50);


result.forEach((v) => {
    var s = '';
    v.map(v => { s = s + (v ? 'O' : '.') + ' '; });
    console.log(s);
});

console.log(Date.now() - time);
