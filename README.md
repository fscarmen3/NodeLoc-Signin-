# NodeLoc 自动签到

这个 GitHub Action 可以自动执行 NodeLoc 的每日签到，并通过 Telegram 发送结果。

## 设置

1. Fork 这个仓库或创建一个新的仓库，包含提供的文件。
2. 进入你的仓库的 Settings > Secrets and Variables > Actions。
3. 添加以下 secrets：

   - `USER_ID`: 你的 NodeLoc 用户 ID
   - `TOKEN`: 你的 NodeLoc 开发者令牌 到个人主页-安全-开发者令牌中申请
   - `TELEGRAM_BOT_TOKEN`: 你的 Telegram 机器人令牌
   - `TELEGRAM_CHAT_ID`: 你的 Telegram 聊天 ID

## 必需的 Secrets

### USER_ID
这是你的 NodeLoc 用户 ID。你可以在 NodeLoc 账户设置或个人资料页面找到。

### TOKEN
这是你的 NodeLoc 开发者令牌。获取方法：
1. 进入你的 NodeLoc 个人主页
2. 导航到 安全 > 开发者令牌
3. 生成新令牌或复制现有令牌

### TELEGRAM_BOT_TOKEN
这是你的 Telegram 机器人的令牌。获取方法：
1. 在 Telegram 中与 BotFather 开始对话
2. 创建一个新机器人或选择现有机器人
3. 复制提供的令牌

### TELEGRAM_CHAT_ID
这是你想接收通知的聊天 ID。获取方法：
1. 与你的机器人开始对话
2. 向机器人发送一条消息
3. 访问 `https://api.telegram.org/bot<你的机器人令牌>/getUpdates`
4. 查找 "chat" 对象并复制 "id" 值

## 部署

设置好 secrets 后，GitHub Action 将每天 UTC 时间 1:00 自动运行。你也可以从 GitHub 仓库的 "Actions" 标签页手动触发。

## 自定义

你可以修改 `nodeloc-checkin.yml` 文件来更改计划或为 action 添加更多功能。

## 故障排除

如果遇到任何问题：
1. 检查所有 secrets 是否正确设置
2. 验证你的 NodeLoc 和 Telegram 凭据是否有效
3. 查看 Action 日志中的任何错误消息

如果问题持续存在，请在此仓库中开一个 issue。