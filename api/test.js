const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

module.exports = async (req, res) => {
  let browser = null;

  try {
    // اگر Vercel environment میں کوئی Chromium path available ہو تو use کریں
    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome';

    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // mobile-like user-agent
    await page.setUserAgent(
      'Mozilla/5.0 (Linux; Android 11; NEW 20) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36'
    );

    // target page جہاں cftoken generate ہوتا ہے
    await page.goto('https://ssyoutube.rip/en-a1/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // cftoken extract
    const cftoken = await page.evaluate(() => {
      const input = document.querySelector('input[name="cftoken"]');
      if (input) return input.value;
      if (window && window.cftoken) return window.cftoken;
      const scripts = Array.from(document.scripts)
        .map((s) => s.innerText)
        .join('\n');
      const match = scripts.match(/cftoken\s*[:=]\s*["']([^"']+)["']/);
      return match ? match[1] : null;
    });

    // target URL (query parameter یا default)
    const targetUrl =
      req.query.url || req.body?.url || 'https://youtu.be/_n6ky63HA0k?si=plvLvbcxH4KKP6Vq';

    const postUrl =
      'https://ssyoutube.rip/mates/en/analyze/ajax?retry=undefined&platform=youtube&mhash=3260637a95f60be9';

    const form = new URLSearchParams();
    form.append('url', targetUrl);
    form.append('ajax', '1');
    form.append('lang', 'en');
    form.append('cftoken', cftoken || '');

    // POST request inside browser to preserve cookies/session
    const responseText = await page.evaluate(
      async (url, bodyString) => {
        const r = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            Referer: 'https://ssyoutube.rip/en-a1/',
            Origin: 'https://ssyoutube.rip',
          },
          body: bodyString,
        });
        return await r.text();
      },
      postUrl,
      form.toString()
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(responseText);
  } catch (err) {
    console.error('puppeteer error:', err);
    res.status(500).json({ error: String(err) });
  } finally {
    if (browser) await browser.close();
  }
};
