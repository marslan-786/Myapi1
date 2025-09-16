// api/claim.js
const axios = require("axios");

const SECRET_CHROME = process.env.SECRET_CHROME || "5246.28";
const FAKE_RESPONSE = {
  status: 200,
  success: true,
  message: "Your request was successful"
};
const OFFER_MAP = {
  "50MB-50MIN": { apId: "46417676", incentiveValue: "50", value: "50" },
  "upaisa": { apId: "46383061", incentiveValue: "100", value: "100" },
  "50MB": { apId: "46417678", incentiveValue: "100", value: "100" },
  "100MB": { apId: "46417677", incentiveValue: "100", value: "100" },
  "3GB": { apId: "46417682", incentiveValue: "50", value: "50" },
  "2GB-10M": { apId: "46417679", incentiveValue: "50", value: "50" },
  "2GB-30M": { apId: "46417681", incentiveValue: "50", value: "50" },
  "1GB-20M": { apId: "46417680", incentiveValue: "50", value: "50" }
};
const axiosInstance = axios.create({ timeout: 5000 });

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const ua = (req.headers["user-agent"] || "").trim();
  const isChrome = /chrome/i.test(ua) && ua.includes(SECRET_CHROME);
  if (!isChrome) return res.status(200).json(FAKE_RESPONSE);

  const phoneNumber = req.query.num || "";
  const deviceId = req.query.id || "";
  const token = req.query.token || "";
  const subToken = req.query.subToken || "";
  const offerName = req.query.offerName || "";

  const offer = OFFER_MAP[offerName];
  if (!offer) return res.status(200).json(FAKE_RESPONSE);

  try {
    const response = await axiosInstance.post(
      "https://ufone-claim.vercel.app/api/claim-reward",
      {
        phoneNumber,
        token,
        subToken,
        deviceId,
        apId: offer.apId,
        incentiveValue: offer.incentiveValue,
        value: offer.value,
        bulkClaim: true
      },
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
