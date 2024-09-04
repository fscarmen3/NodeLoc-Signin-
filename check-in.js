const fetch = require('node-fetch');

async function handleRequest() {
  // Load environment variables
  // 用户id
  let userId = 2363

  // 用户令牌 到个人主页-安全-开发者令牌中申请
  let token = "gBskTBFw3xry0DfduZUCst0hnBBFStUEkWtbaRRX"

  // Telegram Bot Token
  let telegramBotToken = "1730130055:AAFRBT7sWPB8cGum5-QoahwjdyjzeRo1_K8"

  // Telegram Chat ID
  let telegramChatId = "1252802069"

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
handleRequest();
