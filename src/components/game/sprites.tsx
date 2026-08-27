import type { SiteKind } from "@/game/types";

// Pixel sprites, authored as character grids so they can be read and edited as
// pictures. '#' is ink, '.' is nothing, 'o' is the spot colour.

const GLYPHS: Record<SiteKind, string[]> = {
  base: [
    "....#....",
    "...###...",
    "..#####..",
    ".#######.",
    "#########",
    "..#ooo#..",
    "..#ooo#..",
    "..#####..",
    ".........",
  ],
  ranch: [
    ".........",
    "...###...",
    "..#####..",
    ".#######.",
    ".#######.",
    ".#..#..#.",
    ".#..#..#.",
    ".#######.",
    ".........",
  ],
  town: [
    ".........",
    ".#.......",
    "###...##.",
    "#o#..####",
    "#o#..#oo#",
    "###..#oo#",
    ".....####",
    ".........",
    ".........",
  ],
  landmark: [
    ".........",
    "....#....",
    "...###...",
    "..##o##..",
    ".###o###.",
    "##.###.##",
    "#.......#",
    ".........",
    ".........",
  ],
  military: [
    "....#....",
    "..#####..",
    ".##...##.",
    "##..o..##",
    "#...o...#",
    "##..o..##",
    ".##...##.",
    "..#####..",
    "....#....",
  ],
  city: [
    ".........",
    ".#...#...",
    ".#.###.#.",
    "###o#o###",
    "#o#o#o#o#",
    "#o#o#o#o#",
    "#########",
    ".........",
    ".........",
  ],
  anomaly: [
    "....#....",
    ".#..#..#.",
    "..#####..",
    "..#ooo#..",
    "###ooo###",
    "..#ooo#..",
    "..#####..",
    ".#..#..#.",
    "....#....",
  ],
};

/** Draw a glyph centred on (0,0) at the given pixel scale. */
export function Glyph({
  kind,
  scale = 1,
  ink = "var(--ink)",
  spot = "var(--spot)",
}: {
  kind: SiteKind;
  scale?: number;
  ink?: string;
  spot?: string;
}) {
  const rows = GLYPHS[kind];
  const n = rows.length;
  const off = (n * scale) / 2;
  const cells: React.ReactElement[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const c = rows[y][x];
      if (c === ".") continue;
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={x * scale - off}
          y={y * scale - off}
          width={scale}
          height={scale}
          fill={c === "o" ? spot : ink}
        />,
      );
    }
  }
  return <g className="pixelated">{cells}</g>;
}

// A saucer seen edge-on, for the craft moving along a route.
const SAUCER = [
  "...###...",
  "..#ooo#..",
  ".#######.",
  "#########",
  ".#######.",
  "..#...#..",
];

export function Saucer({ scale = 1 }: { scale?: number }) {
  const cells: React.ReactElement[] = [];
  const w = SAUCER[0].length;
  const h = SAUCER.length;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = SAUCER[y][x];
      if (c === ".") continue;
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={x * scale - (w * scale) / 2}
          y={y * scale - (h * scale) / 2}
          width={scale}
          height={scale}
          fill={c === "o" ? "var(--spot)" : "var(--ink)"}
        />,
      );
    }
  }
  return <g className="pixelated">{cells}</g>;
}
