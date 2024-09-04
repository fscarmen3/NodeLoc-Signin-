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

    if (!response.ok) {
      let responseText = await response.text();
      console.error('Error response:', responseText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      let responseText = await response.text();
      throw new Error(`Unexpected content type: ${contentType}. Response: ${responseText}`);
    }

    let responseData = await response.json();
    let res = responseData.data.attributes;
    let { lastCheckinTime, checkin_last_time, lastCheckinMoney, checkin_days_count } = res;

    let content = `签到时间：${checkin_last_time}，签到能量：${lastCheckinMoney}。累计签到：${checkin_days_count}天`;

    await sendTelegram(content, telegramBotToken, telegramChatId);

    console.log(content);

  } catch (error) {
    console.log('签到失败: ' + error.message);
    await sendTelegram('签到失败: ' + error.message, telegramBotToken, telegramChatId);
  }
}
