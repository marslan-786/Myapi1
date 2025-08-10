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
      // Send OTP - no action parameter needed as per your observation
      const response = await fetch("https://oopk.online/aliverificaitons/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ msisdn }),
      });
      const text = await response.text();
      return res.json({ success: true, message: "OTP sent successfully", response: text });
    } else {
      // Verify OTP - with action parameter
      const response = await fetch("https://oopk.online/aliverificaitons/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ 
          msisdn, 
          otp,
          action: "verify_otp" // Adding action parameter for verification
        }),
      });
      const text = await response.text();
      
      // Check verification success
      if (text.includes("success") || text.includes("verified")) {
        return res.json({ success: true, message: "OTP verified successfully", response: text });
      } else {
        return res.json({ success: false, message: "OTP verification failed", response: text });
      }
    }
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      error: err.message,
      message: "An error occurred while processing your request"
    });
  }
}
