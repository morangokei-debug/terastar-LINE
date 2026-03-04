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

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 className="font-medium mb-2">友だち追加が患者一覧に反映されない場合</h3>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            以前（テナント登録前など）に友だち追加した方は、患者一覧に自動登録されていない場合があります。
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            <strong>対処法：</strong>該当の方に、一度友だち削除していただき、再度QRコードから友だち追加してもらってください。新しい友だち追加イベントで患者一覧に登録されます。
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            または、患者一覧から手動で患者を新規登録し、後からLINEと紐付けることもできます。
          </p>
        </div>

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
            <strong>挨拶が出ない場合の確認：</strong>
            <strong>LINE Official Account Manager</strong> → 設定 → 応答設定で、
            <strong>あいさつメッセージ</strong>を<strong>オフ</strong>にしてください。
            オンのままだとLINE側の設定が優先され、当システムの挨拶が届かないことがあります。
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            「問い合わせは受け付けておりません」などの自動応答が出る場合、
            <strong>応答設定 → 応答メッセージ</strong>を<strong>オフ</strong>にしてください。
            当システムでメッセージを通常受け付けます。
          </p>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            Vercelの環境変数 <code className="bg-[var(--bg-tertiary)] px-1 rounded">LINE_WELCOME_MESSAGE</code> に以下を設定すると、挨拶文が送信されます。未設定時はコード内のデフォルトが使われます。
          </p>
          <pre className="text-xs text-[var(--text-secondary)] p-4 rounded-lg overflow-x-auto whitespace-pre-wrap" style={{ backgroundColor: "var(--bg-tertiary)" }}>
{`友だち追加ありがとうございます！✨
テラスターファーマシーです。

このLINEでは

・処方箋の事前送信
・お薬のご相談
・服用後のフォローアップ

が可能です。

処方箋は写真を撮って
このトークに送信してください。📷

お薬の準備ができ次第ご連絡いたします。`}
          </pre>
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
