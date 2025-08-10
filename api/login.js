import fetch from "node-fetch";

export default async function handler(req, res) {
  // Accept GET or POST only
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // GET میں query params، POST میں body پڑھیں
  const { msisdn, otp } = req.method === "GET" ? req.query : req.body;

  if (!msisdn) {
    return res.status(400).json({ error: "msisdn is required" });
  }

  try {
    if (!otp) {
      // Send OTP
      const response = await fetch("https://oopk.online/aliverificaitons/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ msisdn }),
      });
      const text = await response.text();
      return res.json({ message: "OTP sent", response: text });
    } else {
      // Verify OTP
      const response = await fetch("https://oopk.online/aliverificaitons/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ msisdn, otp }),
      });
      const text = await response.text();
      return res.json({ message: "OTP verified", response: text });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
