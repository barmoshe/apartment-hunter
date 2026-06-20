// Clean line icons, drawn as inline SVG (no binary assets). Each icon inherits
// its colour from `currentColor`, so it themes with whatever context it sits in.
// Export names + props are kept stable so existing call sites are unchanged.

import type { ReactNode } from "react";

function Icon({
  cell = 6,
  className,
  label,
  children,
}: {
  cell?: number;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  const size = cell * 8;
  return (
    <svg
      className={className ? `sprite ${className}` : "sprite"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </svg>
  );
}

// --- House (brand mark, Buy track, empty state) ---
export function HouseSprite({ cell = 6, className }: { cell?: number; className?: string }) {
  return (
    <Icon cell={cell} className={className} label="בית">
      <path d="M3 11.5 L12 4 L21 11.5" />
      <path d="M5.5 10 V20 H18.5 V10" />
      <path d="M10 20 V14.5 H14 V20" />
    </Icon>
  );
}

// --- Key (Rent track, empty state) ---
export function KeySprite({ cell = 6, className }: { cell?: number; className?: string }) {
  return (
    <Icon cell={cell} className={className} label="מפתח">
      <circle cx="8.5" cy="8.5" r="3.4" />
      <path d="M10.9 10.9 L20 20" />
      <path d="M17 17 L19 15" />
      <path d="M19.6 19.6 L21.6 17.6" />
    </Icon>
  );
}

// --- Coin / cost (mortgage) ---
export function CoinSprite({ cell = 6, className }: { cell?: number; className?: string }) {
  return (
    <Icon cell={cell} className={className} label="עלות">
      <circle cx="12" cy="12" r="8.2" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
      >
        ₪
      </text>
    </Icon>
  );
}

// --- Welcome / "find a home" mark (onboarding) ---
export function SpiritMascot({ cell = 6, className }: { cell?: number; className?: string }) {
  return (
    <Icon cell={cell} className={className}>
      <path d="M3 11 L10.5 5 L18 11" />
      <path d="M5 10 V18.5 H16 V10" />
      <path d="M8.5 18.5 V13.5 H12.5 V18.5" />
      <circle cx="17" cy="16.5" r="3.6" fill="var(--surface)" />
      <path d="M19.6 19.1 L22.5 22" />
    </Icon>
  );
}

// --- Trash (delete buttons; reddens on hover via currentColor) ---
export function TrashSprite({ cell = 3, className }: { cell?: number; className?: string }) {
  return (
    <Icon cell={cell} className={className}>
      <path d="M4 7 H20" />
      <path d="M9 7 V4.5 H15 V7" />
      <path d="M6.5 7 L7.5 20 H16.5 L17.5 7" />
      <path d="M10 11 V16.5" />
      <path d="M14 11 V16.5" />
    </Icon>
  );
}
