import axios from 'axios';
import tough from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const TARGET = 'https://oopk.online/cyberghoost/activexx.php';

function extractMessage(html) {
  const re = /<div class="(?:msg-box|error-box)">([\s\S]*?)<\/div>/i;
  const m = html.match(re);
  if (!m) return null;
  return m[1].replace(/<[^>]*>/g, '').trim();
}

export default async function handler(req, res) {
  const { msisdn } = req.query;
  const number = (msisdn || '').trim();
  const offer = 'weekly';

  if (!/^\d{10,13}$/.test(number)) {
    return res.status(400).json({ success: false, error: 'Invalid MSISDN format' });
  }

  try {
    const jar = new tough.CookieJar();
    const client = wrapper(axios.create({ jar, withCredentials: true }));

    // Step 1: GET
    await client.get(TARGET, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    // Step 2: POST
    const params = new URLSearchParams();
    params.append('msisdn', number);
    params.append('offer', offer);

    const resp = await client.post(TARGET, params.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': TARGET,
        'Origin': 'https://oopk.online',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      maxRedirects: 5,
    });

    res.status(200).json({
      success: true,
      msisdn: number,
      offer,
      message: extractMessage(resp.data) || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
