// Hand-authored pixel-art sprites, drawn as a grid of <rect> cells so they stay
// crisp at any size (shape-rendering: crispEdges) and theme themselves via CSS
// custom properties. No binary assets, no cloud generation — pure SVG.
//
// The mascot is an ORIGINAL cozy "valley spirit" (inspired by the cozy-game
// genre, not copied from any game) — a warm wink for the player.

import type { ReactNode } from "react";

type Palette = Record<string, string>;

function PixelArt({
  rows,
  palette,
  cell = 6,
  label,
  className,
}: {
  rows: string[];
  palette: Palette;
  cell?: number;
  label?: string;
  className?: string;
}) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const cells: ReactNode[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const fill = palette[row[x]];
      if (!fill) continue;
      cells.push(
        <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={fill} />,
      );
    }
  });
  return (
    <svg
      className={className ? `sprite ${className}` : "sprite"}
      viewBox={`0 0 ${w * cell} ${h * cell}`}
      width={w * cell}
      height={h * cell}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {cells}
    </svg>
  );
}

// --- Cozy house (wordmark + empty state) ---
const HOUSE = [
  "....OOOO....",
  "...ORRRRO...",
  "..ORRRRRRO..",
  ".ORRRRRRRRO.",
  "OOOOOOOOOOOO",
  "OWWWWWWWWWWO",
  "OWBBWWWWBBWO",
  "OWBBWWWWBBWO",
  "OWWWWDDWWWWO",
  "OWWWWDDWWWWO",
  "OOOOODDOOOOO",
];
const HOUSE_PAL: Palette = {
  O: "var(--wood-deep)",
  R: "var(--red)",
  W: "var(--surface)",
  B: "var(--blue)",
  D: "var(--wood)",
};

export function HouseSprite({ cell = 6, className }: { cell?: number; className?: string }) {
  return <PixelArt rows={HOUSE} palette={HOUSE_PAL} cell={cell} label="בית" className={className} />;
}

// --- Original "valley spirit" mascot ---
const SPIRIT = [
  ".....L.....",
  "....LLL....",
  "...OOOOO...",
  "..OBBBBBO..",
  ".OBBBBBBBO.",
  ".OBEEBEEBO.",
  ".OBEPBEPBO.",
  ".OBBBBBBBO.",
  ".OBBBBBBBO.",
  "..OBBBBBO..",
  "...OOOOO...",
  "...F...F...",
];
const SPIRIT_PAL: Palette = {
  O: "var(--wood-deep)",
  B: "var(--green)",
  L: "oklch(0.72 0.16 140)",
  E: "oklch(0.98 0.01 95)",
  P: "var(--wood-deep)",
  F: "var(--wood-deep)",
};

export function SpiritMascot({ cell = 6, className }: { cell?: number; className?: string }) {
  return (
    <PixelArt
      rows={SPIRIT}
      palette={SPIRIT_PAL}
      cell={cell}
      label="רוח העמק"
      className={className}
    />
  );
}

// --- Seedling (cozy accents) ---
const SEEDLING = ["..G.G..", ".GGSGG.", "G.GSG.G", "..GSG..", "...S...", "BBBBBBB", ".BBBBB."];
const SEEDLING_PAL: Palette = {
  G: "var(--green)",
  S: "oklch(0.42 0.12 145)",
  B: "var(--wood)",
};

export function SeedlingSprite({ cell = 6, className }: { cell?: number; className?: string }) {
  return (
    <PixelArt rows={SEEDLING} palette={SEEDLING_PAL} cell={cell} label="נבט" className={className} />
  );
}

// --- Gold coin (₪ accent) ---
const COIN = [".OOOOO.", "OYYYYYO", "OYYHYYO", "OYHYHYO", "OYYHYYO", "OYYYYYO", ".OOOOO."];
const COIN_PAL: Palette = {
  O: "var(--wood-deep)",
  Y: "var(--accent)",
  H: "oklch(0.96 0.10 95)",
};

export function CoinSprite({ cell = 6, className }: { cell?: number; className?: string }) {
  return <PixelArt rows={COIN} palette={COIN_PAL} cell={cell} label="מטבע" className={className} />;
}

