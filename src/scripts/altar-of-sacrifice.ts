import { readUniqueItemData, ItemData } from './poe-ninja-data';

const uniqueData = readUniqueItemData();

type ItemTypeData = {
    itemType: string,
    items: ItemData[],
    averageChaosValue?: number,
};
const itemTypeData: { [itemType: string]: ItemTypeData } = {};
for (const item of uniqueData) {
    if (itemTypeData[item.itemType] == undefined) {
        itemTypeData[item.itemType] = {
            itemType: item.itemType,
            items: [item],
        };
    } else {
        itemTypeData[item.itemType].items.push(item);
    }
}
for (const itemType of Object.keys(itemTypeData)) {
    const data: ItemTypeData = itemTypeData[itemType];
    const totalChaosValue = data.items.reduce((acc, v) => acc + v.chaosValue, 0);
    data.averageChaosValue = totalChaosValue / data.items.length;
}

const sortedData = Object.values(itemTypeData).sort((a, b) => a.averageChaosValue - b.averageChaosValue);

for (const d of sortedData) {
    console.log(`${d.itemType}: ${d.averageChaosValue}`);
}