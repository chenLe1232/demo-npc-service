import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取项目根目录（当前文件所在的src的上一级目录）
const PROJECT_ROOT = path.resolve(__dirname, "..");

// mp3文件夹的完整路径
const MP3_DIR = path.join(PROJECT_ROOT, "mp3");

// 确保mp3目录存在
if (!fs.existsSync(MP3_DIR)) {
  fs.mkdirSync(MP3_DIR, { recursive: true });
}

export { MP3_DIR, PROJECT_ROOT };