// --- Key (the Rent track: wordmark switch + empty state) ---
const KEY_ART = [
  "..OOO..",
  ".OYYYO.",
  ".OY.YO.",
  ".OYYYO.",
  "..OYO..",
  "..OYO..",
  "..OYO..",
  "..OYOO.",
  "..OYO..",
  "..OYOO.",
  "..OOO..",
];
const KEY_PAL: Palette = {
  O: "var(--wood-deep)",
  Y: "var(--accent)",
};

export function KeySprite({ cell = 6, className }: { cell?: number; className?: string }) {
  return <PixelArt rows={KEY_ART} palette={KEY_PAL} cell={cell} label="מפתח" className={className} />;
}

// --- Scenery sprites for the 8-bit backdrop (decorative; aria-hidden) ---

// Sun (day): radiant disc with a bright core.
const SUN = [
  "....R....",
  ".R..Y..R.",
  "...YYY...",
  "..YYCYY..",
  "RYYCCCYYR",
  "..YYCYY..",
  "...YYY...",
  ".R..Y..R.",
  "....R....",
];
const SUN_PAL: Palette = { Y: "var(--sun)", R: "var(--sun)", C: "var(--sun-core)" };

export function SunSprite({ cell = 6, className }: { cell?: number; className?: string }) {
  return <PixelArt rows={SUN} palette={SUN_PAL} cell={cell} className={className} />;
}

// Moon (night): a pale full moon with two craters.
const MOON = [
  "..MMMMM..",
  ".MMMMMMM.",
  "MMMcMMMMM",
  "MMMMMMMMM",
  "MMMMMMcMM",
  "MMMMMMMMM",
  ".MMMMMMM.",
  "..MMMMM..",
];
const MOON_PAL: Palette = { M: "var(--moon)", c: "var(--moon-2)" };

export function MoonSprite({ cell = 6, className }: { cell?: number; className?: string }) {
  return <PixelArt rows={MOON} palette={MOON_PAL} cell={cell} className={className} />;
}

// Star (night): a four-point sparkle.
const STAR = ["..S..", "..S..", "SSSSS", "..S..", "..S.."];
const STAR_PAL: Palette = { S: "var(--star)" };

export function StarSprite({ cell = 4, className }: { cell?: number; className?: string }) {
  return <PixelArt rows={STAR} palette={STAR_PAL} cell={cell} className={className} />;
}

// Cozy tree: a leafy canopy on a short trunk.
const TREE = [
  "..LLL..",
  ".LLlLL.",
  "LLLLLLL",
  "LLlLLlL",
  ".LLLLL.",
  "..LLL..",
  "...T...",
  "...T...",
  "..TTT..",
];
const TREE_PAL: Palette = {
  L: "var(--tree-leaf)",
  l: "var(--tree-leaf-2)",
  T: "var(--tree-trunk)",
};

export function TreeSprite({ cell = 6, className }: { cell?: number; className?: string }) {
  return <PixelArt rows={TREE} palette={TREE_PAL} cell={cell} className={className} />;
}

// Bird: a little gull silhouette, wings raised.
const BIRD = ["OO...OO", ".OO.OO.", "..OOO.."];
const BIRD_PAL: Palette = { O: "var(--bird)" };

export function BirdSprite({ cell = 4, className }: { cell?: number; className?: string }) {
  return <PixelArt rows={BIRD} palette={BIRD_PAL} cell={cell} className={className} />;
}

// Flower: petals + center on a short stem; tone picks one of two palettes.
const FLOWER = [".P.P.", "PPPPP", ".PYP.", "..S..", ".GSG."];

export function FlowerSprite({
  cell = 6,
  tone = 1,
  className,
}: {
  cell?: number;
  tone?: 1 | 2;
  className?: string;
}) {
  const pal: Palette = {
    P: `var(--flower-${tone})`,
    Y: "var(--flower-center)",
    S: "var(--tree-leaf-2)",
    G: "var(--tree-leaf)",
  };
  return <PixelArt rows={FLOWER} palette={pal} cell={cell} className={className} />;
}

// --- Trash icon for delete buttons (currentColor so it reddens on hover) ---
const TRASH = ["..OOO..", "OOOOOOO", ".O.O.O.", ".O.O.O.", ".O.O.O.", ".O.O.O.", ".OOOOO."];
const TRASH_PAL: Palette = { O: "currentColor" };

export function TrashSprite({ cell = 3, className }: { cell?: number; className?: string }) {
  return <PixelArt rows={TRASH} palette={TRASH_PAL} cell={cell} className={className} />;
}
