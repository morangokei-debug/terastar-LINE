const webpush = require("web-push");

const keys = webpush.generateVAPIDKeys();

console.log("=== VAPID Keys 生成完了 ===");
console.log("");
console.log("以下を .env.local に追加してください（本番は Vercel 環境変数へ）:");
console.log("");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);
console.log("");
console.log("※ VAPID_SUBJECT は連絡先（mailto: か https:// で始まる）。");
console.log("※ PRIVATE_KEY は絶対にフロントやGitに公開しないこと。");
