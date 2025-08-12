export default async function handler(req, res) {
  const YouTube = (await import('youtubei.js')).default;

  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });

  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url query param' });

  const client = new YouTube();

  try {
    const video = await client.getVideo(url);
    const formats = video.streamingData.formats.map(format => ({
      itag: format.itag,
      qualityLabel: format.qualityLabel,
      mimeType: format.mimeType,
      url: format.url,
    }));

    const format360 = formats.find(f => f.qualityLabel === '360p');
    if (!format360) {
      return res.status(404).json({ error: '360p format not found' });
    }

    return res.json({
      title: video.title,
      url360: format360.url,
      allFormats: formats,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch video info', details: e.message });
  }
};
