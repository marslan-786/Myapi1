import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // GET: query params، POST: body params پڑھیں
  const { msisdn, otp } = req.method === "GET" ? req.query : req.body;

  if (!msisdn) {
    return res.status(400).json({ error: "msisdn is required" });
  }

  try {
    const params = new URLSearchParams();
    params.append("msisdn", msisdn);

    if (otp) {
      params.append("otp", otp);
      params.append("action", "verify_otp");
    }

    const response = await fetch("https://oopk.online/aliverificaitons/index.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const text = await response.text();

    // آپ چاہیں تو یہاں console.log لگا کر response دیکھ سکتے ہیں:
    // console.log("API Response:", text);

    // verify OTP کے لیے کامیابی چیک کریں
    if (otp) {
      if (text.toLowerCase().includes("success") || text.toLowerCase().includes("verified")) {
        return res.json({ success: true, message: "OTP verified successfully", response: text });
      } else {
        return res.json({ success: false, message: "OTP verification failed", response: text });
      }
    } else {
      // OTP بھیجنے کے بعد response
      return res.json({ success: true, message: "OTP sent successfully", response: text });
    }

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
}
