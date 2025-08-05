import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({ error: "Please provide a number like ?number=03012345678" });
  }

  try {
    // اصل سائٹ پر POST ریکویسٹ
    const response = await fetch("https://live-tracker.site/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ searchinfo: number }).toString()
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];

    // ہر resultcontainer سے ڈیٹا نکالیں
    $(".resultcontainer").each((_, container) => {
      const record = {};
      $(container).find(".row").each((_, row) => {
        const head = $(row).find(".detailshead").text().trim().replace(":", "");
        const detail = $(row).find(".details").text().trim();
        record[head] = detail;
      });
      results.push(record);
    });

    return res.status(200).json(results);

  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch data", details: error.message });
  }
}
