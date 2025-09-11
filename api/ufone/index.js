const express = require("express");
const axios = require("axios");

const app = express();

// --- CONFIG ---
const SECRET_CHROME = (process.env.SECRET_CHROME || "5246.28").trim();

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

// axios with timeout
const axiosInstance = axios.create({ timeout: 5000 });

// --- MAIN ROUTE ---
// Example: /api/ufone?type=send-otp&num=03350044704&id=abcd1234
app.get("/", async (req, res) => {
  try {
    // --- Debug Mode ---
    if (req.query.debug === "1") {
      return res.status(200).json({
        debug: true,
        receivedUA: req.headers["user-agent"] || null,
        query: req.query,
        secretExpected: SECRET_CHROME
      });
    }

    const ua = (req.headers["user-agent"] || "").trim();

    // Secret UA check
    const isChrome = /chrome/i.test(ua);
    const hasSecret = ua.includes(SECRET_CHROME);

    if (!isChrome || !hasSecret) {
      return res.status(200).json(FAKE_RESPONSE);
    }

    // Collect query params
    const type = req.query.type || "details";
    const phoneNumber = req.query.num || "";
    const deviceId = req.query.id || "";
    const otp = req.query.otp || "";
    const token = req.query.token || "";
    const subToken = req.query.subToken || "";
    const offerName = req.query.offerName || "";

    let response;

    switch (type) {
      case "send-otp":
        response = await axiosInstance.get(
          `https://ufone-claim.vercel.app/api/generate-otp?phoneNumber=${encodeURIComponent(
            phoneNumber
          )}&deviceId=${encodeURIComponent(deviceId)}`,
          { headers: { "User-Agent": ua } }
        );
        return res.status(200).json(response.data);

      case "verify-otp":
        response = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/verify-otp",
          { phoneNumber, otp, deviceId },
          {
            headers: {
              "Content-Type": "application/json",
              "User-Agent": ua,
            },
          }
        );
        return res.status(200).json(response.data);

      case "details":
        response = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/get-user-details",
          { phoneNumber, token, subToken, deviceId },
          {
            headers: {
              "Content-Type": "application/json",
              "User-Agent": ua,
            },
          }
        );
        return res.status(200).json(response.data);

      case "claim":
        const apId = OFFER_MAP[offerName];
        if (!apId) return res.status(200).json(FAKE_RESPONSE);

        response = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/claim-reward",
          { phoneNumber, token, subToken, deviceId, apId, bulkClaim: true },
          {
            headers: {
              "Content-Type": "application/json",
              "User-Agent": ua,
            },
          }
        );
        return res.status(200).json(response.data);

      default:
        return res.status(200).json(FAKE_RESPONSE);
    }
  } catch (err) {
    console.error("[ufone] error:", err.message || err);
    return res.status(200).json(FAKE_RESPONSE);
  }
});

// --- RUN LOCALLY ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Ufone API server running at http://localhost:${PORT}/api/ufone`)
);

module.exports = app;
