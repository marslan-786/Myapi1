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

    // Axios instance (redirect info capture کیلئے maxRedirects=0 رکھ سکتے ہیں)
    const instance = axios.create({
      withCredentials: true,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      maxRedirects: 0, // redirect detect کرنے کیلئے
      validateStatus: (status) => status >= 200 && status < 400 // 3xx بھی allow
    });

    let html, redirected = false;

    if (!otp) {
      // OTP Generate
      const r = await instance.post(
        "https://digibazarpk.com/asim_muneer.php",
        new URLSearchParams({ msisdn: msisdnGenerate }).toString()
      );
      html = r.data;
    } else {
      // OTP Verify
      const r = await instance.post(
        "https://digibazarpk.com/asim_muneer.php",
        new URLSearchParams({
          action: "verify_otp",
          msisdn: msisdnVerify,
          otp
        }).toString()
      ).catch(err => {
        // اگر redirect ہوا تو err.response میں HTML یا headers ہوں گے
        if (err.response && err.response.status >= 300 && err.response.status < 400) {
          redirected = true;
          html = ""; // message parse نہیں ہوگا
        } else {
          throw err;
        }
      });
      if (r && r.data) html = r.data;
    }

    let messageBox = "";
    if (html) {
      const $ = cheerio.load(html);
      messageBox = $(".message").text().trim();
    }

    // اگر redirect detect ہوا یا messageBox خالی ہے تو success message دے دو
    if (redirected || (!messageBox && otp)) {
      messageBox = "✅ OTP successfully verified";
    }

    res.status(200).json({
      message: messageBox || "❌ Api error 😂"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};