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
  const log = path.join(outdir, 'messenger_send_mcp_v2.log');
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
    await page.screenshot({ path: path.join(outdir, 'messenger_v2_after_login.png') });

    // Go to mail index
    await page.goto(base + '/mail/mail/index', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outdir, 'messenger_v2_index.png') });

    // Try JS-driven click on first real message element (skip select2-search li)
    const clicked = await page.evaluate(() => {
      const root = document.querySelector('[data-mt2026-messages-inbox]') || document.querySelector('.inbox-wrapper') || document.querySelector('#inbox');
      if (!root) return { ok: false, reason: 'no-root' };
      const candidates = Array.from(root.querySelectorAll('li'))
        .filter(el => !el.classList.contains('select2-search') && !el.classList.contains('select2-search--inline') && el.textContent && el.textContent.trim().length > 0);
      if (!candidates || candidates.length === 0) return { ok: false, reason: 'no-items' };
      const el = candidates[0];
      // prefer clicking anchor/button inside
      const btn = el.querySelector('a, button');
      try {
        if (btn) { btn.click(); }
        else { el.click(); }
        return { ok: true };
      } catch (e) { return { ok: false, reason: 'click-failed', err: String(e) }; }
    });

    logLine('evaluate click result', JSON.stringify(clicked));

    let composer = null;
    if (clicked && clicked.ok) {
      composer = await page.waitForSelector('.conversation-entry-list, .mail-conversation-entry, .mt2026-composer, .mail-message-form', { timeout: 4000 }).catch(() => null);
    }

    // If not opened, fallback to New message
    if (!composer) {
      logLine('Falling back to New message button');
      const newBtn = page.locator('#mail-conversation-create-button, a:has-text("New message"), button:has-text("New message")').first();
      if (await newBtn.count() > 0) {
        await newBtn.click().catch(e => logLine('newBtn click error', e && e.message ? e.message : e));
        await page.waitForTimeout(800);
        composer = await page.waitForSelector('.modal-dialog, .modal-content, .mail-message-form, .mt2026-composer', { timeout: 4000 }).catch(() => null);
      } else logLine('New message button not available');
    }

    if (!composer) {
      logLine('Composer still not found; dumping possible containers');
      const roots = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('body *')).slice(0,50).map(e => ({ tag: e.tagName, cls: e.className || null, id: e.id || null })).slice(0,100);
      });
      fs.writeFileSync(path.join(outdir,'messenger_v2_roots.json'), JSON.stringify(roots, null, 2));
      await page.screenshot({ path: path.join(outdir, 'messenger_v2_no_composer.png') });
      logLine('Composer not found, aborting send attempt');
    } else {
      logLine('Composer/modal detected, attempting recipients + send');
      await page.screenshot({ path: path.join(outdir, 'messenger_v2_composer.png') });

      // Try to focus/select recipient via select2
      const gotSelect2 = await page.locator('.modal .select2-search__field, .select2-search__field, .mail-message-form .select2-search__field').first().count();
      if (gotSelect2 > 0) {
        logLine('select2 search input exists, typing recipient');
        const sel = page.locator('.modal .select2-search__field, .select2-search__field, .mail-message-form .select2-search__field').first();
        await sel.fill('admin').catch(()=>{});
        await page.waitForTimeout(600);
        const opt = await page.waitForSelector('.select2-results__option, .select2-result-selectable', { timeout: 3000 }).catch(() => null);
        if (opt) { await opt.click().catch(e => logLine('opt click err', e && e.message ? e.message : e)); logLine('Selected recipient'); }
        else { logLine('No select2 option found'); }
      } else {
        logLine('No select2 input; trying fallback recipient input');
        const recip = page.locator('input[name*="recipients"], input[name*="participants"], input[placeholder*="Search"], input[type="text"]').first();
        if (await recip.count() > 0) { await recip.fill('admin').catch(()=>{}); await recip.press('Enter').catch(()=>{}); logLine('Filled fallback recipient'); }
        else logLine('No recipient input present');
      }

      // Fill message body (textarea or contenteditable)
      const textarea = page.locator('.modal textarea, textarea[name*="message"], textarea[name*="Message"], textarea.mail-textarea, .mail-message-form textarea').first();
      if (await textarea.count() > 0) {
        await textarea.fill('Automated MCP mobile v2 test message at ' + new Date().toISOString());
        logLine('Filled textarea');
      } else {
        const editable = page.locator('[contenteditable="true"]').first();
        if (await editable.count() > 0) { await editable.click(); await page.keyboard.type('Automated MCP mobile v2 test message at ' + new Date().toISOString(), { delay: 20 }); logLine('Filled contenteditable'); }
        else logLine('No composer to type into');
      }

      // Send
      const sendBtn = page.locator('.modal button:has-text("Send"), button:has-text("Send"), .modal button[type="submit"], button[type="submit"]').first();
      if (await sendBtn.count() > 0) { await sendBtn.click().catch(e => logLine('send click err', e && e.message ? e.message : e)); logLine('Clicked send'); }
      else {
        const alt = page.locator('.modal .btn-primary, .modal button.save, .modal button.btn-primary, button.save').first();
        if (await alt.count() > 0) { await alt.click().catch(e => logLine('alt send err', e && e.message ? e.message : e)); logLine('Clicked alt send'); }
        else logLine('No send button');
      }

      await page.waitForTimeout(1500);
      const success = await page.locator('.alert-success, .notification-success, .toast-success, text=sent, text=successfully').count();
      logLine('success indicators', success);
      await page.screenshot({ path: path.join(outdir, 'messenger_v2_after_send.png') });
    }

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
