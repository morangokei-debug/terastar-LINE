const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE_URL = process.env.BASE_URL || "https://terastar-line.vercel.app";
const OUTPUT_DIR = path.join(__dirname, "..", "docs", "manual", "images");
const PUBLIC_DIR = path.join(__dirname, "..", "public", "manual");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const pages = [
  { path: "/", filename: "step01-top.png" },
  { path: "/login", filename: "step02-login.png" },
  { path: "/welcome", filename: "step03-welcome.png" },
];

async function captureWithLogin() {
  const email = process.env.CAPTURE_LOGIN_EMAIL;
  const password = process.env.CAPTURE_LOGIN_PASSWORD;
  if (!email || !password) return [];

  return [
    { path: "/dashboard", filename: "step04-dashboard.png" },
    { path: "/dashboard/patients", filename: "step05-patients.png" },
    { path: "/dashboard/follow-up-patterns", filename: "step06-patterns.png" },
    { path: "/dashboard/handover", filename: "step07-handover.png" },
    { path: "/dashboard/follow-up-replies", filename: "step08-replies.png" },
    { path: "/dashboard/chat", filename: "step09-chat.png" },
    { path: "/dashboard/broadcast", filename: "step10-broadcast.png" },
    { path: "/dashboard/prescription-requests", filename: "step11-prescriptions.png" },
    { path: "/dashboard/settings", filename: "step12-settings.png" },
  ];
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });

  const allPages = [...pages];
  const loginPages = await captureWithLogin();
  allPages.push(...loginPages);

  let pageObj = await context.newPage();

  for (const page of allPages) {
    try {
      const isDashboard = loginPages.some((lp) => lp.path === page.path);
      if (isDashboard && page.path === loginPages[0].path) {
        await pageObj.goto(BASE_URL + "/login", { waitUntil: "domcontentloaded", timeout: 30000 });
        await pageObj.waitForTimeout(1500);
        await pageObj.fill('input[type="email"]', process.env.CAPTURE_LOGIN_EMAIL);
        await pageObj.fill('input[type="password"]', process.env.CAPTURE_LOGIN_PASSWORD);
        await pageObj.click('button[type="submit"]');
        await pageObj.waitForTimeout(4000);
        await pageObj.goto(BASE_URL + page.path, { waitUntil: "domcontentloaded", timeout: 30000 });
        await pageObj.waitForTimeout(2000);
      } else {
        await pageObj.goto(BASE_URL + page.path, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await pageObj.waitForTimeout(2000);
      }

      const outPath = path.join(OUTPUT_DIR, page.filename);
      await pageObj.screenshot({ path: outPath, fullPage: true });
      fs.copyFileSync(outPath, path.join(PUBLIC_DIR, page.filename));
      console.log("Captured:", page.filename);
    } catch (err) {
      console.warn("Skip", page.filename, err.message);
    }
  }

  await pageObj.close();

  await browser.close();
  console.log("Done.");
})();
