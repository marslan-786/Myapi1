// api/send-sms.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // صرف GET requests کو allow کرو
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed, use GET' });
    return;
  }

  const { mobile, message } = req.query;

  if (!mobile || !message) {
    res.status(400).json({ error: 'Missing mobile or message query parameters' });
    return;
  }

  try {
    const response = await fetch('https://pak-updates.xyz/send-sms', {
      method: 'POST', // اصل API کو POST ہی کرنا ہے
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, message }),
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(500).json({ error: data.error || 'Server error' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to server' });
  }
};
