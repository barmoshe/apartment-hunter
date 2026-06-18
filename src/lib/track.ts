// The two top-level modes of the app. Buy is the original tracker (apartments
// to purchase + mortgage); Rent is the parallel rental search. Each track has
// its own list, fields, and comparison view; the app bar switches between them.

export const TRACKS = ["buy", "rent"] as const;
export type Track = (typeof TRACKS)[number];

export const TRACK_LABELS: Record<Track, string> = {
  buy: "קנייה",
  rent: "שכירות",
};

// Which track a path belongs to. Everything under /rent is the Rent track;
// everything else (incl. /buy and the redirected /) is Buy.
export function trackFromPathname(pathname: string): Track {
  return pathname.startsWith("/rent") ? "rent" : "buy";
}

// The default landing route for a track, used by the app-bar switch.
export function trackHome(track: Track): string {
  return track === "rent" ? "/rent" : "/buy";
}

// Remember the last-active track so the app reopens where you left off.
const ACTIVE_TRACK_KEY = "dira:activeTrack";

export function loadActiveTrack(): Track {
  if (typeof window === "undefined") return "buy";
  try {
    const raw = window.localStorage.getItem(ACTIVE_TRACK_KEY);
    return raw === "rent" ? "rent" : "buy";
  } catch {
    return "buy";
  }
}

export function saveActiveTrack(track: Track): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_TRACK_KEY, track);
  } catch {
    // ignore
  }
}
