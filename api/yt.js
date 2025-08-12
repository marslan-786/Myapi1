// yt.js
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET method allowed' });
  }

  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  try {
    // dynamic import کریں ES Module کو
    const { default: YouTube } = await import('youtubei.js');
    const youtube = new YouTube();

    const video = await youtube.getInfo(url);

    const title = video.title;
    const formats = video.streamingData.formats.map(format => ({
      itag: format.itag,
      qualityLabel: format.qualityLabel || format.quality || null,
      mimeType: format.mimeType,
      url: format.url,
      bitrate: format.bitrate || null,
      fps: format.fps || null,
      audioQuality: format.audioQuality || null,
    }));

    return res.json({ title, formats });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch video info', details: error.message });
  }
};
