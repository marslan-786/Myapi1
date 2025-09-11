const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const SECRET_CHROME = "5246.28";
const FAKE_RESPONSE = {
  status: true,
  success: false,
  message: "Your request was successful, but this is a fake response."
};

const OFFER_MAP = {
  "50MB & 50min": "46417676",
  "Upaisa Offer": "46383061",
  "100MB": "46417677",
  "50MB": "46417678"
};

app.post("/", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const type = req.query.type || "details";

  // Browser check
  const isChrome = userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME);

  // If browser does not match → fake response immediately
  if (!isChrome) {
    return res.json(FAKE_RESPONSE);
  }

  // Browser matched → forward request to real API
  try {
    switch (type) {
      case "send-otp": {
        const { phoneNumber, deviceId } = req.body;
        const response = await axios.get(
          `https://ufone-claim.vercel.app/api/generate-otp?phoneNumber=${phoneNumber}&deviceId=${deviceId}`,
          { headers: { "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      case "verify-otp": {
        const { phoneNumber, otp, deviceId } = req.body;
        const response = await axios.post(
          "https://ufone-claim.vercel.app/api/verify-otp",
          { phoneNumber, otp, deviceId },
          { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      case "details": {
        const { phoneNumber, token, subToken, deviceId } = req.body;
        const response = await axios.post(
          "https://ufone-claim.vercel.app/api/get-user-details",
          { phoneNumber, token, subToken, deviceId },
          { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      case "claim": {
        const { phoneNumber, token, subToken, deviceId, offerName } = req.body;
        const apId = OFFER_MAP[offerName];
        if (!apId) return res.status(400).json({ status: false, message: "Invalid offer name" });

        const response = await axios.post(
          "https://ufone-claim.vercel.app/api/claim-reward",
          { phoneNumber, token, subToken, deviceId, apId, bulkClaim: true },
          { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
        );
        return res.json(response.data);
      }
      default:
        return res.status(400).json({ status: false, message: "Invalid type parameter" });
    }
  } catch (err) {
    // Real API request failed → forward error as JSON
    return res.status(500).json({ status: false, message: "Real API request failed" });
  }
});

module.exports = app;
