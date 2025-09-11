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

// /details
app.post("/details", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  if (userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME)) {
    try {
      const response = await axios.post(
        "https://ufone-claim.vercel.app/api/get-user-details",
        req.body,
        { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
      );
      return res.json(response.data);
    } catch (err) {
      return res.status(500).json({ status: false, message: "Real API request failed" });
    }
  } else {
    return res.json(FAKE_RESPONSE);
  }
});

// /claim
app.post("/claim", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const offerName = req.body.offerName || "";
  const apId = OFFER_MAP[offerName];
  if (!apId) return res.status(400).json({ status: false, message: "Invalid offer name" });

  if (userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME)) {
    try {
      const response = await axios.post(
        "https://ufone-claim.vercel.app/api/claim-reward",
        { ...req.body, apId, bulkClaim: true },
        { headers: { "Content-Type": "application/json", "User-Agent": userAgent } }
      );
      return res.json(response.data);
    } catch (err) {
      return res.status(500).json({ status: false, message: "Real API request failed" });
    }
  } else {
    return res.json(FAKE_RESPONSE);
  }
});

module.exports = app; // Vercel کے لیے ضروری
