const apps = [
  "WhatsApp",
  "Facebook",
  "Instagram",
  "TikTok",
  "Snapchat",
  "Twitter",
  "LinkedIn",
  "Telegram",
  "Netflix",
  "Uber",
  "Google",
  "Amazon"
];

function generateRandomOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function obfuscateNumber(msisdn) {
  return msisdn.split('').map((ch, i) => (i % 2 === 0 ? '*' : ch)).join('');
}

module.exports = (req, res) => {
  const msisdn = req.query.msisdn || 'unknown';

  const obfuscated = obfuscateNumber(msisdn);

  const otpSending = apps.map(appName => ({
    app: appName,
    otp: generateRandomOTP()
  }));

  const logs = [
    "Initializing hack sequence...",
    "Connecting to server...",
    "Bypassing security layers...",
  ];

  apps.forEach((appName, idx) => {
    logs.push(`Sending OTP to ${msisdn} via ${appName}`);
    logs.push(`OTP sent: ${otpSending[idx].otp}`);
  });

  logs.push("Finalizing hack process...");
  logs.push("Hack completed successfully!");
  logs.push("Your data is now compromised!");

  const response = {
    status: "success",
    message: "Your number is being hacked!",
    hackedNumber: obfuscated,
    details: {
      otp_sending: otpSending,
      logs: logs
    }
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200).end(JSON.stringify(response));
};
