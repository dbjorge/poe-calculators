import { ItemData, readSkillGemData } from './poe-ninja-data';

type GemData = ItemData & { vaal?: boolean };

const skillGemData: GemData[] = readSkillGemData();

const allGems = {};
for (const gem of skillGemData) {
    gem.vaal = gem.name.startsWith('Vaal ');
    if (gem.vaal) {
        gem.variant += ' Vaal';
    }
    const baseName = gem.name.replace(/^Vaal /, '');
    if (undefined == allGems[baseName]) {
        allGems[baseName] = {};
    }
    allGems[baseName][gem.variant] = gem;
}

const gemProfitabilities = [];
for (const baseName of Object.keys(allGems)) {
    const gem = allGems[baseName];
    if (gem['20/20'] == undefined) {
        continue;
    }

    function strictValue(variant: string): number {
        if (gem[variant] != undefined) {
            return gem[variant].chaosValue;
        }
        return 0;
    }

    function value(variant: string): number {
        return (
            strictValue(variant) ||
            strictValue(variant.replace(/ Vaal$/, '')) ||
            strictValue(variant.replace(/20\/17/, '20/20')) ||
            strictValue(variant.replace(/ Vaal$/, '').replace(/20\/17/, '20/20')));
    }

    // corruption options:
    // choose 2 from
    // * nothing
    // * +-1 level
    // * +-3 quality
    // * normal -> Vaal
    //
    // P(lvl + qty) = 1/6
    //   P(21/23) = 1/24
    //   P(21/17) = 1/24
    //   P(19/23) = 1/24
    //   P(19/17) = 1/24
    // P(lvl only) = 1/3
    //   P(21/20) = 1/12
    //   P(21/20 Vaal) = 1/12
    //   P(19/20) = 1/12
    //   P(19/20 Vaal) = 1/12
    // P(qty only) = 1/3
    //   P(20/23) = 1/12
    //   P(20/23 Vaal) = 1/12
    //   P(20/17) = 1/12
    //   P(20/17 Vaal) = 1/12
    // P(neither) = 1/6
    //   P(20/20 Vaal) = 1/6

    const cost = gem['20/20'].chaosValue
    const expectedValue =
        (1 / 24) * value('21/23c') +
        (1 / 24) * value('21/17c') +
        (1 / 24) * value('19/23c') +
        (1 / 24) * value('19/17c') +
        (1 / 12) * value('21/20c') +
        (1 / 12) * value('21/20c Vaal') +
        (1 / 12) * value('19/20c') +
        (1 / 12) * value('19/20c Vaal') +
        (1 / 12) * value('20/23c') +
        (1 / 12) * value('20/23c Vaal') +
        (1 / 12) * value('20/17c') +
        (1 / 12) * value('20/17c Vaal') +
        (1 / 6) * value('20/20c Vaal');

    gemProfitabilities.push({
        name: baseName,
        cost,
        expectedValue,
        expectedProfit: expectedValue - cost,        
    });
}

gemProfitabilities.sort((a, b) => a.expectedProfit - b.expectedProfit);

for (const p of gemProfitabilities) {
    console.log(`${p.name}: EP ${p.expectedProfit} Cost ${p.cost}`);
}