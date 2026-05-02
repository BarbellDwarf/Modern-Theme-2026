const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const ws = process.env.MCP_WS || process.env.MCP_WS_ENDPOINT || 'ws://127.0.0.1:9333';
  const base = process.env.BASE_URL || 'http://humhub-testing';
  const adminUser = process.env.HUMHUB_ADMIN_LOGIN || 'admin';
  const adminPass = process.env.HUMHUB_ADMIN_PASSWORD || 'admin123';
  const outdir = path.resolve(__dirname, '../../screenshots');
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });
  const log = path.join(outdir, 'messenger_walkthrough_mcp.log');
  function logLine(...args){ fs.appendFileSync(log, new Date().toISOString() + ' ' + args.join(' ') + '\n'); }

  logLine('Connecting to MCP', ws, 'base', base);
  let browser;
  try {
    browser = await playwright.chromium.connect({ wsEndpoint: ws });
    logLine('Connected to remote browser');
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    page.on('console', msg => logLine('CONSOLE', msg.type(), msg.text()));
    page.on('pageerror', err => logLine('PAGEERROR', err.message));
    page.on('requestfailed', req => logLine('REQFAILED', req.url(), JSON.stringify(req.failure())));

    // Login
    logLine('Navigate to login');
    await page.goto(base + '/user/auth/login', { waitUntil: 'networkidle' });
    await page.fill("[name='Login[username]']", adminUser).catch(()=>{});
    await page.fill("[name='Login[password]']", adminPass).catch(()=>{});
    await page.click("button[type='submit']").catch(()=>{});
    await page.waitForTimeout(1200);
    try { await page.waitForURL('**/dashboard**', { timeout:15000 }); } catch(e) { /* continue */ }
    logLine('After login url', page.url());
    await page.screenshot({ path: path.join(outdir, 'messenger_after_login.png') });

    // Navigate to messages
    logLine('Navigate to messages index');
    await page.goto(base + '/mail/mail/index', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const mailIndexShot = path.join(outdir, 'messenger_index.png');
    await page.screenshot({ path: mailIndexShot });
    logLine('Saved', mailIndexShot);

    // Try to find inbox wrapper
    const inboxSelectorCandidates = [
      '[data-mt2026-messages-inbox]',
      '.mail-index',
      '#mail-inbox',
      '.mail-entries',
      '.message-list'
    ];
    for (const sel of inboxSelectorCandidates) {
      const count = await page.locator(sel).count();
      logLine('selector', sel, 'count', count);
      if (count > 0) break;
    }

    // Find message items
    const itemSelectors = [
      '[data-mt2026-messages-inbox] li',
      '[data-mt2026-messages-inbox] .messagePreviewEntry',
      '.mail-list li',
      '.messagePreview',
      '.mail-entry'
    ];
    let itemsCount = 0;
    let usedSelector = null;
    for (const sel of itemSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) { itemsCount = count; usedSelector = sel; logLine('found items with', sel, count); break; }
    }
    logLine('itemsCount', itemsCount);

    if (itemsCount === 0) {
      logLine('No messages found, attempting to open composer if available');
      const newBtn = page.locator('a', { hasText: 'New message' }).first();
      if ((await newBtn.count()) > 0) {
        await newBtn.click();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(outdir, 'messenger_composer_open.png') });
      } else {
        logLine('No composer or messages found');
      }
    } else {
      const openCount = Math.min(3, itemsCount);
      for (let i = 0; i < openCount; i++) {
        try {
          const item = await page.locator(usedSelector).nth(i);
          await item.scrollIntoViewIfNeeded();
          await page.waitForTimeout(300);
          await item.click({ timeout: 5000 }).catch(async () => { await item.evaluate(e => e.click()); });
          await page.waitForTimeout(800);
          const convo = await page.waitForSelector('.conversation-entry-list, .mail-conversation-entry, .mt2026-composer, .mail-message-form', { timeout: 5000 }).catch(() => null);
          if (convo) {
            const shot = path.join(outdir, 'messenger_conversation_' + i + '.png');
            await page.screenshot({ path: shot });
            logLine('Opened conversation', i, 'screenshot', shot);

            const composerCount = await page.locator('.mt2026-composer, .mail-message-form textarea, .message-composer, .composer').count();
            logLine('composerCount', composerCount);
            const sendBtnCount = await page.locator('button', { hasText: 'Send' }).count();
            logLine('send button count', sendBtnCount);
            const attachCount = await page.locator('input[type=file], button', { hasText: 'Attach' }).count();
            logLine('attach count', attachCount);
            break;
          } else {
            logLine('Conversation not visible after clicking item', i);
            await page.goto(base + '/mail/mail/index', { waitUntil: 'networkidle' });
            await page.waitForTimeout(500);
          }
        } catch (e) {
          logLine('error while opening item', i, e && e.message ? e.message : e);
        }
      }
    }

    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);
    const mobileShot = path.join(outdir, 'messenger_mobile.png');
    await page.screenshot({ path: mobileShot });
    logLine('saved mobile screenshot', mobileShot);

    await context.close();
    await browser.close();
    logLine('done');
    process.exit(0);
  } catch (err) {
    logLine('ERROR', err && err.stack ? err.stack : err);
    try { if (browser) await browser.close(); } catch (e) {}
    process.exit(2);
  }
})();
