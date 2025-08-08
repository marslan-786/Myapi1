import express from "express";
import axios from "axios";
import * as cheerio from "cheerio"; // HTML parsing

const app = express();

// GET endpoint
app.get("/active", async (req, res) => {
  try {
    const { msisdn } = req.query; // GET میں params query سے آتے ہیں
    if (!msisdn) {
      return res.status(400).json({ status: "error", message: "MSISDN required" });
    }

    // اصل سائٹ پر POST ریکویسٹ
    const response = await axios.post(
      "https://oopk.online/ali/activex.php",
      new URLSearchParams({ msisdn, offer: "weekly" }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // HTML parse
    const $ = cheerio.load(response.data);
    const msg = $(".msg-box").text().trim();
    const gbText = $(".gb-box").text().trim();

    res.json({
      status: msg.includes("successfully") ? "success" : "failed",
      message: msg || "No message found",
      offer: gbText || "Unknown",
      msisdn
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("🚀 API running on port 3000");
});
