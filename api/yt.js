const { execFile } = require('child_process');

const formatMap = {
  '144p': '160+140',
  '240p': '133+140',
  '360p': '18',
  '480p': '135+140',
  '720p': '22', // یا '136+140'
};

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed, use GET' });
  }

  const url = req.query.url;
  let resolution = req.query.res || '360p'; // ڈیفالٹ 360p

  if (!url) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  const format = formatMap[resolution];

  if (!format) {
    return res.status(400).json({ error: `Unsupported resolution: ${resolution}` });
  }

  execFile('yt-dlp', ['-f', format, '-g', url], (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: 'yt-dlp error', details: stderr.trim() });
    }

    const downloadUrl = stdout.trim();
    return res.json({ downloadUrl });
  });
};
