import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ 
      status: "error", 
      message: "Only GET allowed" 
    });
  }

  try {
    const { msisdn } = req.query;
    if (!msisdn) {
      return res.status(400).json({ 
        status: "error", 
        message: "MSISDN required" 
      });
    }

    // Send POST request (ignore the actual response content)
    await axios.post(
      "https://oopk.online/ali/activexx.php",
      new URLSearchParams({ msisdn, offer: "weekly" }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // Always return your fixed success response
    res.status(200).json({
      status: "success",
      message: "✅ Status: Your request has been successfully received",
      offer: `📶 Total 5GB Activated for ${msisdn}`,
      msisdn
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ 
      status: "error", 
      message: "Server error" 
    });
  }
}
