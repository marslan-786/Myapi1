export default async function handler(req, res) {
  const { username, password, search_term } = req.query;

  if (!username || !password || !search_term) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  // Remove leading zero if present
  const cleanPhone = search_term.startsWith("0")
    ? search_term.substring(1)
    : search_term;

  try {
    const fetchUrl = `https://pakdatabase.site/api/search.php?username=Kami&password=123456&search_term=${cleanPhone}`;
    const response = await fetch(fetchUrl);
    const data = await response.json();

    // Get the first network name (like jazz, zong, etc.)
    const network = Object.keys(data)[0];
    const record = data[network][0];

    const customResponse = {
      Developer: "Nothing is Impossible 🜲",
      Mobile: record.Mobile,
      Name: record.Name,
      CNIC: record.CNIC,
      Address: record.Address.trim(),
      Network: network
    };

    return res.status(200).json(customResponse);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", detail: error.message });
  }
}
