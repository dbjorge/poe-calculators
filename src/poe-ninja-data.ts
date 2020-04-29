import * as fs from 'fs';
import * as path from 'path';

export type Sparkline = {
    "data": (number|null)[],
    "totalChange": number,
};
export type Modifier = {
    "text": string,
    "optional": boolean
};
export type ItemData = {
    "id": number, // 12345
    "name": string, // "Awakened Multistrike Support",
    "icon": string, // "https://web.poecdn.com/image/Art/2DItems/Gems/Support/SupportPlus/MultipleAttacksPlus.png?scale=1&w=1&h=1",
    "mapTier": number, // 0
    "levelRequired": number, //72
    "baseType": string|null, // null (gem) | "Leather Belt" (headhunder)
    "stackSize": number, // 0
    "variant": string // "1/20",
    "prophecyText": string|null,
    "artFilename":null,
    "links": number, // or 0
    "itemClass": 4, // 3 (gem) 4 (belt)
    "sparkline": Sparkline,
    "lowConfidenceSparkline": Sparkline,
    "implicitModifiers": Modifier[],
    "explicitModifiers": Modifier[],
    "flavourText": string, // "" for gems
    "corrupted": boolean, //false,
    "gemLevel": number, // 1-21, 0 for non-gem
    "gemQuality": number, // 0-23, 0 for non-gem
    "itemType": string, // "Unknown" for gem, "Belt" for Headhunter
    "chaosValue": number // 6462.68,
    "exaltedValue": number // 57.71,
    "count": number, //17, 99
    "detailsId": string, //"awakened-multistrike-support-1-20", "headhunter-leather-belt"
};

// comments are pay / receive for a mirror in delirium
export type CurrencyPayReceiveData = {
    "id": number, // 0 / 0
    "league_id": number, // 78 / 78
    "pay_currency_id": number, // 22 / 1
    "get_currency_id": number, // 1 / 22
    "sample_time_utc": string, // "2020-04-29T04:08:30.3846825Z" / "2020-04-29T04:08:30.3846825Z"
    "count": number, // 87 / 81
    "value": number, // 0.0000180745029850746268656716 / 55710.510123239436619718309859
    "data_point_count": number, // 1 / 1
    "includes_secondary": boolean, // true / true
};

export type CurrencyData = {
    "currencyTypeName": string, // "Mirror of Kalandra",
    "detailsId": string, // "mirror-of-kalandra"
    "chaosEquivalent": number, // 55518.53
    "pay": CurrencyPayReceiveData,
    "receive": CurrencyPayReceiveData,
    "paySparkLine": Sparkline,
    "receiveSparkLine": Sparkline,
    "lowConfidencePaySparkLine": Sparkline,
    "lowConfidenceReceiveSparkLine": Sparkline,
};

const dataDir = path.join(__dirname, '../data');

function readLines<T>(fileName: string): T[] {
    const filePath = path.join(dataDir, fileName);
    const rawContents = fs.readFileSync(filePath, { encoding: 'utf8' });
    return JSON.parse(rawContents).lines;
}

export const readCurrencyData = () => readLines<CurrencyData>('currency.json');
export const readSkillGemData = () => readLines<ItemData>('skill_gems.json');
export const readUniqueItemData = (): ItemData[] => {
    return [].concat(
        readLines<ItemData>('unique_accessory.json'),
        readLines<ItemData>('unique_armour.json'),
        readLines<ItemData>('unique_jewel.json')
    );
}
