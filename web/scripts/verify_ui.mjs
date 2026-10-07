import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const targetUrl = process.env.TARGET_URL || "http://160.250.4.230";
const outputDir = path.resolve(process.cwd(), ".ui_audit");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const VIEWPORTS = [
  { name: "mobile_iphone", width: 375, height: 812, isMobile: true, hasTouch: true },
  { name: "tablet_ipad", width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: "desktop_mac", width: 1280, height: 800, isMobile: false, hasTouch: false },
];

async function runAudit() {
  console.log(`🚀 Bắt đầu kiểm thử giao diện trực quan tại: ${targetUrl}`);
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    console.log(`\n📱 Kiểm tra Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });

    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });

    // 1. Chụp trang chủ / Thẻ học số
    const homeShot = path.join(outputDir, `${vp.name}_1_the_hoc.png`);
    await page.screenshot({ path: homeShot, fullPage: false });
    console.log(`   ✓ Đã chụp Thẻ Học Số -> ${homeShot}`);

    // 2. Chuyển sang mục "Bé Tập Viết"
    try {
      const writingBtn = page.getByRole("button", { name: /Bé Tập Viết/i });
      if (await writingBtn.isVisible()) {
        await writingBtn.click();
        await page.waitForTimeout(800);
        const writingShot = path.join(outputDir, `${vp.name}_2_tap_viet.png`);
        await page.screenshot({ path: writingShot, fullPage: false });
        console.log(`   ✓ Đã chụp Bé Tập Viết -> ${writingShot}`);
      }
    } catch (e) {
      console.warn(`   ⚠ Không chuyển được sang Bé Tập Viết:`, e.message);
    }

    // 3. Chuyển sang mục "Tách - Gộp Số"
    try {
      const bondBtn = page.getByRole("button", { name: /Tách - Gộp/i });
      if (await bondBtn.isVisible()) {
        await bondBtn.click();
        await page.waitForTimeout(800);
        const bondShot = path.join(outputDir, `${vp.name}_3_tach_gop.png`);
        await page.screenshot({ path: bondShot, fullPage: false });
        console.log(`   ✓ Đã chụp Tách - Gộp Số -> ${bondShot}`);
      }
    } catch (e) {
      console.warn(`   ⚠ Không chuyển được sang Tách - Gộp:`, e.message);
    }

    // 4. Chuyển sang mục "Bé Tập Đếm"
    try {
      const countBtn = page.getByRole("button", { name: /Bé Tập Đếm/i });
      if (await countBtn.isVisible()) {
        await countBtn.click();
        await page.waitForTimeout(800);
        const countShot = path.join(outputDir, `${vp.name}_4_tap_dem.png`);
        await page.screenshot({ path: countShot, fullPage: false });
        console.log(`   ✓ Đã chụp Bé Tập Đếm -> ${countShot}`);
      }
    } catch (e) {
      console.warn(`   ⚠ Không chuyển được sang Bé Tập Đếm:`, e.message);
    }

    await context.close();
  }

  await browser.close();
  console.log(`\n🎉 Hoàn thành kiểm thử trực quan! Mọi ảnh chụp lưu tại: ${outputDir}`);
}

runAudit().catch((err) => {
  console.error("❌ Lỗi kiểm thử giao diện:", err);
  process.exit(1);
});
