import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
};

export type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * テナントの全有効 subscription に通知を送る。
 * 無効(410/404) なものは DB から削除する。
 */
export async function sendPushToTenant(
  tenantId: string,
  payload: PushPayload
): Promise<{ sent: number; removed: number }> {
  ensureConfigured();
  if (!configured) {
    console.warn("[web-push] VAPID keys not configured; skipping");
    return { sent: 0, removed: 0 };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.warn("[web-push] Supabase service key missing; skipping");
    return { sent: 0, removed: 0 };
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    db: { schema: "terastar_line" },
  });

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("tenant_id", tenantId);
  if (error || !subs || subs.length === 0) return { sent: 0, removed: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  const staleIds: string[] = [];

  await Promise.all(
    (subs as PushSubscriptionRow[]).map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          body
        );
        sent += 1;
      } catch (err: unknown) {
        const statusCode =
          typeof err === "object" && err && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (statusCode === 404 || statusCode === 410) {
          staleIds.push(s.id);
        } else {
          console.warn("[web-push] send failed:", statusCode, err);
        }
      }
    })
  );

  if (staleIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return { sent, removed: staleIds.length };
}
