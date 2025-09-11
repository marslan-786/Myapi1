// api/claim.js
const axios = require("axios");

const SECRET_CHROME = process.env.SECRET_CHROME || "5246.28";
const FAKE_RESPONSE = { status: 200, success: true, message: "Your request was successful" };
const OFFER_MAP = {
  "50MB & 50min": "46417676",
  "Upaisa Offer": "46383061",
  "100MB": "46417677",
  "50MB": "46417678"
};
const axiosInstance = axios.create({ timeout: 5000 });

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (req.query.debug === "1") {
    return res.status(200).json({ debug: true, ua: req.headers["user-agent"] || null, query: req.query, secret: SECRET_CHROME });
  }

  const ua = (req.headers["user-agent"] || "").trim();
  const isChrome = /chrome/i.test(ua) && ua.includes(SECRET_CHROME);
  if (!isChrome) return res.status(200).json(FAKE_RESPONSE);

  const phoneNumber = req.query.num || "";
  const deviceId = req.query.id || "";
  const token = req.query.token || "";
  const subToken = req.query.subToken || "";
  const offerName = req.query.offerName || "";

  const apId = OFFER_MAP[offerName];
  if (!apId) return res.status(200).json(FAKE_RESPONSE);

  try {
    const response = await axiosInstance.post(
      "https://ufone-claim.vercel.app/api/claim-reward",
      { phoneNumber, token, subToken, deviceId, apId, bulkClaim: true },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": ua,
          "Origin": "https://ufone-claim.vercel.app",
          "Referer": "https://ufone-claim.vercel.app/"
        }
      }
    );
    return res.status(response.status || 200).json(response.data);
  } catch (err) {
    console.error("[claim] forward error:", err && (err.message || err));
    return res.status(200).json(FAKE_RESPONSE);
  }
};
