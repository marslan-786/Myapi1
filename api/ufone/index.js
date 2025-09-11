// ufone/index.js
const express = require("express");
const axios = require("axios");
const app = express();

const SECRET_CHROME = "5246.28";
const FAKE_RESPONSE = { status: true, success: false, message: "Fake response" };
const OFFER_MAP = {
  "50MB & 50min": "46417676",
  "Upaisa Offer": "46383061",
  "100MB": "46417677",
  "50MB": "46417678"
};
const axiosInstance = axios.create({ timeout: 5000 });

function isValidUA(ua) {
  return ua.includes("Chrome") && ua.includes(SECRET_CHROME);
}

app.get("/", async (req, res) => {
  const ua = req.headers["user-agent"] || "";
  if (!isValidUA(ua)) return res.json(FAKE_RESPONSE);

  const type = req.query.type || "";
  const phoneNum = req.query.num || "";
  const deviceId = req.query.id || "";
  const otp = req.query.otp || "";
  const token = req.query.token || "";
  const subToken = req.query.subToken || "";
  const offerName = req.query.offerName || "";

  try {
    switch (type) {
      case "send-otp": {
        const r = await axiosInstance.get(
          `https://ufone-claim.vercel.app/api/generate-otp?phoneNumber=${encodeURIComponent(phoneNum)}&deviceId=${encodeURIComponent(deviceId)}`,
          { headers: { "User-Agent": ua } }
        );
        return res.json(r.data);
      }
      case "verify-otp": {
        const r = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/verify-otp",
          { phoneNumber: phoneNum, otp, deviceId },
          { headers: { "Content-Type": "application/json", "User-Agent": ua } }
        );
        return res.json(r.data);
      }
      case "details": {
        const r = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/get-user-details",
          { phoneNumber: phoneNum, token, subToken, deviceId },
          { headers: { "Content-Type": "application/json", "User-Agent": ua } }
        );
        return res.json(r.data);
      }
      case "claim": {
        const apId = OFFER_MAP[offerName];
        if (!apId) return res.json(FAKE_RESPONSE);

        const r = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/claim-reward",
          { phoneNumber: phoneNum, token, subToken, deviceId, apId, bulkClaim: true },
          { headers: { "Content-Type": "application/json", "User-Agent": ua } }
        );
        return res.json(r.data);
      }
      default:
        return res.json(FAKE_RESPONSE);
    }
  } catch (err) {
    return res.json(FAKE_RESPONSE);
  }
});

module.exports = app;
