// api/active.js
const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const TARGET = 'https://oopk.online/cyberghoost/activexx.php';

// Helper to extract message from HTML
function extractMessage(html) {
  const re = /<div class="(?:msg-box|error-box)">([\s\S]*?)<\/div>/i;
  const m = html.match(re);
  if (!m) return null;
  return m[1].replace(/<[^>]*>/g, '').trim();
}

module.exports = async (req, res) => {
  const { msisdn } = req.query; // Vercel میں /api/active/نمبر کیلئے rewrite لگائیں یا query میں نمبر آئے گا
  const offer = 'weekly';

  if (!msisdn || !/^\d{10,13}$/.test(msisdn.trim())) {
    return res.status(400).json({ success: false, error: 'Invalid MSISDN format' });
  }

  try {
    const jar = new tough.CookieJar();
    const client = wrapper(axios.create({ jar, withCredentials: true }));

    // Step 1: GET to get session cookie
    await client.get(TARGET, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    // Step 2: POST with msisdn and fixed offer
    const params = new URLSearchParams();
    params.append('msisdn', msisdn);
    params.append('offer', offer);

    const postResp = await client.post(TARGET, params.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': TARGET,
        'Origin': 'https://oopk.online',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      maxRedirects: 5,
    });

    const html = postResp.data;
    const message = extractMessage(html);

    res.status(200).json({
      success: true,
      msisdn,
      offer,
      message: message || null,
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
