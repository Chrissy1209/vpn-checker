// vpnChecker/index.js
const http = require("http");
const axios = require("axios");
const cron = require("node-cron");
require("dotenv").config();

const LINE_NOTIFY_TOKEN = process.env.LINE_NOTIFY_TOKEN || "";
const notifyUrl = "https://notify-api.line.me/api/notify";

const sendNotification = async (message) => {
  try {
    const response = await axios.post(
      notifyUrl,
      `message=${encodeURIComponent(message)}`,
      {
        headers: {
          Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log("Notification sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending notification:", error.message);
  }
};

//---

const CHECK_URL = process.env.CHECK_URL || "";
let isConnect = true;
const checkVPN = async () => {
  const errorMessage = `Oops!\nVPN is disconnected...\n`;

  try {
    const response = await axios.get(CHECK_URL, { muteHttpExceptions: true });
    if (response.status === 200) {
      console.log("VPN is connected.");
      if (!isConnect) isConnect = true;
    }
  } catch (error) {
    console.log("VPN is disconnected or DNS error: " + error.message);
    if (isConnect) {
      isConnect = false;
      await sendNotification(errorMessage + error.message);
    }
  }
};

//---

cron.schedule(
  "*/1 * * * *",
  () => {
    console.log("vpn checking...");
    checkVPN().catch((err) =>
      console.error("Error in vpn checked:", err)
    );
  },
  {
    timezone: "Asia/Taipei",
  }
);

//---

const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello, this is a simple web service to keep Render happy!");
});

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
