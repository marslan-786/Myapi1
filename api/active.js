// api.js
// GET <server>/<msisdn> will auto-run activation with offer=weekly
// Install: npm i express axios tough-cookie axios-cookiejar-support

const express = require('express');
const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const app = express();
const TARGET = 'https://oopk.online/cyberghoost/activexx.php';

// Helper to extract message from HTML
function extractMessage(html) {
  const re = /<div class="(?:msg-box|error-box)">([\s\S]*?)<\/div>/i;
  const m = html.match(re);
  if (!m) return null;
  return m[1].replace(/<[^>]*>/g, '').trim();
}

app.get('/:msisdn', async (req, res) => {
  const msisdn = req.params.msisdn.trim();
  const offer = 'weekly'; // fixed offer

  if (!/^\d{10,13}$/.test(msisdn)) {
    return res.status(400).json({ success: false, error: 'Invalid MSISDN format' });
  }

  try {
    // New cookie jar per request
    const jar = new tough.CookieJar();
    const client = wrapper(axios.create({ jar, withCredentials: true }));

    // Step 1: GET to get session cookie
    await client.get(TARGET, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.1 Safari/537.36',
      },
    });

    // Step 2: POST with msisdn and fixed offer
    const params = new URLSearchParams();
    params.append('msisdn', msisdn);
    params.append('offer', offer);

    const postResp = await client.post(TARGET, params.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.1 Safari/537.36',
        'Referer': TARGET,
        'Origin': 'https://oopk.online',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      maxRedirects: 5,
    });

    const html = postResp.data;
    const message = extractMessage(html);

    res.json({
      success: true,
      msisdn,
      offer,
      message: message || null,
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}/{msisdn}`);
    console.log(`Example: http://localhost:${PORT}/923027665767`);
  });
}

module.exports = app;
