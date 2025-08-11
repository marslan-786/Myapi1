const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function handler(req, res) {
  const number = req.query.number;

  if (!number) {
    return res.status(400).json({ error: "Please provide a 'number' query parameter" });
  }

  try {
    const url = `https://simownerdetails.org.pk/wp-admin/admin-ajax.php?action=get_number_data&get_number_data=searchdata=${number}`;
    const response = await axios.get(url);
    const responseData = response.data;

    // responseData کے اندر 'data' فیلڈ ہے جو HTML markup ہے، اسے parse کریں
    if (!responseData.success) {
      return res.status(404).json({ error: "No data found from the source." });
    }

    const html = responseData.data; // یہاں وہ HTML ہے

    const $ = cheerio.load(html);

    let results = [];

    $('.result-card').each((_, el) => {
      let name = $(el).find('.field label:contains("FULL NAME")').next().text().trim();
      let phone = $(el).find('.field label:contains("PHONE #")').next().text().trim();
      let cnic = $(el).find('.field label:contains("CNIC #")').next().text().trim();
      let address = $(el).find('.field label:contains("ADDRESS")').next().text().trim();

      results.push({
        Name: name || "Unknown",
        Mobile: phone ? "+92" + phone.replace(/^0/, '') : "",
        Country: "Pakistan",
        CNIC: cnic || "",
        Address: address || ""
      });
    });

    if (results.length === 0) {
      return res.status(200).json({
        error: "No records found in the HTML data.",
      });
    }

    res.status(200).json(results);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
