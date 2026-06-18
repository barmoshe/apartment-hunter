"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadActiveTrack, trackHome } from "@/lib/track";

// Root entry: bounce to the last-active track (Buy or Rent) so the app reopens
// where you left off. Kept as a client page rather than a config redirect
// because the active track lives in localStorage, which the server can't read.
export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(trackHome(loadActiveTrack()));
  }, [router]);

  return (
    <main id="main" tabIndex={-1} className="container">
      <p className="muted pad">פותחים את העמק…</p>
    </main>
  );
}
