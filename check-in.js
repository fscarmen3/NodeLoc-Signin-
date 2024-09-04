const fetch = require('node-fetch');

async function handleRequest() {
  // Load environment variables
  // 用户id
  let userId = process.env.USER_ID;

  // 用户令牌 到个人主页-安全-开发者令牌中申请
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
    console.log('Response headers:', JSON.stringify(response.headers.raw()));

    let responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.log('Failed to parse response as JSON');
      throw new Error('Invalid JSON response');
    }

    if (!responseData.data || !responseData.data.attributes) {
      console.log('Unexpected response structure:', JSON.stringify(responseData));
      throw new Error('Unexpected response structure');
    }

    let res = responseData.data.attributes;
    let { lastCheckinTime, checkin_last_time, lastCheckinMoney, checkin_days_count } = res;

    // 通知内容
    let content = `签到时间：${checkin_last_time}，签到能量：${lastCheckinMoney}。累计签到：${checkin_days_count}天`;

    // 发送到Telegram
    await sendTelegram(content, telegramBotToken, telegramChatId);

    // 记录日志
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
handleRequest().catch(error => {
  console.error('Unhandled error:', error);
});
