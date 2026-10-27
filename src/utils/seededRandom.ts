/**
 * Deterministic pseudo-random generator (mulberry32): the same seed always gives
 * the same sequence, so procedural textures look identical on every load.
 * Returns numbers in [0, 1), like Math.random.
 */
export const createSeededRandom = (seed: number) => {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
        mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
};

/** Random number in [min, max) */
export const randomBetween = (random: () => number, min: number, max: number) =>
    min + random() * (max - min);
