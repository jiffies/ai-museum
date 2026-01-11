"""
OpenAI Chat Completions API 示例

这个示例展示如何使用OpenAI的Chat API进行对话。
支持多轮对话、流式输出和自定义系统提示。

使用前请安装: pip install openai
"""

import os
from openai import OpenAI

# 初始化客户端
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

def chat_completion(messages: list[dict], model: str = "gpt-4") -> str:
    """
    发送聊天请求并返回响应

    Args:
        messages: 消息列表，每条消息包含role和content
        model: 使用的模型名称

    Returns:
        AI助手的回复文本
    """
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
    )

    return response.choices[0].message.content


def chat_stream(messages: list[dict], model: str = "gpt-4"):
    """
    流式聊天，实时输出响应

    Args:
        messages: 消息列表
        model: 使用的模型名称

    Yields:
        逐个token的响应文本
    """
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
        stream=True,
    )

    for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content


# 使用示例
if __name__ == "__main__":
    # 构建对话消息
    messages = [
        {
            "role": "system",
            "content": "你是一个友好的AI助手，擅长解释技术概念。"
        },
        {
            "role": "user",
            "content": "请用简单的话解释什么是机器学习？"
        }
    ]

    # 方式1: 一次性获取完整响应
    print("=== 完整响应 ===")
    response = chat_completion(messages)
    print(response)

    # 方式2: 流式输出
    print("\n=== 流式响应 ===")
    for token in chat_stream(messages):
        print(token, end="", flush=True)
    print()
