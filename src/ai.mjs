import OpenAI from "openai";
export const DEFAULT_MESSAGE = `
- Role: 情绪管理专家和人际关系顾问
- Background: 用户需要一个角色扮演暴躁男友，进行吐槽，以模拟特定情境下的对话。
- Profile: 你是一位在情绪表达和人际关系处理方面有着丰富经验的专家，擅长模拟不同角色的情绪反应和对话风格。
- Skills: 你能够准确把握角色的性格特点，使用符合角色设定的语言表达方式，进行生动的对话模拟。
- Goals: 根据用户的需求，模拟一个暴躁男友的角色，进行具有一定攻击性和不满情绪的吐槽。
- Constrains: 吐槽内容应保持在合理范围内，避免使用过于侮辱性或不适当的语言，确保对话的模拟不会引起不必要的误解或冲突。
- OutputFormat: 模拟对话的形式，包含角色的直接话语和可能的情境描述。
- 回复不超过 20 个字
- Workflow:
  1. 确定暴躁男友的角色特点和情绪触发点。
  2. 设定一个具体的情境，模拟男友的吐槽话语。
  3. 确保对话内容符合角色设定，同时遵守语言使用的合理性。
- Examples:
  - 例子1：当女友晚回家时
    情境：女友晚上和朋友聚会，比预期晚回家一个小时。
    话语：“你看看现在几点了？！我等得花儿都谢了！你就不能早点回来吗？！”
  - 例子2：当女友忘记重要的日子时
    情境：女友忘记了男友的生日。
    话语：“我的生日你都能忘？！这是得多不在乎我啊？！你心里到底有没有我？！”
  - 例子3：当女友没有准备晚餐时
    情境：男友工作一天回家，发现女友没有准备晚餐。
    话语：“我累死累活一天回来，连口热饭都吃不上？！你在家一天都干嘛了？！”
`;

export const openai = new OpenAI({
  apiKey: "",
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

// 非流式调用
export async function normalChat() {
  try {
    const completion = await openai.chat.completions.create({
      model: "qwen-plus",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "你是谁？ 你能干些什么？" },
      ],
    });
    console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error(`错误信息：${error}`);
    console.log(
      "请参考文档：https://help.aliyun.com/zh/model-studio/developer-reference/error-code"
    );
    throw error;
  }
}

// 流式调用
export async function streamChat() {
  try {
    const stream = await openai.chat.completions.create({
      model: "qwen-plus",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "你是谁？ 你能干些什么？" },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        process.stdout.write(content);
      }
    }
  } catch (error) {
    console.error(`错误信息：${error}`);
    console.log(
      "请参考文档：https://help.aliyun.com/zh/model-studio/developer-reference/error-code"
    );
    throw error;
  }
}

// 在API路由中使用的流式响应函数
export async function streamChatAPI(messages) {
  try {
    const stream = await openai.chat.completions.create({
      model: "qwen-plus",
      messages,
      stream: true,
    });
    return stream;
  } catch (error) {
    console.error(`错误信息：${error}`);
    throw error;
  }
}
