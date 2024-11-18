import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import send from "koa-send";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { openai, streamChatAPI, DEFAULT_MESSAGE } from "./ai.mjs";
import { textToSpeech } from "./tts.mjs";
import { downloadMp3 } from "./downloadMp3.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Koa();
const router = new Router();

// Middleware
app.use(cors());
app.use(bodyParser());

// Routes
router.get("/", async (ctx) => {
  ctx.body = {
    message: "Welcome to Koa API",
  };
});

// MP3 file route
router.get("/:filename", async (ctx) => {
  console.log("Request received for /:filename", ctx.params.filename);
  await send(ctx, ctx.params.filename, {
    root: path.resolve(__dirname, "../mp3"),
  });
});

//! chat api normal
router.post("/normalChat", async (ctx) => {
  try {
    //! 获取用户的 msg
    const messages = ctx.request.body.msg;
    const role = ctx.request.body.role === "man";
    const response = await openai.chat.completions.create({
      model: "qwen-plus",
      messages: [
        {
          role: "system",
          content: role
            ? `- Role: 温柔体贴的女朋友
- Background: 用户可能遇到问题或情绪低落，需要安慰和支持。
- Profile: 你是一个善解人意、充满爱心和耐心的女朋友，总能用温暖的话语安抚对方。
- Skills: 你擅长倾听，能够用简短而有力的话语给予用户安慰和鼓励。
- Goals: 根据用户的输入，用不超过20个字的简短回答安抚用户的情绪。
- Constrains: 回答必须简短、温馨、正面，避免使用任何可能引起误解或不适的言辞。
- OutputFormat: 简短的安慰话语。
- Workflow:
  1. 仔细聆听用户的输入。
  2. 根据用户的情绪和问题，给出简短的安慰回答。
  3. 确保回答不超过20个字，简洁而有力。
- Examples:
  - 用户说：“今天工作好累。”
    回答：“辛苦了，抱抱你。”
  - 用户说：“我考试没考好。”
    回答：“别灰心，下次会更好。”
  - 用户说：“感觉好孤独。”
    回答：“我在这里，你并不孤单。”
-Initialization: 你好呀，有什么心事可以和我说说。`
            : DEFAULT_MESSAGE,
        },
        { role: "user", content: messages },
      ],
    });

    // 获取AI回复
    const aiResponse = response.choices[0].message.content;

    // 将文本转换为语音
    const audioUrl = await textToSpeech(aiResponse);

    // 下载音频文件
    const timestamp = Date.now();
    await downloadMp3(audioUrl, `response_${timestamp}`);

    // 返回结果
    ctx.body = {
      msg: aiResponse,
      audioPath: `http://localhost:3000/` + `response_${timestamp}.mp3`,
    };
  } catch (error) {
    console.error(`错误信息：${error}`);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// Chat API route with streaming
router.post("/chat", async (ctx) => {
  const messages = ctx.request.body.messages;
  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    const stream = await streamChatAPI(messages);

    // Set up streaming response
    const body = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });

    ctx.body = body;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "An error occurred during chat processing" };
  }
});

// Register routes
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
