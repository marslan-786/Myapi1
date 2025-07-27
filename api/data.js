export default async function handler(req, res) {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: "📱 Phone number is required." });
  }

  // Step 1: Remove leading zero if present
  const cleanPhone = phone.startsWith("0") ? phone.substring(1) : phone;

  // Step 2: Hardcoded credentials
  const username = "Kami";
  const password = "123456";

  try {
    const fetchUrl = `https://pakdatabase.site/api/search.php?username=${username}&password=${password}&search_term=${cleanPhone}`;
    const response = await fetch(fetchUrl);
    const data = await response.json();

    // Step 3: Detect network name (like jazz, zong, etc.)
    const network = Object.keys(data)[0];
    const record = data[network][0];

    // Step 4: Prepare custom response
    const result = {
      Developer: "Nothing is Impossible 🜲",
      Mobile: record.Mobile,
      Name: record.Name,
      CNIC: record.CNIC,
      Address: record.Address.trim(),
      Network: network
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "🔧 Internal Server Error",
      detail: error.message
    });
  }
}
