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
    console.log('Sending request to NodeLoc...');
    let response = await fetch(config.url, config);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // 获取响应文本
    let responseText = await response.text();
    console.log('Raw response:', responseText);
    
    // 尝试解析 JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      console.log('Failed to parse JSON. Error:', jsonError.message);
      throw new Error('Invalid JSON response');
    }

    if (!responseData.data || !responseData.data.attributes) {
      console.log('Unexpected response structure:', JSON.stringify(responseData, null, 2));
      throw new Error('Unexpected response structure');
    }

    let res = responseData.data.attributes;
    let { lastCheckinTime, checkin_last_time, lastCheckinMoney, checkin_days_count } = res;

    // Notification content
    let content = `Check-in time: ${checkin_last_time}, Check-in energy: ${lastCheckinMoney}. Total check-ins: ${checkin_days_count} days`;

    // Send to Telegram
    await sendTelegram(content, telegramBotToken, telegramChatId);

    // Log
    console.log('Check-in successful:', content);

  } catch (error) {
    console.error('Check-in failed:', error);
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
    console.log('Sending Telegram notification...');
    let response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramData)
    });

    if (!response.ok) {
      console.log('Failed to send Telegram notification. Status:', response.status);
      let responseText = await response.text();
      console.log('Telegram API response:', responseText);
    } else {
      console.log('Telegram notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

handleRequest().catch(error => {
  console.error('Unhandled error in handleRequest:', error);
});
