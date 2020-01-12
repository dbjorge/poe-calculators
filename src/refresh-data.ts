import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';

function download(dataFileName: string, url: string) {
    const filePath = path.join(__dirname, '../data', dataFileName);
    const fileStream = fs.createWriteStream(filePath);
    https.get(url, r => r.pipe(fileStream));
}

download('skill_gems.json', 'https://poe.ninja/api/data/ItemOverview?league=Metamorph&type=SkillGem');
download('unique_armour.json', 'https://poe.ninja/api/data/ItemOverview?league=Metamorph&type=UniqueArmour');
download('unique_jewel.json', 'https://poe.ninja/api/data/ItemOverview?league=Metamorph&type=UniqueJewel');
download('unique_accessory.json', 'https://poe.ninja/api/data/ItemOverview?league=Metamorph&type=UniqueAccessory')