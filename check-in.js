const fetch = require('node-fetch');

async function handleRequest() {
  // Load environment variables
  let userId = process.env.USER_ID;
  let token = process.env.TOKEN;
  let telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
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
    url: `https://www.nodeloc.com/api/users/${userId}`,
    headers: {
      'Authorization': `Token ${token}`,
      'x-http-method-override': 'PATCH',
      'Content-Type': 'application/json'
    },
    body: data
  };

  try {
    let response = await fetch(config.url, config);

    // Check if the response is okay
    if (!response.ok) {
      let responseText = await response.text();  // Get response as text
      console.error('Error response:', responseText);  // Log error response
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse JSON response
    let responseData = await response.json();
    let res = responseData.data.attributes;
    let { lastCheckinTime, checkin_last_time, lastCheckinMoney, checkin_days_count } = res;

    // Notification content
    let content = `签到时间：${checkin_last_time}，签到能量：${lastCheckinMoney}。累计签到：${checkin_days_count}天`;

    // Send to Telegram
    await sendTelegram(content, telegramBotToken, telegramChatId);

    // Log
    console.log(content);

  } catch (error) {
    console.log('签到失败: ' + error.message);
    await sendTelegram('签到失败: ' + error.message, telegramBotToken, telegramChatId);
  }
}

async function sendTelegram(content, botToken, chatId) {
  let telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  let telegramData = {
    chat_id: chatId,
    text: "NodeLoc签到结果: " + content
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
      console.log('Telegram通知发送失败');
    } else {
      console.log('Telegram通知发送成功');
    }
  } catch (error) {
    console.log('Telegram通知发送错误:', error);
  }
}

// Run the script
handleRequest();
