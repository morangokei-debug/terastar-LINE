"use client";

const LINE_ADD_URL =
  process.env.NEXT_PUBLIC_LINE_ADD_URL || "https://line.me/R/ti/p/@920bcvxk";
const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(LINE_ADD_URL)}`;

export function LineQrCode() {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h3 className="font-medium mb-2">LINE友だち追加用QRコード</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        患者にこのQRコードをスキャンしてもらうと、公式LINEに友だち追加されます。
        受付やチラシに掲示してください。
      </p>

      <div className="flex flex-col sm:flex-row items-start gap-6">
        <a
          href={LINE_ADD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-xl shrink-0"
          style={{ backgroundColor: "white" }}
          aria-label="LINE友だち追加"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={QR_CODE_URL}
            alt="LINE友だち追加用QRコード"
            width={256}
            height={256}
            className="w-[256px] h-[256px]"
          />
        </a>

        <div className="space-y-3 text-sm">
          <p className="text-[var(--text-secondary)]">
            <strong>使い方：</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[var(--text-muted)]">
            <li>患者にQRコードをスキャンしてもらう</li>
            <li>友だち追加が完了すると患者一覧に自動登録される</li>
            <li>患者詳細で名前を本名に修正する</li>
          </ol>
          <p className="text-[var(--text-muted)] pt-2">
            患者向け案内ページは{" "}
            <a
              href="/welcome"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-primary)] hover:underline"
            >
              /welcome
            </a>{" "}
            からもアクセスできます。
          </p>
        </div>
      </div>
    </div>
  );
}
