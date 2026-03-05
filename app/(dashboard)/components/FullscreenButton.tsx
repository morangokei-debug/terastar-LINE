"use client";

import { useState, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen API not supported or denied
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg lg:hidden"
      style={{
        backgroundColor: "var(--accent-primary)",
        color: "white",
      }}
      aria-label={isFullscreen ? "フルスクリーンを解除" : "フルスクリーン表示"}
      title={isFullscreen ? "フルスクリーン解除" : "フルスクリーン"}
    >
      {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
    </button>
  );
}
