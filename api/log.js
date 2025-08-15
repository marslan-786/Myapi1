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

    // Axios instance (cookies handle کرنے کیلئے withCredentials: true)
    const instance = axios.create({
      withCredentials: true,
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });

    let html = "", redirected = false;

    // 1️⃣ پہلے GET سے cookies لینا
    await instance.get("https://digibazarpk.com/asim_muneer/");

    // 2️⃣ پھر POST کرنا (OTP generate یا verify)
    if (!otp) {
      // OTP Generate
      const r = await instance.post(
        "https://digibazarpk.com/asim_muneer/",
        new URLSearchParams({ msisdn: msisdnGenerate }).toString(),
        {
          headers: {
            "Origin": "https://digibazarpk.com",
            "Referer": "https://digibazarpk.com/asim_muneer/"
          }
        }
      );
      html = r.data;
    } else {
      // OTP Verify
      try {
        const r = await instance.post(
          "https://digibazarpk.com/asim_muneer/",
          new URLSearchParams({
            action: "verify_otp",
            msisdn: msisdnVerify,
            otp
          }).toString(),
          {
            headers: {
              "Origin": "https://digibazarpk.com",
              "Referer": "https://digibazarpk.com/asim_muneer/"
            }
          }
        );
        html = r.data;
      } catch (err) {
        if (err.response && err.response.status >= 300 && err.response.status < 400) {
          redirected = true;
          html = "";
        } else {
          throw err;
        }
      }
    }

    // HTML سے message نکالنا
    let messageBox = "";
    if (html) {
      const $ = cheerio.load(html);
      messageBox = $(".message").text().trim();
    }

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