export default async function handler(req, res) {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: "📱 Phone number is required." });
  }

  const cleanPhone = phone.startsWith("0") ? phone.substring(1) : phone;

  const username = "Kami";
  const password = "123456";

  try {
    const fetchUrl = `https://pakdatabase.site/api/search.php?username=${username}&password=${password}&search_term=${cleanPhone}`;
    const response = await fetch(fetchUrl);
    const data = await response.json();

    const network = Object.keys(data)[0];
    const allRecords = data[network];

    // 🎯 تلاش کریں وہ ریکارڈ جس کا موبائل نمبر میچ ہو
    const matchedRecord = allRecords.find(entry => entry.Mobile.endsWith(cleanPhone));

    if (!matchedRecord) {
      return res.status(404).json({ error: "📵 No matching record found." });
    }

    const result = {
      Developer: "Nothing is Impossible 🜲",
      Mobile: matchedRecord.Mobile,
      Name: matchedRecord.Name,
      CNIC: matchedRecord.CNIC,
      Address: matchedRecord.Address.trim(),
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
