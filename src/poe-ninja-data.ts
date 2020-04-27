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

const dataDir = path.join(__dirname, '../data');

function readLines(fileName: string): ItemData[] {
    const filePath = path.join(dataDir, fileName);
    const rawContents = fs.readFileSync(filePath, { encoding: 'utf8' });
    return JSON.parse(rawContents).lines;
}

export const readSkillGemData = () => readLines('skill_gems.json');
export function readUniqueItemData(): ItemData[] {
    return [].concat(
        readLines('unique_accessory.json'),
        readLines('unique_armour.json'),
        readLines('unique_jewel.json')
    );
}
