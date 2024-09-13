# -*- coding: utf-8 -*-
"""
cron: 10 19 * * *
new Env('V2EX');
"""

import os
import re
import requests
import urllib3
import telebot

urllib3.disable_warnings()

class V2ex:
    def __init__(self):
        self.url = "https://www.v2ex.com/mission/daily"
        self.username = os.environ.get('V2EX_USERNAME')
        self.password = os.environ.get('V2EX_PASSWORD')
        self.telegram_bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        self.telegram_chat_id = os.environ.get('TELEGRAM_CHAT_ID')

    def login(self):
        session = requests.Session()
        login_url = "https://www.v2ex.com/signin"
        
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        response = session.get(login_url)
        
        if response.status_code != 200:
            raise Exception(f"登录页面请求失败，状态码：{response.status_code}")

        # 提取 once token
        once_match = re.search(r'value="(\d+)" name="once"', response.text)
        if not once_match:
            print("登录页面内容：", response.text)  # 打印页面内容以进行调试
            raise Exception("无法找到 once token")
        once_token = once_match.group(1)

        # 提取用户名字段
        username_match = re.search(r'class="sl" name="(.*?)" value=""', response.text)
        if not username_match:
            print("登录页面内容：", response.text)  # 打印页面内容以进行调试
            raise Exception("无法找到用户名字段")
        username_field = username_match.group(1)

        login_data = {
            username_field: self.username,
            'password': self.password,
            'once': once_token,
            'next': '/'
        }
        
        login_response = session.post(login_url, data=login_data)
        
        if login_response.status_code != 200:
            raise Exception(f"登录请求失败，状态码：{login_response.status_code}")

        # 检查是否登录成功
        if "签到" not in login_response.text:
            raise Exception("登录可能失败，请检查用户名和密码")

        return session

    def sign(self, session):
        msg = ""

        response = session.get(self.url, verify=False)
        pattern = (
            r"<input type=\"button\" class=\"super normal button\""
            r" value=\".*?\" onclick=\"location\.href = \'(.*?)\';\" />"
        )
        urls = re.findall(pattern, response.text)
        url = urls[0] if urls else None
        if url is None:
            return "无法找到签到按钮，可能已经签到"
        if url != "/balance":
            data = {"once": url.split("=")[-1]}
            session.get(
                f'https://www.v2ex.com{url.split("?")[0]}', verify=False, params=data
            )

        response = session.get("https://www.v2ex.com/balance", verify=False)
        totals = re.findall(
            r"<td class=\"d\" style=\"text-align: right;\">(\d+\.\d+)</td>",
            response.text,
        )
        total = totals[0] if totals else "签到失败"
        today = re.findall(
            r'<td class="d"><span class="gray">(.*?)</span></td>', response.text
        )
        today = today[0] if today else "签到失败"

        usernames = re.findall(
            r"<a href=\"/member/.*?\" class=\"top\">(.*?)</a>", response.text
        )
        username = usernames[0] if usernames else "用户名获取失败"

        msg += f"帐号信息: {username}\n今日签到: {today}\n帐号余额: {total}"

        response = session.get(url=self.url, verify=False)
        datas = re.findall(r"<div class=\"cell\">(.*?)天</div>", response.text)
        data = f"{datas[0]} 天" if datas else "获取连续签到天数失败"
        msg += f"\n签到天数: {data}"

        msg = msg.strip()
        return msg

    def send_telegram(self, message):
        bot = telebot.TeleBot(self.telegram_bot_token)
        bot.send_message(self.telegram_chat_id, message)

    def main(self):
        try:
            session = self.login()
            result = self.sign(session)
        except Exception as e:
            result = f"登录或签到过程中出错：{str(e)}"
        
        self.send_telegram(result)

if __name__ == "__main__":
    V2ex().main()
