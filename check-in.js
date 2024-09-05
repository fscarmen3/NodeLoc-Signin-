import fetch from 'node-fetch';

async function handleRequest() {
  // 从环境变量加载配置
  const userId = process.env.USER_ID;
  const token = process.env.TOKEN;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  const data = JSON.stringify({
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

  const config = {
    method: 'post',
    headers: {
      'Authorization': `Token ${token}`,
      'x-http-method-override': 'PATCH',
      'Content-Type': 'application/json'
    },
    body: data
  };

  try {
    const response = await fetch(`https://www.nodeloc.com/api/users/${userId}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Response is not valid JSON:', responseText);
      throw new Error('Invalid JSON response');
    }

    const res = responseData.data.attributes;
    const { lastCheckinTime, checkin_last_time, lastCheckinMoney, checkin_days_count } = res;
    
    // 通知内容
    const content = `签到时间：${checkin_last_time}，签到能量：${lastCheckinMoney}。累计签到：${checkin_days_count}天`;
    
    // 发送到Telegram
    await sendTelegram(content, telegramBotToken, telegramChatId);
    
    // 记录日志
    console.log(content);
  } catch (error) {
    console.error('签到失败:', error.message);
    await sendTelegram('签到失败: ' + error.message, telegramBotToken, telegramChatId);
  }
}

async function sendTelegram(content, botToken, chatId) {
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const telegramData = {
    chat_id: chatId,
    text: "NodeLoc签到结果: " + content
  };

  try {
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramData)
    });

    if (!response.ok) {
      console.error('Telegram通知发送失败');
    } else {
      console.log('Telegram通知发送成功');
    }
  } catch (error) {
    console.error('Telegram通知发送错误:', error);
  }
}

// 运行脚本
handleRequest();