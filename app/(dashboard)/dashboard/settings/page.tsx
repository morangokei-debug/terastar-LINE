import { RichMenuSetup } from "./RichMenuSetup";
import { LineQrCode } from "./LineQrCode";

export default function SettingsPage() {
  return (
    <div>
      <h2 className="mb-8 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
        設定
      </h2>

      <div className="space-y-6">
        <LineQrCode />

        <RichMenuSetup />

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 className="font-medium mb-2">友だち追加時の挨拶文</h3>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            挨拶がLINE公式アカウントの設定で上書きされている場合、
            <strong>LINE Official Account Manager</strong> → 設定 → 応答設定 → あいさつメッセージを
            <strong>オフ</strong>にしてください。詳細は
            <code className="text-xs bg-[var(--bg-tertiary)] px-1 rounded">
              docs/挨拶メッセージ設定.md
            </code>
            を参照。
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            挨拶文の変更は環境変数 <code className="bg-[var(--bg-tertiary)] px-1 rounded">LINE_WELCOME_MESSAGE</code> で可能です。
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 className="font-medium mb-2">ホームページURL</h3>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            リッチメニュー「ホームページ」ボタンのリンク先。環境変数{" "}
            <code className="text-xs bg-[var(--bg-tertiary)] px-1 rounded">
              NEXT_PUBLIC_PHARMACY_HOMEPAGE_URL
            </code>{" "}
            で設定してください。
          </p>
        </div>
      </div>
    </div>
  );
}
