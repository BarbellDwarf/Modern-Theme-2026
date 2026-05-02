const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const ws = process.env.MCP_WS || process.env.MCP_WS_ENDPOINT || 'ws://host.docker.internal:9333';
  const base = process.env.BASE_URL || 'http://humhub-testing';
  const adminUser = process.env.HUMHUB_ADMIN_LOGIN || 'admin';
  const adminPass = process.env.HUMHUB_ADMIN_PASSWORD || 'admin123';
  const moduleName = 'Modern Theme 2026';
  const outdir = path.resolve(__dirname, '../../screenshots');
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });
  const log = path.join(outdir, 'install_module_mcp.log');
  function logLine(...args){ fs.appendFileSync(log, new Date().toISOString() + ' ' + args.join(' ') + '\n'); }

  logLine('connecting to MCP', ws);

  let browser;
  try {
    browser = await playwright.chromium.connect({ wsEndpoint: ws });
    logLine('connected to remote browser');
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    page.on('console', msg => logLine('CONSOLE', msg.type(), msg.text()));
    page.on('pageerror', err => logLine('PAGEERROR', err.message));
    page.on('requestfailed', req => logLine('REQFAILED', req.url(), JSON.stringify(req.failure())));

    logLine('navigating to login', base + '/user/auth/login');
    await page.goto(base + '/user/auth/login', { waitUntil: 'networkidle' });
    await page.fill("[name='Login[username]']", adminUser).catch(()=>{});
    await page.fill("[name='Login[password]']", adminPass).catch(()=>{});
    await page.click("button[type='submit']").catch(()=>{});
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(() => null);
    logLine('logged in, current url', page.url());
    await page.screenshot({ path: path.join(outdir, 'after_login.png') });

    // Try direct admin modules page paths
    const adminPaths = ['/admin/module', '/admin/module/index', '/admin/module/manage', '/admin/modules', '/admin/marketplace'];
    let found = false;
    for (const p of adminPaths) {
      try {
        logLine('trying admin path', p);
        await page.goto(base + p, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        const count = await page.locator(`text="${moduleName}"`).count();
        logLine('module name matches at', p, 'count', count);
        if (count > 0) {
          found = true;
          // try to find install/enable button inside ancestor element
          const clicked = await page.evaluate((m) => {
            const nameEls = Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.includes(m));
            for (const el of nameEls) {
              let ancestor = el;
              for (let i = 0; i < 6 && ancestor; i++) {
                const candidates = Array.from(ancestor.querySelectorAll('button, a')).filter(b => {
                  const t = (b.textContent || '').trim();
                  return /\b(install|enable|activate|turn on|activate theme)\b/i.test(t) && !/uninstall/i.test(t);
                });
                if (candidates.length > 0) {
                  const btn = candidates[0];
                  btn.scrollIntoView();
                  btn.click();
                  return { clickedText: btn.textContent ? btn.textContent.trim() : null };
                }
                ancestor = ancestor.parentElement;
              }
            }
            return null;
          }, moduleName);
          logLine('clicked result', JSON.stringify(clicked));
          await page.waitForTimeout(2000);
          await page.screenshot({ path: path.join(outdir, 'after_attempt_' + p.replace(/\//g,'_') + '.png') });
          // Wait for success indicator (rudimentary)
          const success = await page.locator('text=installed, text=enabled, text=activated, text=successfully').count();
          logLine('success indicators count', success);
          break;
        }
      } catch (e) {
        logLine('error checking path ' + p + ':', e && e.message ? e.message : e);
      }
    }

    if (!found) {
      // Try via Admin menu link
      logLine('module not found on direct pages, trying admin menu navigation');
      await page.goto(base + '/admin', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      try {
        const modulesLink = page.locator('a', { hasText: 'Modules' }).first();
        if (await modulesLink.count() > 0) {
          await modulesLink.click().catch(e => logLine('click modules link error', e && e.message ? e.message : e));
          await page.waitForLoadState('networkidle');
        }
      } catch (e) { logLine('nav click failed', e && e.message ? e.message : e); }
      await page.waitForTimeout(1000);
      const count2 = await page.locator(`text="${moduleName}"`).count();
      logLine('after admin navigation module count', count2);
      if (count2 > 0) {
        const clicked2 = await page.evaluate((m) => {
          const nameEls = Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.includes(m));
          for (const el of nameEls) {
            let ancestor = el;
            for (let i = 0; i < 6 && ancestor; i++) {
              const candidates = Array.from(ancestor.querySelectorAll('button, a')).filter(b => {
                const t = (b.textContent || '').trim();
                return /\b(install|enable|activate|turn on|activate theme)\b/i.test(t) && !/uninstall/i.test(t);
              });
              if (candidates.length > 0) {
                const btn = candidates[0];
                btn.scrollIntoView();
                btn.click();
                return { clickedText: btn.textContent ? btn.textContent.trim() : null };
              }
              ancestor = ancestor.parentElement;
            }
          }
          return null;
        }, moduleName);
        logLine('clicked via admin nav result', JSON.stringify(clicked2));
        await page.screenshot({ path: path.join(outdir, 'after_admin_nav.png') });
      } else {
        logLine('module still not found in UI');
      }
    }

    logLine('Done script, taking final screenshot');
    await page.screenshot({ path: path.join(outdir, 'install_module_final.png') });

    await context.close();
    await browser.close();

  } catch (err) {
    logLine('ERROR', err && err.stack ? err.stack : err);
    try { if (browser) await browser.close(); } catch (e) {}
    process.exit(2);
  }
  process.exit(0);
})();
