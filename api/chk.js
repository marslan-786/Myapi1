const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const TARGET = 'https://oopk.online/telegram_alijan1117/activexx.php';

function extractMessage(html) {
  const re = /<div class="(?:msg-box|error-box)">([\s\S]*?)<\/div>/i;
  const m = html.match(re);
  if (!m) return null;
  return m[1].replace(/<[^>]*>/g, '').trim();
}

module.exports = async function handler(req, res) {
  const { msisdn } = req.query;
  const number = (msisdn || '').trim();
  const offer = 'weekly';

  if (!/^\d{10,13}$/.test(number)) {
    return res.status(400).json({ success: false, error: 'Invalid MSISDN format' });
  }

  try {
    // نیا cookie jar اور axios کلائنٹ
    const jar = new tough.CookieJar();
    const client = wrapper(axios.create({ jar, withCredentials: true }));

    // پہلے GET کر کے session بنائیں
    await client.get(TARGET, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    // یہاں 5 دفعہ POST کریں اور نتائج جمع کریں
    let responses = [];
    for (let i = 0; i < 50; i++) {
      const params = new URLSearchParams();
      params.append('msisdn', number);
      params.append('offer', offer);

      const resp = await client.post(TARGET, params.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': TARGET,
          'Origin': 'https://oopk.online',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        maxRedirects: 5,
      });
      responses.push(extractMessage(resp.data));
    }

    // پانچوں ریسپانسز واپس کر دیں
    res.status(200).json({
      success: true,
      msisdn: number,
      offer,
      messages: responses,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
