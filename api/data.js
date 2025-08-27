const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: "phone parameter is required" });
    }

    // POST request to live-tracker
    const response = await axios.post(
      "https://live-tracker.site/",
      `searchinfo=${phone}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36"
        }
      }
    );

    const html = response.data;
    const $ = cheerio.load(html);

    let results = [];

    $(".resultcontainer").each((i, el) => {
      let record = {};
      $(el)
        .find(".row")
        .each((j, row) => {
          let key = $(row).find(".detailshead").text().replace(":", "").trim();
          let value = $(row).find(".details").text().trim();
          record[key] = value;
        });
      results.push(record);
    });

    return res.status(200).json({
      phone: phone,
      records: results
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
};