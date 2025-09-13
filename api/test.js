const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

module.exports = async (req, res) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://ssyoutube.rip/en-a1/', { waitUntil: 'networkidle2' });
    const cftoken = await page.evaluate(() => document.querySelector('input[name="cftoken"]')?.value || '');
    
    res.status(200).json({ cftoken });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  } finally {
    if (browser) await browser.close();
  }
};
