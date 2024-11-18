import path from "path";
import fs from "fs";
// import { MP3_DIR, fileURLToPath } from "./mp3Path.mjs";

//! 根据 url 下载 mp3 文件 到 服务器的 mp3 目录下
export async function downloadMp3(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // 获取二进制数据
    const arrayBuffer = await response.arrayBuffer();
    // 转换为 Buffer
    const buffer = Buffer.from(arrayBuffer);

    // 确保目录存在

    // 构建文件路径并保存
    const filePath = path.join(process.cwd(), "mp3", `${filename}.mp3`);
    await fs.promises.writeFile(filePath, buffer);
    console.log("File saved to:", filePath);
  } catch (error) {
    console.error(`错误信息：${error}`);
    throw error;
  }
}
//! 发起请求，创建 mp3 文件

// 测试代码

// const testUrl =
//   "https://lf26-lab-speech-tt-sign.bytespeech.com/tos-cn-o-14155/oocAggOEINA1Awn3eFdz0oEA5DzjfNNJtACYAC?x-expires=1731847245&x-signature=3aIRTKLgNdF%2FrJt91IhdThUs2vQ%3D";
// console.log("Testing downloadMp3 function...");
// downloadMp3(testUrl, "demo")
//   .then((path) => console.log("File saved to:", path))
//   .catch((err) => console.error("Test failed:", err));
