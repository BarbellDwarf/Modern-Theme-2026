const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const ws = process.env.MCP_WS || 'ws://127.0.0.1:9333';
  const base = process.env.BASE_URL || 'http://humhub-testing';
  const out = path.resolve(__dirname, '../../screenshots/debug_mail_dom.html');
  const log = path.resolve(__dirname, '../../screenshots/debug_mail_dom.log');
  function logLine(...args){ fs.appendFileSync(log, new Date().toISOString() + ' ' + args.join(' ') + '\n'); }
  try {
    const browser = await playwright.chromium.connect({ wsEndpoint: ws });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    await page.goto(base + '/user/auth/login', { waitUntil: 'networkidle' });
    await page.fill("[name='Login[username]']", process.env.HUMHUB_ADMIN_LOGIN || 'admin').catch(()=>{});
    await page.fill("[name='Login[password]']", process.env.HUMHUB_ADMIN_PASSWORD || 'admin123').catch(()=>{});
    await page.click("button[type='submit']").catch(()=>{});
    await page.waitForTimeout(1500);
    await page.goto(base + '/mail/mail/index', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const html = await page.evaluate(() => {
      const el = document.querySelector('[data-mt2026-messages-inbox]') || document.querySelector('.mail-index') || document.querySelector('#mail-inbox') || document.querySelector('.mail-entries') || document.querySelector('.message-list') || document.body;
      return el ? el.outerHTML : null;
    });
    if (html) { fs.writeFileSync(out, html); logLine('wrote html to ' + out); }
    else { logLine('inbox element not found'); }
    await browser.close();
  } catch (e) {
    logLine('ERROR', e && e.stack ? e.stack : e);
    process.exit(2);
  }
})();
