const playwright = require('playwright');
const fs = require('fs');
const path = require('path');
(async ()=>{
  const ws = process.env.MCP_WS || 'ws://host.docker.internal:9333';
  const base = process.env.BASE_URL || 'http://humhub-testing';
  const out = path.resolve(__dirname, '../../screenshots/module_dom.html');
  const log = path.resolve(__dirname, '../../screenshots/module_dom.log');
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
    await page.goto(base + '/admin/module', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const moduleName = 'Modern Theme 2026';
    const html = await page.evaluate((m)=>{
      const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent && e.textContent.includes(m));
      if(!el) return null;
      const container = el.closest('div, li, section, article') || el.parentElement;
      return container ? container.outerHTML : el.outerHTML;
    }, moduleName);
    if(html){ fs.writeFileSync(out, html); logLine('wrote html to ' + out); }
    else logLine('module element not found on page');
    await browser.close();
  }catch(e){
    logLine('ERROR', e && e.stack?e.stack:e);
    process.exit(2);
  }
})();
