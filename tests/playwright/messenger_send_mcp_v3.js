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
  const log = path.join(outdir, 'messenger_send_mcp_v3.log');
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
    await page.screenshot({ path: path.join(outdir, 'messenger_v3_after_login.png') });

    // Go to mail index
    await page.goto(base + '/mail/mail/index', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outdir, 'messenger_v3_index.png') });

    // Try evaluate click on message; fallback to evaluate click on New message button
    const clickResult = await page.evaluate(() => {
      try {
        const root = document.querySelector('[data-mt2026-messages-inbox]') || document.querySelector('.inbox-wrapper') || document.querySelector('#inbox');
        if (root) {
          const candidates = Array.from(root.querySelectorAll('li'))
            .filter(el => !el.classList.contains('select2-search') && !el.classList.contains('select2-search--inline') && el.textContent && el.textContent.trim().length > 0);
          if (candidates.length > 0) {
            const el = candidates[0];
            const btn = el.querySelector('a, button');
            if (btn) { btn.click(); return { ok: true, method: 'item-btn' }; }
            el.click(); return { ok: true, method: 'item-li' };
          }
        }
        // fallback: click the new message button via DOM
        const btn = document.getElementById('mail-conversation-create-button') || Array.from(document.querySelectorAll('button,a')).find(e=>e.textContent && e.textContent.toLowerCase().includes('new message'));
        if (btn) { btn.click(); return { ok: true, method: 'new-btn' }; }
        return { ok: false, reason: 'no-target' };
      } catch (e) { return { ok: false, reason: 'exception', err: String(e) }; }
    });

    logLine('dom-click result', JSON.stringify(clickResult));
    await page.waitForTimeout(800);

    const composer = await page.waitForSelector('.conversation-entry-list, .mail-conversation-entry, .mt2026-composer, .mail-message-form, .modal-dialog, .modal-content', { timeout: 6000 }).catch(() => null);
    if (!composer) {
      logLine('Composer not found after DOM click; attempting to force open modal via AJAX call');
      // Try to load create modal by fetching the URL used in data-action-click-url if visible in DOM
      const loadCreate = await page.evaluate(() => {
        const btn = document.getElementById('mail-conversation-create-button');
        if (btn && btn.dataset && btn.dataset.actionClickUrl) return btn.dataset.actionClickUrl;
        // try data-action-click-url attribute
        const el = Array.from(document.querySelectorAll('[data-action-click-url]')).find(e=> (e.dataset && e.dataset.actionClickUrl) || e.getAttribute('data-action-click-url'));
        if (el) return el.dataset ? el.dataset.actionClickUrl : el.getAttribute('data-action-click-url');
        return null;
      });
      logLine('found create url', loadCreate);
      if (loadCreate) {
        // attempt to load the modal content into the global modal (if HumHub's JS binds a global loader, this may not work); fallback to direct navigation
        try {
          await page.goto(base + loadCreate, { waitUntil: 'networkidle' });
          await page.waitForTimeout(600);
          logLine('Direct navigated to create URL');
        } catch(e) { logLine('direct nav failed', e && e.message ? e.message : e); }
      }
    }

    // Wait again for composer/modal
    const composer2 = await page.waitForSelector('.conversation-entry-list, .mail-conversation-entry, .mt2026-composer, .mail-message-form, .modal-dialog, .modal-content', { timeout: 5000 }).catch(() => null);
    if (!composer2) {
      logLine('Composer still not found, aborting');
      await page.screenshot({ path: path.join(outdir, 'messenger_v3_no_composer.png') });
    } else {
      logLine('Composer detected, attempting recipient + send');
      await page.screenshot({ path: path.join(outdir, 'messenger_v3_composer.png') });

      // Ensure parent containers allow visibility
      await page.evaluate(() => {
        document.querySelectorAll('.inbox-wrapper, #inbox, .hh-list, .mail-index').forEach(e => { try { e.style.overflow = 'auto'; } catch(e){} });
      });

      // Recipient selection (select2)
      const selExists = await page.locator('.modal .select2-search__field, .select2-search__field, .mail-message-form .select2-search__field').first().count();
      if (selExists > 0) {
        const sel = page.locator('.modal .select2-search__field, .select2-search__field, .mail-message-form .select2-search__field').first();
        await sel.fill('admin').catch(()=>{});
        await page.waitForTimeout(600);
        const opt = await page.waitForSelector('.select2-results__option, .select2-result-selectable', { timeout: 3000 }).catch(() => null);
        if (opt) { await opt.click().catch(e=>logLine('opt click err', e && e.message? e.message : e)); logLine('Selected recipient'); }
        else logLine('No select2 option found');
      } else {
        const recip = page.locator('input[name*="recipients"], input[name*="participants"], input[placeholder*="Search"]').first();
        if (await recip.count() > 0) { await recip.fill('admin').catch(()=>{}); await recip.press('Enter').catch(()=>{}); logLine('Filled fallback recipient'); }
        else logLine('No recipient input');
      }

      // Fill message
      const textarea = page.locator('.modal textarea, textarea[name*="message"], textarea[name*="Message"], textarea.mail-textarea, .mail-message-form textarea').first();
      if (await textarea.count() > 0) {
        await textarea.fill('Automated MCP mobile v3 test message at ' + new Date().toISOString());
        logLine('Filled textarea');
      } else {
        const editable = page.locator('[contenteditable="true"]').first();
        if (await editable.count() > 0) { await editable.click(); await page.keyboard.type('Automated MCP mobile v3 test message at ' + new Date().toISOString(), { delay: 20 }); logLine('Filled contenteditable'); }
        else logLine('No composer to type into');
      }

      // Click send via DOM evaluate fallback (bypass viewport checks)
      const sendClicked = await page.evaluate(() => {
        const send = Array.from(document.querySelectorAll('button, a')).find(e => e.textContent && /\b(send|reply|send message|send now)\b/i.test(e.textContent));
        if (send) { try { send.click(); return { ok: true }; } catch(e) { return { ok: false, err: String(e) }; } }
        return { ok: false, reason: 'no-send' };
      });
      logLine('sendClicked', JSON.stringify(sendClicked));
      await page.waitForTimeout(1500);
      const success = await page.locator('.alert-success, .notification-success, .toast-success, text=sent, text=successfully').count();
      logLine('success indicators', success);
      await page.screenshot({ path: path.join(outdir, 'messenger_v3_after_send.png') });
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
