const express = require("express");
const axios = require("axios");
const serverless = require("serverless-http");
const app = express();

const SECRET_CHROME = "5246.28";
const FAKE_RESPONSE = {
  status: true,
  success: false,
  message: "Your request was successful, but this is a fake response."
};

// Offer mapping
const OFFER_MAP = {
  "50MB & 50min": "46417676",
  "Upaisa Offer": "46383061",
  "100MB": "46417677",
  "50MB": "46417678"
};

// GET endpoint
// Example: /api/ufone?type=send-otp&num=03350044704&id=abcd1234
app.get("/", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const type = req.query.type || "details";
  const phoneNumber = req.query.num || "0000";
  const deviceId = req.query.id || "xxxx";
  const offerName = req.query.offerName || "";

  const isChrome = userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME);

  // Browser mismatch → fake response
  if (!isChrome) return res.json(FAKE_RESPONSE);

  try {
    switch (type) {
      case "send-otp": {
        const response = await axios.get(
          `https://ufone-claim.vercel.app/api/generate-otp?phoneNumber=${phoneNumber}&deviceId=${deviceId}`,
          { headers: { "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      case "verify-otp": {
        const otp = req.query.otp || "";
        const response = await axios.post(
          "https://ufone-claim.vercel.app/api/verify-otp",
          { phoneNumber, otp, deviceId },
          { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      case "details": {
        const token = req.query.token || "";
        const subToken = req.query.subToken || "";
        const response = await axios.post(
          "https://ufone-claim.vercel.app/api/get-user-details",
          { phoneNumber, token, subToken, deviceId },
          { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      case "claim": {
        const apId = OFFER_MAP[offerName];
        if (!apId) return res.json(FAKE_RESPONSE);

        const token = req.query.token || "";
        const subToken = req.query.subToken || "";

        const response = await axios.post(
          "https://ufone-claim.vercel.app/api/claim-reward",
          { phoneNumber, token, subToken, deviceId, apId, bulkClaim: true },
          { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      default:
        return res.json(FAKE_RESPONSE);
    }
  } catch (err) {
    return res.json(FAKE_RESPONSE);
  }
});

module.exports = serverless(app);
