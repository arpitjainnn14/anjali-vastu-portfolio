import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Run against npm run dev: node scripts/check-motion.mjs
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const failures = [];
async function check(name, options, run) {
  const page = await browser.newPage(options);
  try {
    await page.goto(process.argv[2] || process.env.MOTION_TEST_URL || 'http://127.0.0.1:3000');
    await page.waitForFunction(() => document.querySelector('[data-stack]'));
    await page.waitForTimeout(1000);
    await run(page);
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(name);
    console.error(`FAIL ${name}: ${error.message}`);
  } finally {
    await page.close();
  }
}
try {
  await check('reduced-motion service scenes switch', { reducedMotion: 'reduce' }, async (page) => {
    await page.locator('[data-stack-slot]').nth(1).evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4, behavior: 'instant' }));
    await page.waitForTimeout(200);
    assert.equal(await page.locator('[data-stack-scene]').nth(1).evaluate(el => getComputedStyle(el).opacity), '1');
  });
  await check('changing reduced motion disables Lenis', {}, async (page) => {
    await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(200);
    assert.equal(await page.locator('html').evaluate(el => el.classList.contains('lenis')), false);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
  });
  await check('drawer scrolls without moving the page behind it', { viewport: { width: 800, height: 400 } }, async (page) => {
    await page.locator('header button').click();
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(400, 240);
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(700);
    assert.equal(await page.evaluate(() => window.scrollY), before);
    assert.ok(await page.locator('#mobile-drawer').evaluate(el => el.scrollTop) > 0);
    await page.keyboard.press('Escape');
    await page.mouse.move(400, 240);
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(700);
    assert.ok(await page.evaluate(() => window.scrollY) > before, 'page scrolling resumes after the drawer closes');
  });
  await check('FAQ cleanup finishes state and removes inline animation', {}, async (page) => {
    const summary = page.locator('details[data-ease-open] summary').first();
    await summary.evaluate(el => el.click());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(200);
    assert.equal(await page.locator('details[data-ease-open]').first().evaluate(el => el.open), false);
    assert.equal(await page.locator('.faq-body').first().evaluate(el => el.style.height), '');
  });
  await check('service cards fit a short viewport below the nav', { viewport: { width: 390, height: 500 }, reducedMotion: 'reduce' }, async (page) => {
    await page.locator('[data-stack-card]').first().evaluate(el => window.scrollTo({ top: el.parentElement.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }));
    const bounds = await page.locator('[data-stack-card]').first().boundingBox();
    assert.ok(bounds.y >= 64, `card top ${bounds.y} is hidden behind the navigation`);
    assert.ok(bounds.y + bounds.height <= 500, 'card extends below the viewport');
  });
} finally {
  await browser.close();
}
if (failures.length) process.exitCode = 1;
