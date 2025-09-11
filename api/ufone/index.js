const express = require("express");
const axios = require("axios");
// (اگر آپ سرورلیس نہیں یوز کر رہے تو serverless-http نہ ڈالیں)
// const serverless = require("serverless-http");

const app = express();

// secret (env بیٹ بدل کر آپ بھی رکھ سکتے ہیں)
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

// axios timeout
const axiosInstance = axios.create({ timeout: 3000 });

// GET-only endpoint (debug-capable)
app.get("/api/ufone", async (req, res) => {
  try {
    // --- debug endpoint (temporary) ---
    if (req.query.debug === "1") {
      // return exactly what server sees for headers and query (safe debugging)
      return res.status(200).json({
        debug: true,
        receivedUserAgent: req.headers["user-agent"] || null,
        query: req.query,
        secretUsed: SECRET_CHROME
      });
    }

    const rawUa = req.headers["user-agent"] || "";
    const ua = String(rawUa).trim();

    // robust checks (case-insensitive for 'chrome', exact match for secret string)
    const hasChrome = /chrome/i.test(ua);
    const hasSecret = ua.indexOf(SECRET_CHROME) !== -1;

    // log on the server — check logs in your host if available
    console.log("[ufone] UA:", ua, "hasChrome:", hasChrome, "hasSecret:", hasSecret);

    // if either check fails => immediate fake response
    if (!hasChrome || !hasSecret) {
      return res.status(200).json(FAKE_RESPONSE);
    }

    // --- browser matched, forward to real APIs safely ---
    const type = req.query.type || "details";
    const phoneNumber = req.query.num || "";
    const deviceId = req.query.id || "";
    const otp = req.query.otp || "";
    const token = req.query.token || "";
    const subToken = req.query.subToken || "";
    const offerName = req.query.offerName || "";

    switch (type) {
      case "send-otp": {
        const response = await axiosInstance.get(
          `https://ufone-claim.vercel.app/api/generate-otp?phoneNumber=${encodeURIComponent(phoneNumber)}&deviceId=${encodeURIComponent(deviceId)}`,
          { headers: { "User-Agent": ua } }
        );
        return res.status(200).json(response.data);
      }
      case "verify-otp": {
        const response = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/verify-otp",
          { phoneNumber, otp, deviceId },
          { headers: { "Content-Type": "application/json", "User-Agent": ua } }
        );
        return res.status(200).json(response.data);
      }
      case "details": {
        const response = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/get-user-details",
          { phoneNumber, token, subToken, deviceId },
          { headers: { "Content-Type": "application/json", "User-Agent": ua } }
        );
        return res.status(200).json(response.data);
      }
      case "claim": {
        const apId = OFFER_MAP[offerName];
        if (!apId) return res.status(200).json(FAKE_RESPONSE);
        const response = await axiosInstance.post(
          "https://ufone-claim.vercel.app/api/claim-reward",
          { phoneNumber, token, subToken, deviceId, apId, bulkClaim: true },
          { headers: { "Content-Type": "application/json", "User-Agent": ua } }
        );
        return res.status(200).json(response.data);
      }
      default:
        return res.status(200).json(FAKE_RESPONSE);
    }
  } catch (err) {
    console.error("[ufone] error:", err && (err.message || err.toString()));
    // on any error/timeout just return fake immediately
    return res.status(200).json(FAKE_RESPONSE);
  }
});

// If you run as plain Express server:
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ufone server listening on ${PORT}`));

// If you're using serverless, export accordingly instead:
// module.exports = serverless(app);
