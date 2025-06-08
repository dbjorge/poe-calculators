import { ItemData, readSkillGemData } from "./poe-ninja-data";

export type GemVariant = '1'|'20'|'1/20'|'20/20'|'1 Vaal'|'20 Vaal'|'1/20 Vaal'|'20/20 Vaal';
export type GemData = ItemData & { vaal?: boolean };
export type GemsByNameVariant = {
    [name: string]: {
        [variant in GemVariant]: GemData;
    };
};

export function readGemsByNameVariant(normalizeVaal: boolean): GemsByNameVariant {
    const skillGemData: Partial<GemData>[] = readSkillGemData();

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

