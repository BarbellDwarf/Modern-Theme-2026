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
  const log = path.join(outdir, 'messenger_send_mcp_v5.log');
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
    await page.screenshot({ path: path.join(outdir, 'messenger_v5_after_login.png') });

    // Go to mail index
    await page.goto(base + '/mail/mail/index', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outdir, 'messenger_v5_index.png') });

    // Click via DOM (message or new button)
    const domClick = await page.evaluate(() => {
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
        const btn = document.getElementById('mail-conversation-create-button') || Array.from(document.querySelectorAll('button,a')).find(e=>e.textContent && e.textContent.toLowerCase().includes('new message'));
        if (btn) { btn.click(); return { ok: true, method: 'new-btn' }; }
        return { ok: false, reason: 'no-target' };
      } catch (e) { return { ok: false, reason: 'exception', err: String(e) }; }
    });

    logLine('domClick', JSON.stringify(domClick));
    await page.waitForTimeout(800);

    let composer = await page.waitForSelector('.conversation-entry-list, .mail-conversation-entry, .mt2026-composer, .mail-message-form, .modal-dialog, .modal-content', { timeout: 5000 }).catch(() => null);
    if (!composer) {
      const loadCreate = await page.evaluate(() => {
        const btn = document.getElementById('mail-conversation-create-button');
        if (btn && btn.dataset && btn.dataset.actionClickUrl) return btn.dataset.actionClickUrl;
        const el = Array.from(document.querySelectorAll('[data-action-click-url]')).find(e=> e.dataset || e.getAttribute('data-action-click-url'));
        if (el) return el.dataset ? el.dataset.actionClickUrl : el.getAttribute('data-action-click-url');
        return null;
      });
      logLine('create url', loadCreate);
      if (loadCreate) {
        try {
          await page.goto(base + loadCreate, { waitUntil: 'networkidle' });
          await page.waitForTimeout(600);
          logLine('Direct navigated to create URL');
        } catch (e) { logLine('nav create failed', e && e.message ? e.message : e); }
      }
      composer = await page.waitForSelector('.conversation-entry-list, .mail-conversation-entry, .mt2026-composer, .mail-message-form, .modal-dialog, .modal-content', { timeout: 5000 }).catch(() => null);
    }

    if (!composer) {
      logLine('Composer not found; aborting');
      await page.screenshot({ path: path.join(outdir, 'messenger_v5_no_composer.png') });
    } else {
      logLine('Composer visible');
      await page.screenshot({ path: path.join(outdir, 'messenger_v5_composer.png') });

      // Recipient selection
      const selCount = await page.locator('.modal .select2-search__field, .select2-search__field, .mail-message-form .select2-search__field').first().count();
      if (selCount > 0) {
        const sel = page.locator('.modal .select2-search__field, .select2-search__field, .mail-message-form .select2-search__field').first();
        await sel.fill('admin').catch(()=>{});
        await page.waitForTimeout(600);
        const opt = await page.waitForSelector('.select2-results__option, .select2-result-selectable', { timeout: 3000 }).catch(() => null);
        if (opt) { await opt.click().catch(e=>logLine('opt click err', e && e.message ? e.message : e)); logLine('Selected recipient'); }
        else logLine('No select2 option available');
      } else {
        const recip = page.locator('input[name*="recipients"], input[name*="participants"], input[placeholder*="Search"]').first();
        if (await recip.count() > 0) { await recip.fill('admin').catch(()=>{}); await recip.press('Enter').catch(()=>{}); logLine('Filled fallback recipient'); }
        else logLine('No recipient input found');
      }

      // Set textarea via evaluate (handles hidden textarea or WYSIWYG)
      const messageText = 'Automated MCP mobile v5 message at ' + new Date().toISOString();
      const setRes = await page.evaluate((msg) => {
        const ta = document.querySelector('textarea#createmessage-message_input, textarea[name*="message"], textarea[name*="Message"]');
        try {
          if (ta) {
            ta.value = msg;
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const editable = document.querySelector('[contenteditable="true"]');
          if (editable) {
            editable.focus();
            editable.innerText = msg;
            editable.dispatchEvent(new Event('input', { bubbles: true }));
          }
          return {ok: true, ta: !!ta, editable: !!editable};
        } catch (e) { return { ok: false, err: String(e) }; }
      }, messageText);

      logLine('setRes', JSON.stringify(setRes));
      await page.waitForTimeout(400);

      // Click send via DOM evaluate to bypass viewport problems
      const sendRes = await page.evaluate(() => {
        const send = Array.from(document.querySelectorAll('button, a')).find(e => e.textContent && /\b(send|reply|send message|send now)\b/i.test(e.textContent));
        if (send) { try { send.click(); return { ok: true, text: send.textContent.trim().slice(0,100) }; } catch(e) { return { ok: false, err: String(e) }; } }
        return { ok: false, reason: 'no-send' };
      });

      logLine('sendRes', JSON.stringify(sendRes));
      await page.waitForTimeout(1500);

      // Proper success detection: check CSS alerts and text nodes separately
      const alertCount = await page.locator('.alert-success, .notification-success, .toast-success').count();
      const textSentCount = await page.locator('text="sent"').count().catch(()=>0);
      const textSuccessCount = await page.locator('text="successfully"').count().catch(()=>0);
      const success = (alertCount || 0) + (textSentCount || 0) + (textSuccessCount || 0);
      logLine('success detection counts', { alertCount, textSentCount, textSuccessCount, total: success });
      await page.screenshot({ path: path.join(outdir, 'messenger_v5_after_send.png') });
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
