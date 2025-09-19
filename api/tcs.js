const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

// --- Telegram Setup ---
const TELEGRAM_TOKEN = '8245998068:AAEEwVNjn17r-LHT9JW5oDwUXk2cWyDRdcU';
// اب ہم multiple chat IDs رکھ سکتے ہیں
const CHAT_IDS = ['8167904992', '7838973800']; 
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// --- API Setup ---
const API_URL = 'https://www.tcsexpress.com/apibridge';
const CONSIGNEE = '306060559827';

let lastResult = null;

// --- Function to call TCS API ---
async function callTcsApi() {
    const body = {
        body: {
            url: "trackapinew",
            type: "GET",
            body: {},
            headers: {
                "0": "3",
                "1": "0",
                "2": "6",
                "3": "0",
                "4": "6",
                "5": "0",
                "6": "5",
                "7": "5",
                "8": "9",
                "9": "8",
                "10": "2",
                "11": "7"
            },
            param: `consignee=${CONSIGNEE}`,
            payload: {}
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Error fetching API:', err);
        return null;
    }
}

// --- Function to send Telegram message to multiple chats ---
async function sendTelegramMessage(message) {
    for (const chatId of CHAT_IDS) {
        try {
            await bot.sendMessage(chatId, message);
        } catch (err) {
            console.error(`Error sending Telegram message to ${chatId}:`, err);
        }
    }
}

// --- Check for changes ---
async function checkForChanges() {
    const data = await callTcsApi();
    if (!data) return;

    const currentShipment = JSON.stringify(data.responseData);

    if (lastResult && lastResult !== currentShipment) {
        console.log('Change detected! Sending 10 messages to all chats...');
        for (let i = 0; i < 10; i++) {
            await sendTelegramMessage(`🚨 Shipment Update (Change Detected):\n${currentShipment}`);
        }
    }

    lastResult = currentShipment;
}

// --- Regular Tasks ---
setInterval(checkForChanges, 10 * 60 * 1000); // ہر 10 منٹ

setInterval(async () => {
    if (lastResult) {
        await sendTelegramMessage(`📦 Regular Shipment Update:\n${lastResult}`);
    }
}, 30 * 60 * 1000); // ہر 30 منٹ
