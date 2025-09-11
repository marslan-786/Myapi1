const express = require("express");
const app = express();

const SECRET_CHROME = "5246.28";

// Fake response template
const FAKE_RESPONSE = {
  status: 200,
  success: true,
  message: "Your request was successful,"
};

// GET endpoint
// Example: /api/send-otp?num=03306864178&id=1234rf
app.get("/api/send-otp", (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const phoneNum = req.query.num || "0000";
  const deviceId = req.query.id || "xxxx";

  // Browser match check (Chrome + secret version)
  if (userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME)) {
    // Real response
    return res.json({
      status: true,
      success: true,
      message: `Real OTP generated for phone ${phoneNum} and device ${deviceId}`
    });
  } else {
    // Fake response for direct access or wrong browser
    return res.json(FAKE_RESPONSE);
  }
});

// Vercel dynamic port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
