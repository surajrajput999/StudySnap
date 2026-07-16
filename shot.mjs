import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotsDir = path.join(__dirname, 'public', 'screenshots');
fs.mkdirSync(shotsDir, { recursive: true });

const BASE = 'http://localhost:3000';
const shot = (page, name) => page.screenshot({ path: path.join(shotsDir, `${name}.png`), fullPage: true });
const clickNav = async (page, label) => {
  const btn = page.locator('.sidebar-link', { hasText: label });
  if (await btn.count() > 0) { await btn.click(); await page.waitForTimeout(600); }
};

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ── Desktop ──
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 1. Dashboard
  await clickNav(page, 'Dashboard'); await page.waitForTimeout(600);
  await shot(page, 'dashboard-desktop');

  // 2. Note Editor
  await clickNav(page, 'Note Editor'); await page.waitForTimeout(600);
  await shot(page, 'note-editor');

  // 3. AI Assistant
  await clickNav(page, 'AI Assistant'); await page.waitForTimeout(600);
  await shot(page, 'ai-assistant');

  // 4. Voice Notes
  await clickNav(page, 'Voice Notes'); await page.waitForTimeout(600);
  await shot(page, 'voice-notes');

  // 5. Revision Calendar
  await clickNav(page, 'Revision'); await page.waitForTimeout(600);
  await shot(page, 'revision-calendar');

  // 6. Profile
  await clickNav(page, 'Profile'); await page.waitForTimeout(600);
  await shot(page, 'profile-dashboard');

  // 7. Dark Mode Dashboard
  const themeBtn = page.locator('.header-icon-btn');
  if (await themeBtn.count() > 0) { await themeBtn.click(); await page.waitForTimeout(800); }
  await clickNav(page, 'Dashboard'); await page.waitForTimeout(600);
  await shot(page, 'dark-dashboard');

  await ctx.close();

  // ── Mobile ──
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobPage = await mobileCtx.newPage();

  await mobPage.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await mobPage.waitForTimeout(2000);

  // 8. Mobile Dashboard
  await shot(mobPage, 'mobile-dashboard');

  // 9. Mobile AI Assistant
  const mobAiBtn = mobPage.locator('.bottom-nav-link', { hasText: 'AI Assistant' });
  if (await mobAiBtn.count() > 0) { await mobAiBtn.click(); await mobPage.waitForTimeout(600); }
  await shot(mobPage, 'mobile-ai');

  // 10. Mobile Note Editor
  const mobEditorBtn = mobPage.locator('.bottom-nav-link', { hasText: 'Note Editor' });
  if (await mobEditorBtn.count() > 0) { await mobEditorBtn.click(); await mobPage.waitForTimeout(600); }
  await shot(mobPage, 'mobile-editor');

  await mobileCtx.close();
  await browser.close();
  console.log('✅ All 10 screenshots captured in public/screenshots/');
})();
