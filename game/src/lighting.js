// lighting.js — the library's three lights, one per round.
//
// Afternoon Reading is all window sun and pale gold. Candle Hour dims
// the room to amber and lets the lamps and the fire do the talking.
// Closing Bell is blue-grey dark: candle flames, lamp glass and embers
// are nearly the only warm things left, which is exactly why the last
// round's differences hide so well. hall.js builds every light and
// material from the round's entry here, so both panels of a round share
// one light and differ only where changes.js says they do.

export const ROUND_LIGHTS = [
  {
    name: 'Afternoon Reading',
    room: '#8a6f4d', // the wash the fog and far corners fade to
    skyThroughWindow: '#cfe4ee',
    sunColor: '#ffedbe',
    sunIntensity: 2.7,
    sunPosition: [-16, 11, 2], // low through the left-hand windows
    fillColor: '#ffe9c4',
    fillIntensity: 0.5,
    hemiSky: '#d9e6ee',
    hemiGround: '#6b5136',
    hemiIntensity: 0.85,
    lampLight: 2.2, // the banker's lamps burn, but daylight outshouts them
    lampGlow: 0.35,
    candleLight: 1.2,
    fireLight: 2.0,
    fireGlow: 0.5,
    shaftOpacity: 0.11,
    dustAlpha: 0.5,
    exposure: 1.12,
  },
  {
    name: 'Candle Hour',
    room: '#5d4630',
    skyThroughWindow: '#7a5a78',
    sunColor: '#ff9e57',
    sunIntensity: 1.9,
    sunPosition: [-16, 5.5, 0],
    fillColor: '#ffb877',
    fillIntensity: 0.65,
    hemiSky: '#8a6a86',
    hemiGround: '#3d2c1c',
    hemiIntensity: 1.2,
    lampLight: 7.5,
    lampGlow: 0.8,
    candleLight: 3.4,
    fireLight: 5.5,
    fireGlow: 0.85,
    shaftOpacity: 0.05,
    dustAlpha: 0.35,
    exposure: 1.16,
  },
  {
    name: 'Closing Bell',
    room: '#2c3850',
    skyThroughWindow: '#1d2c47',
    sunColor: '#a9c2e8', // moonlight, such as it is
    sunIntensity: 1.35,
    sunPosition: [-15, 13, -2],
    fillColor: '#5a76a8',
    fillIntensity: 0.5,
    hemiSky: '#33455f',
    hemiGround: '#141210',
    hemiIntensity: 0.95,
    lampLight: 8.5,
    lampGlow: 1,
    candleLight: 4.2,
    fireLight: 3.2, // the fire is mostly embers by closing
    fireGlow: 0.65,
    shaftOpacity: 0.035,
    dustAlpha: 0.22,
    exposure: 1.12,
  },
];

export function lightForRound(roundIndex) {
  return ROUND_LIGHTS[Math.min(roundIndex, ROUND_LIGHTS.length - 1)];
}
