import { readCurrencyById } from './currency-data';

const currencyData = readCurrencyById();
const scourCost = currencyData["orb-of-scouring"].chaosEquivalent;
const altCost = currencyData["orb-of-alteration"].chaosEquivalent;
const augCost = currencyData["orb-of-augmentation"].chaosEquivalent;
const regalCost = currencyData["regal-orb"].chaosEquivalent;

type Affix = { name: string, weight: number };

const prefixes: Affix[] = [
    // herald specific
    { name: 'Purposeful Harbinger', weight: 357 },
    { name: 'Heraldry', weight: 357 },
    { name: 'Endbringer', weight: 714 },
    { name: 'Empowered Envoy', weight: 2857 },
    { name: 'Dark Messenger', weight: 1429 },
    { name: 'Agent of Destruction', weight: 2857 },
    { name: 'Lasting Impression', weight: 714 },
    { name: 'Self-Fulfilling Prophecy', weight: 714 },
    // all medium cluster jewels
    { name: 'Added Small Passive Skills also grant some irrelevant prefix', weight: 275*6+400 }
];

const suffixes: Affix[] = [
    // herald specific
    { name: 'Added Small Passive Skills also grant 1% +atk/cast w/herald', weight: 350 },
    { name: 'Added Small Passive Skills also grant 2% +atk/cast w/herald', weight: 350 },
    { name: 'Added Small Passive Skills also grant 3% +atk/cast w/herald', weight: 250 },
    // all medium cluster jewels
    { name: '1 Jewel Socket', weight: 7500 },
    { name: 'Added Small Passive Skills also grant some irrelevant suffix', weight: 275*11 },
]

const sum = (values: number[]) => values.reduce((x, y) => x + y, 0);
function rollAffix(candidates: Affix[]): Affix {
    const totalWeight = sum(candidates.map(c => c.weight));
    let roll = Math.random() * totalWeight;
    for (const c of candidates) {
        if (roll < c.weight) {
            return c;
        } else {
            roll -= c.weight;
        }
    }
    throw new Error('roll failure');
}

function rollAffixExcluding(candidates: Affix[], exclusions: Affix[]): Affix {
    const exclusionNames = exclusions.map(e => e.name);
    return rollAffix(candidates.filter(c => !exclusionNames.includes(c.name)));
}

type Item = {
    prefixes: Affix[],
    suffixes: Affix[],
};

// these all assume the item is in a valid state to use the orb
function alt(item: Item) {
    const roll = Math.random();
    if (roll < .5) {
        item.prefixes = [rollAffix(prefixes)];
        item.suffixes = [rollAffix(suffixes)];
    } else if (roll < .75) {
        item.prefixes = [rollAffix(prefixes)];
        item.suffixes = [];
    } else {
        item.prefixes = [];
        item.suffixes = [rollAffix(suffixes)];
    }
}

function aug(item: Item) {
    if (item.prefixes.length === 0) {
        item.prefixes = [rollAffix(prefixes)];
    } else if (item.suffixes.length === 0) {
        item.suffixes = [rollAffix(suffixes)];
    }
}

function regal(item: Item) {
    const roll = Math.random();
    if (roll < .5) {
        item.prefixes.push(rollAffixExcluding(prefixes, item.prefixes));
    } else {
        item.suffixes.push(rollAffixExcluding(suffixes, item.suffixes));
    }
}

type SimulationResult = {
    item: Item,
    attempts: number,
    cost: {
        scour: number,
        alt: number,
        aug: number,
        regal: number,
        chaosEquivalent: number,
    }
};

function hasPrefix(item: Item, name: string) {
    return item.prefixes.some(p => p.name === name);
}
function hasSuffix(item: Item, name: string) {
    return item.suffixes.some(p => p.name === name);
}

function logItem(label: string, item: Item) {
    console.log(`${label}: { prefixes: ${JSON.stringify(item.prefixes.map(p => p.name))}, suffixes: ${JSON.stringify(item.suffixes.map(s => s.name))}})`);
}

function simulate(): SimulationResult {
    // strategy is alt/aug until (ph|heraldry) + jewel, then regal for other prefix
    let attempts = 0;
    let item: Item = { prefixes: [], suffixes: [] };
    let cost = {
        scour: 0,
        alt: 0,
        aug: 0,
        regal: 0,
        chaosEquivalent: 0,
    };
    do {
        attempts++;
        console.log(`ATTEMPT ${attempts}`);

        cost.alt++;
        alt(item);
        logItem('alt', item);

        if (item.suffixes.length > 0 && !hasSuffix(item, '1 Jewel Socket')) { continue; }
        if (item.prefixes.length > 0 && !hasPrefix(item, 'Heraldry') && !hasPrefix(item, 'Purposeful Harbinger')) { continue; }

        if (item.suffixes.length + item.prefixes.length === 1) {
            cost.aug++;
            aug(item);
            logItem('aug', item);
            if (!hasSuffix(item, '1 Jewel Socket')) { continue; }
            if (!hasPrefix(item, 'Heraldry') && !hasPrefix(item, 'Purposeful Harbinger')) { continue; }
        }

        cost.regal++;
        regal(item);
        logItem('regal', item);
        if (hasPrefix(item, 'Heraldry') && hasPrefix(item, 'Purposeful Harbinger')) {
            break;
        }

        cost.scour++;
    } while (true);

    cost.chaosEquivalent = cost.scour * scourCost + cost.alt * altCost + cost.aug * augCost + cost.regal * regalCost;
    return { item, attempts, cost };
}

const results = [];
for (let i = 0; i < 1; i++) {
    results.push(simulate());
}

function prettyRange(values: number[]): string {
    if (values.length === 0) { return 'NaN'; }

    const total = sum(values);
    const average = total / values.length;
    const range = Math.max(...values) - Math.min(...values);
    return `${average}±${range / 2}`
}

console.log(`attempts: ${prettyRange(results.map(r => r.attempts))}`);
console.log(`chaosValue: ${prettyRange(results.map(r => r.cost.chaosEquivalent))}`);