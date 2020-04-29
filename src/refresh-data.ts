import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

const league = 'Delirium';

const dataDir = path.join(__dirname, '../data');

function download(dataFileName: string, url: string) {
    const filePath = path.join(dataDir, dataFileName);
    const fileStream = fs.createWriteStream(filePath);
    https.get(url, r => r.pipe(fileStream));
}

fs.mkdirSync(dataDir, {recursive: true});
download('currency.json', `https://poe.ninja/api/data/currencyoverview?league=${league}&type=Currency`)
download('skill_gems.json', `https://poe.ninja/api/data/ItemOverview?league=${league}&type=SkillGem`);
download('unique_armour.json', `https://poe.ninja/api/data/ItemOverview?league=${league}&type=UniqueArmour`);
download('unique_jewel.json', `https://poe.ninja/api/data/ItemOverview?league=${league}&type=UniqueJewel`);
download('unique_accessory.json', `https://poe.ninja/api/data/ItemOverview?league=${league}&type=UniqueAccessory`)