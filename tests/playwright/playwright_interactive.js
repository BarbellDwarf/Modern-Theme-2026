const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const outdir = path.resolve(__dirname, '../../screenshots');
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });
  const log = path.join(outdir, 'playwright_interactive.log');
  function logLine(...args) { fs.appendFileSync(log, new Date().toISOString() + ' ' + args.join(' ') + '\n'); }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => { try { logLine('CONSOLE', msg.type(), msg.text()); } catch (e) {} });
  page.on('pageerror', err => { try { logLine('PAGEERROR', err.message); } catch (e) {} });
  page.on('requestfailed', req => { try { logLine('REQFAILED', req.url(), JSON.stringify(req.failure())); } catch (e) {} });

  const base = process.env.BASE_URL || 'http://localhost:8081';
  try {
    logLine('navigate', base + '/user/auth/login');
    await page.goto(base + '/user/auth/login', { waitUntil: 'networkidle' });
    await page.fill("[name='Login[username]']", 'admin');
    await page.fill("[name='Login[password]']", 'admin123');
    await page.click("button[type='submit']");
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.screenshot({ path: path.join(outdir, 'dashboard_interactive.png') });
    logLine('dashboard screenshot saved');

    await page.goto(base + '/mail/mail/index', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outdir, 'mail_index_before.png') });
    logLine('mail index screenshot saved');

    const inboxLocator = page.locator('[data-mt2026-messages-inbox]');
    const hasInbox = (await inboxLocator.count()) > 0;
    logLine('inbox wrapper exists:', hasInbox);
    if (!hasInbox) { await browser.close(); return; }

    const items = page.locator('[data-mt2026-messages-inbox] li, [data-mt2026-messages-inbox] .messagePreviewEntry');
    const count = await items.count();
    logLine('items count', count);
    if (count === 0) {
      await page.screenshot({ path: path.join(outdir, 'mail_empty_interactive.png') });
      await browser.close();
      return;
    }

    for (let i = 0; i < Math.min(3, count); i++) {
      const item = items.nth(i);
      try {
        await item.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
        const visible = await item.isVisible();
        logLine('item', i, 'visible', visible);
        try {
          await item.hover({ timeout: 5000 });
          logLine('hovered item', i);
        } catch (e) {
          logLine('hover failed', e.message || e);
        }
        try {
          await item.click({ timeout: 5000 });
          logLine('clicked item', i);
        } catch (e) {
          logLine('click failed, falling back to evaluate', e.message || e);
          await item.evaluate(el => el.click());
        }
        await page.waitForTimeout(800);
        const convo = await page.waitForSelector('.conversation-entry-list, .mail-conversation-entry, .mt2026-composer, .mail-message-form', { timeout: 5000 }).catch(() => null);
        if (convo) {
          const shot = path.join(outdir, 'conversation_open_' + i + '.png');
          await page.screenshot({ path: shot });
          logLine('conversation opened, screenshot', shot);
          break;
        } else {
          logLine('no conversation visible after click on item', i);
          await page.goto(base + '/mail/mail/index', { waitUntil: 'networkidle' });
          await page.waitForTimeout(500);
        }
      } catch (err) {
        logLine('error interacting with item ' + i + ':', err && err.stack ? err.stack : err);
      }
    }

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outdir, 'mobile_mail_interactive.png') });
    logLine('mobile screenshot saved');
  } catch (err) {
    logLine('ERROR', err && err.stack ? err.stack : err);
    try { await page.screenshot({ path: path.join(outdir, 'error_interactive.png') }); } catch (e) {}
  } finally {
    await browser.close();
  }
})();
