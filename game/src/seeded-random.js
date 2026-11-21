// seeded-random.js — one small deterministic well of randomness.
//
// The hall is furnished from fixed seeds, so the left panel, the right
// panel and every screenshot agree book for book: the only differences
// between the two panels are the twelve the round designed. mulberry32
// is the whole trick — a tiny, well-known integer hash generator.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A seeded pick from a list, and a seeded number in a range — the two
// shapes the furnishers actually reach for.
export function pickFrom(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length];
}

export function between(rng, low, high) {
  return low + rng() * (high - low);
}
