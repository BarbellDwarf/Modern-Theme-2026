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
  const log = path.join(outdir, 'messenger_send_mcp.log');
  function logLine(...args){ fs.appendFileSync(log, new Date().toISOString() + ' ' + args.join(' ') + '\n'); }

  logLine('Connecting to MCP', ws, 'base', base);
  let browser;
  try {
    browser = await playwright.chromium.connect({ wsEndpoint: ws });
    logLine('Connected to remote browser');

    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      isMobile: true
    });
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
    try { await page.waitForURL('**/dashboard**', { timeout:15000 }); } catch(e) {}
    logLine('After login url', page.url());
    await page.screenshot({ path: path.join(outdir, 'messenger_send_after_login.png') });

    // Go to mail index
    logLine('Navigate to mail index');
    await page.goto(base + '/mail/mail/index', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outdir, 'messenger_send_index.png') });

    // Try open existing conversation or create a new one
    const itemSelectors = [
      '[data-mt2026-messages-inbox] li',
      '[data-mt2026-messages-inbox] .messagePreviewEntry',
      '.inbox-wrapper .hh-list li',
      '.mail-list li',
      '.messagePreview',
      '.mail-entry'
    ];
    let usedSel = null;
    for (const sel of itemSelectors) {
      const c = await page.locator(sel).count();
      logLine('selector', sel, 'count', c);
      if (c > 0) { usedSel = sel; break; }
    }

    if (usedSel) {
      logLine('Opening first message using', usedSel);
      const item = page.locator(usedSel).first();
      await item.scrollIntoViewIfNeeded().catch(e => logLine('scrollIntoView failed', e && e.message ? e.message : e));
      await item.click({ timeout: 5000 }).catch(async e => { logLine('click failed', String(e)); await item.evaluate(el => el.click()); });
      await page.waitForTimeout(800);
    } else {
      logLine('No messages; clicking new message button');
      const newBtn = page.locator('#mail-conversation-create-button, a:has-text("New message"), button:has-text("New message")').first();
      if (await newBtn.count() > 0) {
        await newBtn.click().catch(e => logLine('newBtn click error', e && e.message ? e.message : e));
        await page.waitForTimeout(800);
      } else {
        logLine('New message button not found');
      }
    }

    // Wait for composer/modal
    const composer = await page.waitForSelector('.modal-dialog, .modal-content, .mail-message-form, .mt2026-composer', { timeout: 5000 }).catch(() => null);
    if (!composer) {
      logLine('Composer/modal not found');
      await page.screenshot({ path: path.join(outdir, 'messenger_send_no_composer.png') });
    } else {
      logLine('Composer visible');
      await page.screenshot({ path: path.join(outdir, 'messenger_send_modal.png') });

      // Try recipient select2
      const select2Input = page.locator('.modal .select2-search__field, .select2-search__field').first();
      if (await select2Input.count() > 0) {
        logLine('Found select2 input, typing recipient');
        await select2Input.fill('admin').catch(()=>{});
        await page.waitForTimeout(500);
        const opt = await page.waitForSelector('.select2-results__option, .select2-result-selectable', { timeout: 3000 }).catch(() => null);
        if (opt) {
          await opt.click().catch(e => logLine('opt click failed', e && e.message ? e.message : e));
          logLine('Selected recipient via select2');
        } else {
          logLine('No select2 option found; pressing Enter');
          try { await page.keyboard.press('Enter'); } catch(e) {}
        }
      } else {
        logLine('No select2 input inside modal; trying fallback inputs');
        const recip = page.locator('input[name*="recipients"], input[name*="participants"], input[placeholder*="Search"], input[type="text"]').first();
        if (await recip.count() > 0) {
          await recip.fill('admin').catch(()=>{});
          await recip.press('Enter').catch(()=>{});
          logLine('Filled fallback recipient input');
        } else logLine('No recipient input found');
      }

      // Fill message body
      const textarea = page.locator('.modal textarea, textarea[name*="message"], textarea[name*="Message"], textarea.mail-textarea').first();
      if (await textarea.count() > 0) {
        await textarea.fill('Automated MCP mobile test message at ' + new Date().toISOString());
        logLine('Filled textarea');
      } else {
        logLine('No textarea; trying contenteditable');
        const editable = page.locator('[contenteditable="true"]').first();
        if (await editable.count() > 0) {
          await editable.click();
          await page.keyboard.type('Automated MCP mobile test message at ' + new Date().toISOString(), { delay: 20 });
          logLine('Filled contenteditable composer');
        } else logLine('No composer found to type into');
      }

      // Click send
      const sendBtn = page.locator('.modal button:has-text("Send"), button:has-text("Send"), .modal button[type="submit"], button[type="submit"]').first();
      if (await sendBtn.count() > 0) {
        await sendBtn.click().catch(e => logLine('send click error', e && e.message ? e.message : e));
        logLine('Clicked send');
      } else {
        logLine('Send button not found; trying alt selectors');
        const alt = page.locator('.modal .btn-primary, .modal button.save, .modal button.btn-primary, button.save').first();
        if (await alt.count() > 0) {
          await alt.click().catch(e => logLine('alt send error', e && e.message ? e.message : e));
          logLine('Clicked alt send');
        } else logLine('No send button available');
      }

      await page.waitForTimeout(1500);
      const success = await page.locator('.alert-success, .notification-success, .toast-success, text=sent, text=successfully').count();
      logLine('success indicators count', success);
      await page.screenshot({ path: path.join(outdir, 'messenger_send_after_send.png') });
    }

    // Also capture mobile viewport / visual
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outdir, 'messenger_send_mobile_view.png') });

    await context.close();
    await browser.close();
    logLine('Done');
    process.exit(0);

  } catch (err) {
    logLine('ERROR', err && err.stack ? err.stack : err);
    try { if (browser) await browser.close(); } catch (e) {}
    process.exit(2);
  }
})();
