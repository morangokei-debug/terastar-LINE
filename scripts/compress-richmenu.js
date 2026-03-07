/**
 * richmenu.png を 1MB 以下に圧縮（LINEリッチメニュー制限）
 * 実行: node scripts/compress-richmenu.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "..", "public", "richmenu.png");
const OUTPUT = path.join(__dirname, "..", "public", "richmenu.png");
const MAX_BYTES = 950 * 1024; // 950KB に収める（余裕を持たせる）

async function main() {
  const orig = fs.statSync(INPUT).size;
  console.log(`元ファイル: ${(orig / 1024).toFixed(1)} KB`);

  // PNG は compressionLevel のみ。まず最大圧縮を試す
  let buf = await sharp(INPUT)
    .png({ compressionLevel: 9 })
    .toBuffer();

  // まだ大きい場合は JPEG に変換（LINE は JPEG 対応）
  if (buf.length > MAX_BYTES) {
    console.log("PNG圧縮では1MBを超えるため、JPEGに変換します");
    buf = await sharp(INPUT)
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  if (buf.length > MAX_BYTES) {
    buf = await sharp(INPUT)
      .jpeg({ quality: 70 })
      .toBuffer();
  }

  if (buf.length > MAX_BYTES) {
    console.error(`圧縮後も ${(buf.length / 1024).toFixed(1)} KB で 1MB を超えます。`);
    process.exit(1);
  }

  const ext = buf[0] === 0xff && buf[1] === 0xd8 ? "jpg" : "png";
  const outPath = ext === "jpg" ? OUTPUT.replace(".png", ".jpg") : OUTPUT;
  fs.writeFileSync(outPath, buf);
  if (ext === "jpg" && OUTPUT !== outPath) {
    console.log("JPEGで保存しました。APIルートを richmenu.jpg に更新してください。");
  }
  console.log(`圧縮後: ${(buf.length / 1024).toFixed(1)} KB`);
  console.log("完了");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
