import axios from "axios";
import * as cheerio from "cheerio"; // HTML parsing

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ status: "error", message: "Only GET allowed" });
  }

  try {
    const { msisdn } = req.query;
    if (!msisdn) {
      return res.status(400).json({ status: "error", message: "MSISDN required" });
    }

    // اصل سائٹ پر POST ریکویسٹ
    const response = await axios.post(
      "https://oopk.online/ali/activexx.php",
      new URLSearchParams({ msisdn, offer: "weekly" }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // HTML parse
    const $ = cheerio.load(response.data);
    const msg = $(".msg-box").text().trim();
    const gbText = $(".gb-box").text().trim();

    res.status(200).json({
      status: msg.includes("successfully") ? "success" : "failed",
      message: msg || "No message found",
      offer: gbText || "Unknown",
      msisdn
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
}
