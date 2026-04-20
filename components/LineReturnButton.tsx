"use client";

import { useCallback, useEffect, useState } from "react";
import type { Liff } from "@line/liff";

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? "";

type Props = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function LineReturnButton({
  children = "LINEに戻る",
  className,
  style,
}: Props) {
  const [liff, setLiff] = useState<Liff | null | undefined>(undefined);

  useEffect(() => {
    if (!LIFF_ID) {
      setLiff(null);
      return;
    }
    let cancelled = false;
    void import("@line/liff").then(async ({ default: liffMod }) => {
      try {
        await liffMod.init({ liffId: LIFF_ID });
        if (!cancelled) setLiff(liffMod);
      } catch {
        if (!cancelled) setLiff(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = useCallback(() => {
    const finish = (client: Liff | null) => {
      if (client?.isInClient()) {
        client.closeWindow();
        return;
      }
      if (typeof window !== "undefined") {
        if (window.history.length > 1) {
          window.history.back();
          return;
        }
        window.location.assign("https://line.me/");
      }
    };

    if (liff !== undefined) {
      finish(liff);
      return;
    }

    if (!LIFF_ID) {
      finish(null);
      return;
    }

    void import("@line/liff").then(async ({ default: liffMod }) => {
      try {
        await liffMod.init({ liffId: LIFF_ID });
        setLiff(liffMod);
        finish(liffMod);
      } catch {
        setLiff(null);
        finish(null);
      }
    });
  }, [liff]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}
