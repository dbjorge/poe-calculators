import { ItemData, readSkillGemData } from "./poe-ninja-data";

export type GemData = ItemData & { vaal?: boolean };
export type GemsByNameVariant = {
    [name: string]: {
        [variant: string]: GemData;
    };
};

export function readGemsByNameVariant(normalizeVaal: boolean): GemsByNameVariant {
    const skillGemData: GemData[] = readSkillGemData();

    const gemsByName = {};
    for (const gem of skillGemData) {
        gem.vaal = gem.name.startsWith('Vaal ');
        if (normalizeVaal && gem.vaal) {
            gem.variant += ' Vaal';
        }
        const baseName = gem.name.replace(/^Vaal /, '');
        if (undefined == gemsByName[baseName]) {
            gemsByName[baseName] = {};
        }
        gemsByName[baseName][gem.variant] = gem;
    }

    return gemsByName;
}

