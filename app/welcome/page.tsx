import Link from "next/link";

const LINE_ADD_URL =
  process.env.NEXT_PUBLIC_LINE_ADD_URL || "https://line.me/R/ti/p/@920bcvxk";
const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(LINE_ADD_URL)}`;

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: "var(--bg-app)" }}>
      <div
        className="w-full max-w-md p-8 rounded-lg text-center"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
        }}
      >
        <h1 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          テラスターファーマシー
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          LINEフォローアップサービス
        </p>

        <div className="space-y-6">
          <p className="text-[var(--text-primary)] font-medium">
            このQRコードをスキャンして
            <br />
            公式LINEに友だち追加してください
          </p>

          <div className="flex justify-center">
            <a
              href={LINE_ADD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              style={{ backgroundColor: "var(--bg-subtle)" }}
              aria-label="LINE友だち追加"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QR_CODE_URL}
                alt="LINE友だち追加用QRコード"
                width={200}
                height={200}
                className="w-[200px] h-[200px]"
              />
            </a>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            友だち追加後は、当薬局の管理画面で対応いたします。
            <br />
            お薬のご用意ができましたらLINEでお知らせします。
          </p>
        </div>

        <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border-default)" }}>
          <Link
            href="/login"
            className="inline-block text-sm hover:text-[var(--accent)] transition-colors"
            style={{ color: "var(--text-muted)", transition: "var(--t-fast)" }}
          >
            薬剤師の方はこちら →
          </Link>
        </div>
      </div>
    </div>
  );
}
