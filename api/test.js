// api/test.js
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

module.exports = async (req, res) => {
  let browser = null;
  try {
    // executablePath will be provided by chrome-aws-lambda on serverless envs
    const execPath = await chromium.executablePath || process.env.CHROME_PATH || null;

    browser = await puppeteer.launch({
      args: (chromium.args || []).concat(['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']),
      defaultViewport: chromium.defaultViewport || { width: 1280, height: 800 },
      executablePath: execPath,
      headless: chromium.headless ?? true,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; NEW 20) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36');

    // load the page that produces the cftoken
    await page.goto('https://ssyoutube.rip/en-a1/', { waitUntil: 'networkidle2', timeout: 60000 });

    // try to extract cftoken from DOM / scripts / window
    const cftoken = await page.evaluate(() => {
      const inp = document.querySelector('input[name="cftoken"]');
      if (inp) return inp.value;
      if (window && window.cftoken) return window.cftoken;
      const scripts = Array.from(document.scripts).map(s => s.innerText).join('\n');
      const m = scripts.match(/cftoken\s*[:=]\s*["']([^"']+)["']/);
      return m ? m[1] : null;
    });

    // build form body (allow overriding url via query param ?url=... )
    const targetUrl = req.query.url || req.body?.url || 'https://youtu.be/_n6ky63HA0k?si=plvLvbcxH4KKP6Vq';
    const postUrl = 'https://ssyoutube.rip/mates/en/analyze/ajax?retry=undefined&platform=youtube&mhash=3260637a95f60be9';
    const form = new URLSearchParams();
    form.append('url', targetUrl);
    form.append('ajax', '1');
    form.append('lang', 'en');
    form.append('cftoken', cftoken || '');

    // perform POST inside browser context so cookies/headers are same as page
    const responseText = await page.evaluate(async (url, bodyString) => {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://ssyoutube.rip/en-a1/',
          'Origin': 'https://ssyoutube.rip'
        },
        body: bodyString
      });
      return await r.text();
    }, postUrl, form.toString());

    // return the raw HTML/response from the service (or JSON if it's JSON)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(responseText);
  } catch (err) {
    console.error('puppeteer error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    try { if (browser) await browser.close(); } catch (e) { /* ignore */ }
  }
};
