const express = require("express");
const app = express();

const SECRET_CHROME = "5246.28";

const FAKE_RESPONSE = {
  status: true,
  success: false,
  message: "Your request was successful, but this is a fake response."
};

// GET API
// Example: /api?num=0300&id=tui688
app.get("/api", (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const phoneNum = req.query.num || "0000";
  const deviceId = req.query.id || "xxxx";

  // Browser + secret code check
  if (userAgent.includes("Chrome") && userAgent.includes(SECRET_CHROME)) {
    // Real response
    return res.json({
      status: true,
      success: true,
      message: `Real response for phone ${phoneNum} and device ${deviceId}`
    });
  } else {
    // Fake response
    return res.json(FAKE_RESPONSE);
  }
});

// Vercel dynamic port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
