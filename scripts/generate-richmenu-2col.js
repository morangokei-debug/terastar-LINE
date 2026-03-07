/**
 * 2カラム（処方箋送信・ホームページ）のリッチメニュー画像を生成
 * 実行: node scripts/generate-richmenu-2col.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const W = 2500;
const H = 843;
const HALF = W / 2;

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="left" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f97316"/>
      <stop offset="100%" style="stop-color:#ea580c"/>
    </linearGradient>
    <linearGradient id="right" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#334155"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${HALF}" height="${H}" fill="url(#left)"/>
  <rect x="${HALF}" y="0" width="${HALF}" height="${H}" fill="url(#right)"/>
  <text x="${HALF/2}" y="${H/2}" font-family="Hiragino Sans, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">処方箋送信</text>
  <text x="${HALF + HALF/2}" y="${H/2}" font-family="Hiragino Sans, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">ホームページ</text>
</svg>
`;

async function main() {
  const outPath = path.join(__dirname, "..", "public", "richmenu.jpg");
  const buf = await sharp(Buffer.from(svg))
    .jpeg({ quality: 90 })
    .toBuffer();
  fs.writeFileSync(outPath, buf);
  console.log(`生成完了: ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
