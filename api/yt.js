module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing url query param' });
  }

  try {
    // youtubei.js چونکہ ESM ہے، تو dynamic import کریں گے
    const { default: YouTube } = await import('youtubei.js');

    const youtube = new YouTube();

    const video = await youtube.getVideo(url);

    // available formats نکالیں
    const formats = video.streamingData.formats.map(format => ({
      itag: format.itag,
      qualityLabel: format.qualityLabel,
      mimeType: format.mimeType,
      url: format.url,
    }));

    // 360p فارمیٹ تلاش کریں
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
