export default async function handler(req, res) {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({
      creator: "Nothing Is Impossible",
      status: false,
      message: "Missing 'url' query parameter",
    });
  }

  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

    const externalApiUrl = `https://apis.davidcyriltech.my.id/youtube/mp4?url=${encodeURIComponent(videoUrl)}`;
    const response = await fetch(externalApiUrl);
    const data = await response.json();

    if (!data || !data.result) {
      return res.status(500).json({
        creator: "Nothing Is Impossible",
        status: false,
        message: "Failed to fetch video details.",
      });
    }

    return res.status(200).json({
      creator: "Nothing Is Impossible",
      status: true,
      result: data.result
    });

  } catch (error) {
    console.error("Error fetching video:", error);
    return res.status(500).json({
      creator: "Nothing Is Impossible",
      status: false,
      message: "Internal server error"
    });
  }
}
