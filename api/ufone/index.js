const express = require("express");
const axios = require("axios");
const serverless = require("serverless-http");

const app = express();

// Secret Chrome version
const SECRET_CHROME = "5246.28";

// Fake response template
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

// Axios instance with 3 seconds timeout
const axiosInstance = axios.create({ timeout: 3000 });

// GET endpoint: /api/ufone
// Example: /api/ufone?type=send-otp&num=03350044704&id=abcd1234
app.get("/api/ufone", async (req, res) => {
  try {
    const userAgent = req.headers["user-agent"] || "";
    const type = req.query.type || "details";
    const phoneNumber = req.query.num || "0000";
    const deviceId = req.query.id || "xxxx";
    const otp = req.query.otp || "";
    const token = req.query.token || "";
    const subToken = req.query.subToken || "";
    const offerName = req.query.offerName || "";

    const isChrome = userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME);

    // Browser mismatch → return fake response immediately
    if (!isChrome) {
      return res.status(200).json(FAKE_RESPONSE);
    }

    // Forward to real APIs
    switch (type) {
      case "send-otp": {
        const response = await axiosInstance.get(
          `https://ufone-claim.vercel.app/api/generate-otp?phoneNumber=${phoneNumber}&deviceId=${deviceId}`,
          { headers: { "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      case "verify-otp": {
        const response = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/verify-otp",
          { phoneNumber, otp, deviceId },
          { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      case "details": {
        const response = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/get-user-details",
          { phoneNumber, token, subToken, deviceId },
          { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      case "claim": {
        const apId = OFFER_MAP[offerName];
        if (!apId) return res.status(400).json(FAKE_RESPONSE);

        const response = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/claim-reward",
          { phoneNumber, token, subToken, deviceId, apId, bulkClaim: true },
          { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      default:
        return res.status(400).json(FAKE_RESPONSE);
    }
  } catch (err) {
    // On timeout / error → return fake response immediately
    return res.status(200).json(FAKE_RESPONSE);
  }
});

module.exports = serverless(app);
