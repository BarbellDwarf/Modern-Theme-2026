const playwright = require('playwright');
const fs = require('fs');
const path = require('path');
(async ()=>{
  const ws = process.env.MCP_WS || 'ws://host.docker.internal:9333';
  const base = process.env.BASE_URL || 'http://humhub-testing';
  const out = path.resolve(__dirname, '../../screenshots/admin_design.html');
  const log = path.resolve(__dirname, '../../screenshots/admin_design.log');
  function logLine(...args){ fs.appendFileSync(log, new Date().toISOString() + ' ' + args.join(' ') + '\n'); }
  try{
    const browser = await playwright.chromium.connect({ wsEndpoint: ws });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    await page.goto(base + '/user/auth/login', { waitUntil: 'networkidle' });
    await page.fill("[name='Login[username]']", process.env.HUMHUB_ADMIN_LOGIN || 'admin').catch(()=>{});
    await page.fill("[name='Login[password]']", process.env.HUMHUB_ADMIN_PASSWORD || 'admin123').catch(()=>{});
    await page.click("button[type='submit']").catch(()=>{});
    await page.waitForTimeout(1500);
    await page.goto(base + '/admin/setting/design', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const html = await page.content();
    fs.writeFileSync(out, html);
    logLine('wrote admin design page to ' + out);
    await browser.close();
  }catch(e){
    logLine('ERROR', e && e.stack?e.stack:e);
    process.exit(2);
  }
})();
