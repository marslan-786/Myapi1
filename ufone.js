const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const SECRET_CHROME = "5246.28";

// Fake response template
const FAKE_RESPONSE = {
  status: true,
  success: false,
  message: "Your request was successful, but this is a fake response."
};

// Reward mapping
const OFFER_MAP = {
  "50MB & 50min": "46417676",
  "Upaisa Offer": "46383061",
  "100MB": "46417677",
  "50MB": "46417678"
};

// --- /api/details ---
app.post("/api/details", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const phoneNumber = req.body.phoneNumber || "0000";
  const token = req.body.token || "";
  const subToken = req.body.subToken || "";
  const deviceId = req.body.deviceId || "xxxx";

  if (userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME)) {
    try {
      // Forward to real API
      const response = await axios.post(
        "https://ufone-claim.vercel.app/api/get-user-details",
        { phoneNumber, token, subToken, deviceId },
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

// --- /api/claim ---
app.post("/api/claim", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const phoneNumber = req.body.phoneNumber || "0000";
  const token = req.body.token || "";
  const subToken = req.body.subToken || "";
  const deviceId = req.body.deviceId || "xxxx";
  const offerName = req.body.offerName || "";

  const apId = OFFER_MAP[offerName];

  if (!apId) {
    return res.status(400).json({ status: false, message: "Invalid offer name" });
  }

  if (userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME)) {
    try {
      // Forward to real claim API
      const response = await axios.post(
        "https://ufone-claim.vercel.app/api/claim-reward",
        {
          phoneNumber,
          token,
          subToken,
          deviceId,
          apId,
          incentiveValue: "50", // optional, can map from offerName if needed
          value: "50",          // optional
          bulkClaim: true       // optional
        },
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

// Vercel dynamic port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
