import { CurrencyData, readCurrencyData } from "./poe-ninja-data";

export type CurrencyId =
    "mirror-of-kalandra" |
    "exalted-orb" |
    "chaos-orb" |
    "regal-orb" |
    "orb-of-alteration" |
    "orb-of-augmentation";

export type CurrencyById = {
    [name in CurrencyId]: CurrencyData
};

export function readCurrencyById(): CurrencyById {
    const data = readCurrencyData();
    const output = {};
    data.forEach(d => output[d.detailsId] = d);
    return output as any;
}
