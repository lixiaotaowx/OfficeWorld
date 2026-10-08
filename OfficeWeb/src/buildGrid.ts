/** Shared installation/translation grid, including vertical stair layers. */
export const BUILD_GRID = .25;
export const gridSnap = (value:number) => Math.round(value/BUILD_GRID)*BUILD_GRID;
