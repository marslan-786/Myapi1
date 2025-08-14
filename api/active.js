const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    const { number } = req.query;
    if (!number) {
      return res.status(400).json({ error: "Missing 'number' query parameter" });
    }

    const url = "https://oopk.online/e14august/";

    // 1️⃣ Step 1: GET request to get cookies
    const getResp = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
        Referer: url,
      },
    });


    const rawCookies = getResp.headers.raw()["set-cookie"] || [];
    const cookies = rawCookies.map(c => c.split(";")[0]).join("; ");

    // 2️⃣ Step 2: POST request with cookies
    const postResp = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
        Referer: url,
        "X-Requested-With": "XMLHttpRequest",
        Origin: "https://oopk.online",
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
      },
      body: new URLSearchParams({
        msisdn: number,
        offer: "weekly"
      }),
    });

    const html = await postResp.text();

    // 3️⃣ Extract msg-box or error-box
    let message = null;
    const msgMatch = html.match(/<div class="msg-box">([\s\S]*?)<\/div>/);
    const errorMatch = html.match(/<div class="error-box">([\s\S]*?)<\/div>/);

    if (msgMatch) {
      message = msgMatch[1].replace(/<[^>]+>/g, "").trim();
    } else if (errorMatch) {
      message = errorMatch[1].replace(/<[^>]+>/g, "").trim();
    } else {
      message = "No message found";
    }

    res.status(200).json({ status: message });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
