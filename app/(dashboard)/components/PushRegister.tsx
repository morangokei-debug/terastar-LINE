"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i += 1) view[i] = rawData.charCodeAt(i);
  return buffer;
}

export function PushRegister({ inline = false }: { inline?: boolean }) {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {});
  }, []);

  async function enable() {
    setBusy(true);
    setMessage(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PermissionState);
      if (perm !== "granted") {
        setMessage("通知が許可されませんでした。ブラウザ設定から許可してください。");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setMessage("公開鍵が未設定です。管理者に連絡してください。");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = sub.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error ?? "登録に失敗しました");
        return;
      }
      setSubscribed(true);
      setMessage("通知を有効にしました。このブラウザに新着が届きます。");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setMessage("このブラウザの通知を解除しました。");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setBusy(false);
    }
  }

  if (permission === "unsupported") {
    return inline ? null : (
      <div className="text-xs text-[var(--text-muted)]">
        このブラウザはプッシュ通知に対応していません。
      </div>
    );
  }

  if (inline) {
    // 設定画面用: カード
    return (
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Bell size={18} /> ブラウザ通知（この端末）
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-3">
          このブラウザ（パソコン・スマホ）で新着チャットをプッシュ通知として受け取れます。
          ブラウザを閉じていても、OSの通知として届きます（端末・OSの仕様に依存）。
        </p>
        {subscribed ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-success)]">✓ 通知オン</span>
            <button
              type="button"
              onClick={disable}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg text-sm border disabled:opacity-40"
              style={{ borderColor: "var(--border-color)" }}
            >
              <BellOff size={14} className="inline mr-1" />
              解除
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={enable}
            disabled={busy || permission === "denied"}
            className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: "var(--accent-primary)" }}
          >
            {busy ? "登録中..." : "通知を有効にする"}
          </button>
        )}
        {permission === "denied" && (
          <p className="text-xs text-[var(--color-error)] mt-2">
            ブラウザで通知がブロックされています。アドレスバーの錠前アイコンから「通知を許可」に変更してください。
          </p>
        )}
        {message && (
          <p className="text-xs text-[var(--text-muted)] mt-2">{message}</p>
        )}
      </div>
    );
  }

  return null;
}
