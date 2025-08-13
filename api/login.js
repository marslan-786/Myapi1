const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  try {
    const { num, otp } = req.query;

    if (!num) {
      return res.status(400).json({ error: "❌ num parameter required" });
    }

    // نمبر فارمیٹ
    const msisdnGenerate = num.startsWith("03") ? num : "03" + num.slice(-9);
    const msisdnVerify = num.startsWith("03") ? "92" + num.slice(1) : num;

    // Axios instance
    const instance = axios.create({
      withCredentials: true,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    let html;
    if (!otp) {
      // OTP Generate
      const r = await instance.post(
        "https://oopk.online/14august/otp.php",
        new URLSearchParams({ msisdn: msisdnGenerate }).toString()
      );
      html = r.data;
    } else {
      // OTP Verify
      const r = await instance.post(
        "https://oopk.online/14august/otp.php",
        new URLSearchParams({ action: "verify_otp", msisdn: msisdnVerify, otp }).toString()
      );
      html = r.data;
    }

    // HTML سے صرف .message نکالنا
    const $ = cheerio.load(html);
    const messageBox = $(".message").text().trim();

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ message: messageBox || "❌ کوئی message box نہیں ملا" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
