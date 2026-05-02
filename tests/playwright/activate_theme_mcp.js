const playwright = require('playwright');
const fs = require('fs');
const path = require('path');
(async ()=>{
  const ws = process.env.MCP_WS || 'ws://host.docker.internal:9333';
  const base = process.env.BASE_URL || 'http://humhub-testing';
  const adminUser = process.env.HUMHUB_ADMIN_LOGIN || 'admin';
  const adminPass = process.env.HUMHUB_ADMIN_PASSWORD || 'admin123';
  const outdir = path.resolve(__dirname, '../../screenshots');
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });
  const log = path.join(outdir, 'activate_theme_mcp.log');
  function logLine(...args){ fs.appendFileSync(log, new Date().toISOString() + ' ' + args.join(' ') + '\n'); }
  try{
    logLine('connecting to MCP', ws);
    const browser = await playwright.chromium.connect({ wsEndpoint: ws });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    page.on('console', msg => logLine('CONSOLE', msg.type(), msg.text()));

    await page.goto(base + '/user/auth/login', { waitUntil: 'networkidle' });
    await page.fill("[name='Login[username]']", adminUser).catch(()=>{});
    await page.fill("[name='Login[password]']", adminPass).catch(()=>{});
    await page.click("button[type='submit']").catch(()=>{});
    await page.waitForURL('**/dashboard**', { timeout: 15000 }).catch(()=>{});
    logLine('logged in, url', page.url());

    await page.goto(base + '/admin/setting/design', { waitUntil: 'networkidle' });
    await page.waitForSelector('#designsettingsform-theme', { timeout: 5000 });
    await page.screenshot({ path: path.join(outdir, 'design_before.png') });
    try{
      await page.selectOption('#designsettingsform-theme', 'ModernTheme2026');
      logLine('selected ModernTheme2026');
    } catch(e){
      logLine('selectOption failed', e && e.message ? e.message : e);
      // fallback to interacting with select2 dropdown
      try{
        await page.click('#select2-designsettingsform-theme-container');
        await page.fill('.select2-search__field', 'ModernTheme2026');
        await page.keyboard.press('Enter');
        logLine('selected using select2 fallback');
      } catch(e2){ logLine('select2 fallback failed', e2 && e2.message ? e2.message : e2); }
    }
    await page.screenshot({ path: path.join(outdir, 'design_selected.png') });
    // submit form
    await page.click('form[action="/admin/setting/design"] button[type="submit"]');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outdir, 'design_after.png') });
    logLine('submitted design form');

    await browser.close();
  }catch(e){
    logLine('ERROR', e && e.stack ? e.stack : e);
    process.exit(2);
  }
})();
