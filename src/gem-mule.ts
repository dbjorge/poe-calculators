import { readGemsByNameVariant } from './gem-data';

const gemsByNameVariant = readGemsByNameVariant(false);

const prismCost = 1.5;

let gemProfitabilities = [];
for (const name of Object.keys(gemsByNameVariant)) {
    const gem = gemsByNameVariant[name];
    if (gem['20'] && gem['1/20'] && gem['20/20']) {
        const costs = {
            '1': .25,
            '20': gem['20'].chaosValue,
            '1/20': gem['1/20'].chaosValue,
            '20/20': gem['20/20'].chaosValue,
        };

        gemProfitabilities.push({
            name,
            variant: '1 -> 20',
            cost: costs['1'],
            value: costs['20'],
            count: gem['20'].count,
        });

        gemProfitabilities.push({
            name,
            variant: '1/20 -> 20/20',
            cost: costs['1/20'],
            value: costs['20/20'],
            count: gem['20/20'].count,
        });

        gemProfitabilities.push({
            name,
            variant: '20 -> 20/20',
            cost: costs['20'] + prismCost,
            value: costs['20/20'],
            count: gem['20/20'].count,
        });
    }
}

gemProfitabilities = gemProfitabilities.filter(p => p.count >= 15);
gemProfitabilities.forEach(p => p.profit = p.value - p.cost);
gemProfitabilities.sort((a, b) => a.profit - b.profit);

for (const p of gemProfitabilities.slice(gemProfitabilities.length - 20)) {
    console.log(`${p.name.padEnd(35)} ${p.variant.padEnd(14)}: EP ${p.profit} Cost ${p.cost} Count ${p.count}`);
}