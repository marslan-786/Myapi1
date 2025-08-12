const youtubedl = require('youtube-dl-exec');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });

  const url = req.query.url;
  let resolution = req.query.res || '360p';

  if (!url) return res.status(400).json({ error: 'Missing url query param' });

  if (!resolution.endsWith('p')) resolution += 'p';

  const formatMap = {
    '144p': '160+140',
    '240p': '133+140',
    '360p': '18',
    '480p': '135+140',
    '720p': '22',
  };

  const format = formatMap[resolution];
  if (!format) return res.status(400).json({ error: `Unsupported resolution: ${resolution}` });

  try {
    const output = await youtubedl(url, {
      format,
      getUrl: true,
      noWarnings: true,
    });
    return res.json({ downloadUrl: output });
  } catch (e) {
    return res.status(500).json({ error: 'yt-dlp error', details: e.message });
  }
};
