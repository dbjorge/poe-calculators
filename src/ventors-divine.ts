// usage: node ventors-divine.js num-trials top-n

import { argv } from 'process';

function randIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function roll() {
    return {
        life: randIntInclusive(0, 60),
        quant: randIntInclusive(-10, 10),
        rarity: randIntInclusive(-40, 40),
        fire: randIntInclusive(-25, 50),
        cold: randIntInclusive(-25, 50),
        lightning: randIntInclusive(-25, 50),
    };
}

const current = {
    life: 33,
    quant: 7,
    rarity: 27,
    fire: -4,
    cold: -1,
    lightning: 19,
}
const currentScore = 2038;

function evaluateScore(item) {
    return (
        item.quant * 200 +
        item.rarity * 16 +
        item.fire * 10 +
        item.cold * 10 +
        item.lightning * 10 +
        item.life * 2
    );
}

const numTries = parseInt(argv[2]) || 1;

let bestItem = null;
let bestScore = -999999;
for (let i = 0; i < numTries; i++) {
    const item = roll();
    const score = evaluateScore(item);
    if (score > bestScore) {
        bestScore = score;
        bestItem = item;
    }
}

console.log(JSON.stringify(bestItem));
console.log(`score: ${bestScore}`);
