const fetch = require('node-fetch');

async function handleRequest() {
  // User ID
  let userId = process.env.USER_ID;

  // User token 用户令牌 到个人主页-安全-开发者令牌中申请
  let token = process.env.TOKEN;

  // Telegram Bot Token
  let telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

  // Telegram Chat ID
  let telegramChatId = process.env.TELEGRAM_CHAT_ID;

  var data = JSON.stringify({
    "data": {
      "type": "users",
      "attributes": {
        "allowCheckin": false,
        "checkin_days_count": 3,
        "checkin_type": "R"
      },
      "id": `${userId}`
    }
  });

  var config = {
    method: 'post',
    url: 'https://www.nodeloc.com/api/users/' + userId,
    headers: {
      'Authorization': "Token " + token,
      'x-http-method-override': 'PATCH',
      'Content-Type': 'application/json'
    },
    body: data
  };

  try {
    let response = await fetch(config.url, config);
    let responseData = await response.json();
    let res = responseData.data.attributes;
    let { lastCheckinTime, checkin_last_time, lastCheckinMoney, checkin_days_count } = res;

    // Notification content
    let content = `Check-in time: ${checkin_last_time}, Check-in energy: ${lastCheckinMoney}. Total check-ins: ${checkin_days_count} days`;

    // Send to Telegram
    await sendTelegram(content, telegramBotToken, telegramChatId);

    // Log
    console.log(content);

  } catch (error) {
    console.log('Check-in failed: ' + error.message);
    await sendTelegram('Check-in failed: ' + error.message, telegramBotToken, telegramChatId);
  }
}

async function sendTelegram(content, botToken, chatId) {
  let telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  let telegramData = {
    chat_id: chatId,
    text: "NodeLoc Check-in Result: " + content
  };

  try {
    let response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramData)
    });

    if (!response.ok) {
      console.log('Failed to send Telegram notification');
    } else {
      console.log('Telegram notification sent successfully');
    }
  } catch (error) {
    console.log('Error sending Telegram notification:', error);
  }
}

handleRequest();