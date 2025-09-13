// npm i puppeteer puppeteer-extra puppeteer-extra-plugin-stealth node-fetch
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fetch = require('node-fetch');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: true /* یا false اگر detect ہو تو */ , args:['--no-sandbox']});
  const page = await browser.newPage();

  // set user-agent similar to real mobile/desktop
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; NEW 20) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36');

  // کھولو وہ پیج جہاں سے فارم/ٹوکن بنتا ہے
  await page.goto('https://ssyoutube.rip/en-a1/', { waitUntil: 'networkidle2', timeout: 60000 });

  // اگر token input form میں ہے تو اسی طرح پکڑ لو
  let cftoken = await page.evaluate(() => {
    const inp = document.querySelector('input[name="cftoken"]');
    if (inp) return inp.value;
    // یا کہیں JS variable میں ہو تو تلاش:
    if (window && window.cftoken) return window.cftoken;
    // تلاشِ عام: تمام scripts میں دیکھنا (آسان مگر noisy)
    const scripts = Array.from(document.scripts).map(s => s.innerText).join('\n');
    const m = scripts.match(/cftoken\s*[:=]\s*["']([^"']+)["']/);
    return m ? m[1] : null;
  });

  console.log('cftoken:', cftoken);

  // اب اسی session سے اگر آپ نے cookies/headers لیے ہوں تو POST بھی کر سکتے ہو:
  const cookies = await page.cookies();
  const cookieHeader = cookies.map(c=>`${c.name}=${c.value}`).join('; ');

  // مثال POST (fetch) — ضروری headers اور body ویسے بھرو جیسا browser سے جاتا ہے
  const postUrl = 'https://ssyoutube.rip/mates/en/analyze/ajax?retry=undefined&platform=youtube&mhash=3260637a95f60be9';
  const form = new URLSearchParams();
  form.append('url', 'https://youtu.be/_n6ky63HA0k?si=plvLvbcxH4KKP6Vq');
  form.append('ajax', '1');
  form.append('lang', 'en');
  form.append('cftoken', cftoken || '');

  const res = await page.evaluate(async (url, body, cookieHeader) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://ssyoutube.rip/en-a1/',
        'Origin': 'https://ssyoutube.rip',
        'Cookie': cookieHeader
      },
      body: body.toString()
    });
    return await r.text();
  }, postUrl, form, cookieHeader);

  console.log('response length', res.length);
  await browser.close();
})();
