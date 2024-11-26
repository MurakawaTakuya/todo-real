import base64 from "base64-js";
import fs from "fs";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const openai = new OpenAI({
  apiKey: "HogeFuga"
});

function encodeImage(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return base64.fromByteArray(imageBuffer);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 画像のパスを正しく設定
const imagePath = path.resolve(__dirname, "./image.png");

const base64Image = encodeImage(imagePath);

const chatCompletion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "これは鳥の画像ですか?Yes:1,No:0で数字だけ返して",
        },
        {
          type: "image_url",
          // ここで image_url をオブジェクト形式に修正
          image_url: {
            url: `data:image/png;base64,${base64Image}`, // 画像データURLをオブジェクトの url プロパティとして指定
          },
        },
      ],
    },
  ],
});

console.log(chatCompletion.choices[0].message.content);
