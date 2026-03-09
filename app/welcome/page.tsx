import Link from "next/link";

const LINE_ADD_URL =
  process.env.NEXT_PUBLIC_LINE_ADD_URL || "https://line.me/R/ti/p/@920bcvxk";
const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(LINE_ADD_URL)}`;

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* 背景アクセント */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff7ed] via-transparent to-[#f1f5f9]" aria-hidden />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[var(--accent-primary)] opacity-[0.07] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden />

      <div
        className="relative w-full max-w-md p-8 rounded-2xl text-center shadow-[var(--shadow-lg)] backdrop-blur-sm"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h1 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>
          テラスターファーマシー
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-8 font-medium">
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
              className="block p-5 rounded-2xl transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)" }}
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

        <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border-color)" }}>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
          >
            薬剤師の方はこちら →
          </Link>
        </div>
      </div>
    </div>
  );
}
