import type { ReactNode } from "react";
import {
  BirdSprite,
  FlowerSprite,
  MoonSprite,
  StarSprite,
  SunSprite,
  TreeSprite,
} from "./art";

// The 8-bit Stardew-style backdrop: a stepped pixel sky with a sun by day and a
// moon + twinkling stars by night, drifting clouds, a flock of birds, and a
// tiling grass + soil + crops field lined with swaying trees and flowers. Pure
// SVG + CSS vars, so it themes day/night with the rest of the app and paints on
// the server (no hooks, no hydration risk). Fixed behind everything.

type Palette = Record<string, string>;

function rectsFromGrid(rows: string[], palette: Palette, cell: number): ReactNode[] {
  const out: ReactNode[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const fill = palette[row[x]];
      if (!fill) continue;
      out.push(
        <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={fill} />,
      );
    }
  });
  return out;
}

// One seamless field tile: crop in the middle, grass top edge, tilled soil below.
const FIELD = [
  "............",
  ".....bb.....",
  "....bbbb....",
  "...bbttbb...",
  "g..bbttbb..g",
  "lg.bttttb.gl",
  "gGglttttlgGg",
  "gGgGgttgGgGg",
  "GgGgGgGgGgGg",
  "gGgGgGgGgGgG",
  "sgsgssgssgsg",
  "ssssssssssss",
  "sSsssSssssSs",
  "ssssssssssss",
  "ssdssssdssss",
  "ssssssssssss",
  "sSsssSssssSs",
  "dsssdsssdsss",
];
const FIELD_PAL: Palette = {
  g: "var(--grass)",
  G: "var(--grass-2)",
  l: "var(--grass-3)",
  s: "var(--soil)",
  S: "var(--soil-2)",
  d: "var(--soil-3)",
  t: "var(--crop)",
  b: "var(--crop-2)",
};

const CLOUD = ["..ccccc..", ".ccccccc.", "ccccccccc", ".ccccccc."];
const CLOUD_PAL: Palette = { c: "var(--cloud)" };

function Cloud({ className }: { className: string }) {
  const cell = 6;
  const w = CLOUD[0].length * cell;
  const h = CLOUD.length * cell;
  return (
    <svg
      className={`cloud ${className}`}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rectsFromGrid(CLOUD, CLOUD_PAL, cell)}
    </svg>
  );
}

// Static placements — kept here (not random) so the server and client markup
// match exactly. Positions are percentages; durations/delays stagger motion.
const STARS = [
  { top: "10%", left: "16%", delay: "0s" },
  { top: "7%", left: "37%", delay: "1.1s" },
  { top: "15%", left: "57%", delay: "2.2s" },
  { top: "6%", left: "74%", delay: "0.6s" },
  { top: "21%", left: "86%", delay: "1.7s" },
  { top: "25%", left: "27%", delay: "2.8s" },
];

const TREES = [
  { left: "4%", cell: 7, delay: "0s", dur: "7s" },
  { left: "19%", cell: 5, delay: "0.8s", dur: "8.4s" },
  { left: "69%", cell: 4, delay: "0.4s", dur: "7.8s" },
  { left: "85%", cell: 6, delay: "1.4s", dur: "9.1s" },
];

const FLOWERS: { left: string; tone: 1 | 2; delay: string; dur: string }[] = [
  { left: "12%", tone: 1, delay: "0s", dur: "4.6s" },
  { left: "33%", tone: 2, delay: "0.7s", dur: "5.3s" },
  { left: "51%", tone: 1, delay: "1.3s", dur: "4.9s" },
  { left: "78%", tone: 2, delay: "0.4s", dur: "5.6s" },
  { left: "93%", tone: 1, delay: "1s", dur: "4.4s" },
];

const BIRDS = [
  { top: "17%", delay: "0s", dur: "34s" },
  { top: "23%", delay: "6s", dur: "40s" },
  { top: "13%", delay: "14s", dur: "46s" },
];

export function PixelBackground() {
  const cell = 8;
  const w = FIELD[0].length * cell;
  const h = FIELD.length * cell;
  return (
    <div className="pixel-bg" aria-hidden="true">
      {/* celestial: sun by day, moon by night (toggled in CSS) */}
      <SunSprite cell={7} className="scene-sun" />
      <MoonSprite cell={7} className="scene-moon" />

      {/* stars + a stray shooting star (night only) */}
      <div className="scene-stars">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="twinkle"
            style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          >
            <StarSprite cell={3} />
          </span>
        ))}
        <span className="shooting-star" />
      </div>

      {/* drifting pixel clouds */}
      <div className="pixel-clouds">
        <Cloud className="cloud-a" />
        <Cloud className="cloud-b" />
        <Cloud className="cloud-c" />
      </div>

      {/* a flock crossing the sky (day only) */}
      <div className="scene-birds">
        {BIRDS.map((b, i) => (
          <span
            key={i}
            className="bird-fly"
            style={{ top: b.top, animationDelay: b.delay, animationDuration: b.dur }}
          >
            <BirdSprite cell={3} />
          </span>
        ))}
      </div>

      {/* the tiling grass + soil + crops field, anchored to the bottom */}
      <svg
        className="pixel-ground"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dira-field" width={w} height={h} patternUnits="userSpaceOnUse">
            {rectsFromGrid(FIELD, FIELD_PAL, cell)}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dira-field)" />
      </svg>

      {/* trees + flowers standing on the grass, in front of the field */}
      <div className="scene-scape">
        {TREES.map((t, i) => (
          <span
            key={`t${i}`}
            className="scape-item sway"
            style={{ left: t.left, animationDelay: t.delay, animationDuration: t.dur }}
          >
            <TreeSprite cell={t.cell} />
          </span>
        ))}
        {FLOWERS.map((f, i) => (
          <span
            key={`f${i}`}
            className="scape-item scape-flower sway"
            style={{ left: f.left, animationDelay: f.delay, animationDuration: f.dur }}
          >
            <FlowerSprite cell={4} tone={f.tone} />
          </span>
        ))}
      </div>
    </div>
  );
}
