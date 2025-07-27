export default async function handler(req, res) {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: "📱 Phone number is required." });
  }

  try {
    const fetchUrl = `https://legendxdata.site/Api/simdata.php?phone=${phone}`;
    const response = await fetch(fetchUrl);
    const data = await response.json();

    // Duplicate CNICs remove
    const seen = new Set();
    const unique = data.filter(entry => {
      if (seen.has(entry.CNIC)) return false;
      seen.add(entry.CNIC);
      return true;
    });

    res.status(200).json(unique);
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch SIM data." });
  }
}
