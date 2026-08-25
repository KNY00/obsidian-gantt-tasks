export function getDataviewAPI() {
    return dv;
}
interface StoreState {
    readonly dayOffset: number;
}

const store: { dayOffset: number } = {
    dayOffset: 0,
};

export const incrementDayOffset = () => {
    store.dayOffset++;
};

export const decrementDayOffset = () => {
    store.dayOffset--;
};

export const getDayOffset = (): number => {
    const copy = { ...store };
    Object.freeze(copy);

    return copy.dayOffset;
};
