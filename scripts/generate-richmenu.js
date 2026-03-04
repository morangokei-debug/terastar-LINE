/**
 * リッチメニュー画像を生成するスクリプト
 * 実行: node scripts/generate-richmenu.js
 * 出力: public/richmenu.png
 *
 * フォントサイズを大きくする場合は FONT_SIZE を変更
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const W = 2500;
const H = 843;
const SEG_W = Math.floor(W / 3); // 833
const FONT_SIZE = 80; // 文字サイズ（スマホで見やすく大きく）
const ICON_SIZE = 80;

// 背景色（ティール系）
const COLORS = [
  "#0097a7", // 左
  "#00acc1", // 中央（やや明るい）
  "#00838f", // 右
];

const LABELS = ["処方箋送信", "ホームページ", "メッセージ入力"];

// アイコン（SVG path）: 処方箋、家、メッセージ
const ICONS = [
  `<path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm0 2h7v5h5v11H6V4zm2 8v2h8v-2H8zm0 4v2h8v-2H8z" fill="white"/>`,
  `<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" fill="white"/>`,
  `<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" fill="white"/>`,
];

function buildSvg() {
  const rects = COLORS.map(
    (c, i) =>
      `<rect x="${i * SEG_W}" y="0" width="${SEG_W}" height="${H}" fill="${c}"/>`
  ).join("\n");

  const iconGroups = ICONS.map((path, i) => {
    const cx = i * SEG_W + SEG_W / 2;
    const iconY = H * 0.35;
    return `<g transform="translate(${cx - ICON_SIZE / 2}, ${iconY - ICON_SIZE / 2})">
      <rect width="${ICON_SIZE}" height="${ICON_SIZE}" fill="transparent"/>
      <g transform="scale(${ICON_SIZE / 24}) translate(0,0)">
        ${path}
      </g>
    </g>`;
  }).join("\n");

  const textElements = LABELS.map((label, i) => {
    const x = i * SEG_W + SEG_W / 2;
    const y = H * 0.68;
    return `<text x="${x}" y="${y}" font-family="Hiragino Sans, Hiragino Kaku Gothic ProN, sans-serif" font-size="${FONT_SIZE}" font-weight="600" fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${rects}
  ${iconGroups}
  ${textElements}
</svg>`;
}

async function main() {
  const svg = buildSvg();
  const outPath = path.join(__dirname, "..", "public", "richmenu.png");

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outPath);

  console.log(`Generated: ${outPath}`);
  console.log(`Font size: ${FONT_SIZE}px`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
