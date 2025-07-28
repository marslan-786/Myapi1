export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      creator: "Nothing Is Impossible",
      status: false,
      message: "Missing 'url' query parameter",
    });
  }

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp4?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    // اگر API نے غلط رسپانس دیا
    if (!data || !data.result) {
      return res.status(500).json({
        creator: "Nothing Is Impossible",
        status: false,
        message: "Failed to fetch video details.",
      });
    }

    // کامیاب ریسپانس
    return res.status(200).json({
      creator: "Nothing Is Impossible",
      status: true,
      result: data.result,
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      creator: "Nothing Is Impossible",
      status: false,
      message: "Internal Server Error. " + error.message,
    });
  }
}
