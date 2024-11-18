// 语音合成服务
const TTS_CONFIG = {
  appid: "9777130243",
  format: "mp3",
  voice_type: "BV104_streaming",
  sample_rate: 24000,
  volume: 1.2,
  speed: 0.9,
  pitch: 1.1,
  enable_subtitle: 1,
};

const TTS_HEADERS = {
  "Resource-Id": "volc.tts_async.emotion",
  //！ 这个鉴权 token 存储在服务器 代码不做展示
  Authorization: "",
};

/**
 * 提交文本到语音合成服务
 * @param {string} text - 要转换的文本
 * @returns {Promise<{task_id: string, message: string}>} 任务ID和消息
 */
export async function submitTTSTask(text) {
  try {
    const headers = new Headers(TTS_HEADERS);
    headers.append("Content-Type", "application/json");

    const response = await fetch(
      "https://openspeech.bytedance.com/api/v1/tts_async_with_emotion/submit",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...TTS_CONFIG,
          text,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("TTS提交失败:", error);
    throw error;
  }
}

/**
 * 获取语音合成任务的结果
 * @param {string} taskId - 任务ID
 * @returns {Promise<{audio_url: string}>} 音频URL
 */
export async function getTTSResult(taskId) {
  try {
    const headers = new Headers(TTS_HEADERS);

    const response = await fetch(
      `https://openspeech.bytedance.com/api/v1/tts_async_with_emotion/query?appid=${TTS_CONFIG.appid}&task_id=${taskId}`,
      {
        method: "GET",
        headers,
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("TTS查询结果:", result);
    return result;
  } catch (error) {
    console.error("获取TTS结果失败:", error);
    throw error;
  }
}

/**
 * 等待TTS任务完成并返回音频URL
 * @param {string} taskId - 任务ID
 * @param {number} maxAttempts - 最大尝试次数
 * @param {number} interval - 检查间隔(毫秒)
 * @returns {Promise<string>} 音频URL
 */
export async function waitForTTSCompletion(
  taskId,
  maxAttempts = 3,
  interval = 1000
) {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`第 ${i + 1} 次尝试获取TTS结果...`);
    const result = await getTTSResult(taskId);

    if (result.audio_url) {
      console.log("TTS转换成功，获取到音频URL");
      return result.audio_url;
    }

    if (result.status === "failed") {
      throw new Error("TTS任务失败: " + result.message);
    }

    if (i < maxAttempts - 1) {
      console.log(`等待 ${interval}ms 后重试...`);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw new Error(`TTS任务超时: 已尝试 ${maxAttempts} 次`);
}

/**
 * 一站式服务：提交文本并等待音频URL
 * @param {string} text - 要转换的文本
 * @returns {Promise<string>} 音频URL
 */
export async function textToSpeech(text) {
  console.log("开始TTS转换，文本:", text);

  // 1. 提交任务
  const { task_id } = await submitTTSTask(text);
  console.log("TTS任务已提交，任务ID:", task_id);

  // 2. 等待完成并获取URL
  const audioUrl = await waitForTTSCompletion(task_id, 3, 2000);
  console.log("TTS转换完成，音频URL:", audioUrl);

  return audioUrl;
}
