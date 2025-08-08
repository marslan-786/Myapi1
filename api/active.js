// api/active.js  (Vercel-ready, ESM)
import axios from 'axios';

const TARGET = 'https://oopk.online/cyberghoost/activexx.php';

function extractMessage(html) {
  const re = /<div class="(?:msg-box|error-box)">([\s\S]*?)<\/div>/i;
  const m = html.match(re);
  if (!m) return null;
  return m[1].replace(/<[^>]*>/g, '').trim();
}

export default async function handler(req, res) {
  const msisdn = (req.query.msisdn || '').trim();
  const offer = 'weekly';

  if (!/^\d{10,13}$/.test(msisdn)) {
    return res.status(400).json({ success: false, error: 'Invalid MSISDN format' });
  }

  try {
    // --- STEP 1: GET to obtain Set-Cookie (do not throw on non-2xx)
    const getResp = await axios.get(TARGET, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 5,
      validateStatus: null, // IMPORTANT: don't throw on 4xx/5xx
      timeout: 15000,
    });

    // Build Cookie header from Set-Cookie (if any)
    const setCookie = getResp.headers?.['set-cookie'];
    let cookieHeader = '';
    if (Array.isArray(setCookie) && setCookie.length) {
      // keep only "name=value" parts
      cookieHeader = setCookie.map(c => c.split(';')[0]).join('; ');
    }

    // --- STEP 2: POST form with same cookie (also do not throw)
    const params = new URLSearchParams();
    params.append('msisdn', msisdn);
    params.append('offer', offer);

    const postResp = await axios.post(TARGET, params.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': TARGET,
        'Origin': 'https://oopk.online',
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
      },
      maxRedirects: 5,
      validateStatus: null, // IMPORTANT
      timeout: 20000,
    });

    // Prepare output (show status/body snippet so we can debug 503 etc.)
    const status = postResp.status;
    const body = typeof postResp.data === 'string' ? postResp.data : JSON.stringify(postResp.data);
    const message = extractMessage(body);

    return res.status(200).json({
      success: true,
      msisdn,
      offer,
      target_status: status,
      cookie_sent: Boolean(cookieHeader),
      message: message || null,
      raw_snippet: message ? undefined : (body ? body.slice(0, 2000) : null),
    });

  } catch (err) {
    // If axios actually throws (network, timeout, DNS), return stack/message for debugging
    return res.status(500).json({
      success: false,
      error: err.message || String(err),
      stack: err.stack ? String(err.stack).slice(0, 2000) : undefined,
    });
  }
}
