"use client";
import { uploadImage } from "@/app/utils/Uploader";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import React, { ChangeEvent, useState } from "react";

export default function PostForm() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(100);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    // TODO: 画像の更新
    const selectedFile = event.target.files?.[0];
    setImage(selectedFile || null);
    setError("");
  };

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    // TODO: テキストの更新
    setText(event.target.value);
  };

  const handleUpload = () => {
    if (!image) {
      setError("ファイルが選択されていません");
      return;
    }
    if (!text) {
      setError("テキストが入力されていません");
      return;
    }

    // アップロード開始
    uploadImage(
      image,
      (percent) => setProgress(percent),
      (errorMsg) => setError(errorMsg),
      async (url, hash) => {
        setImageUrl(url);
        console.log("Image is save at :", url);
        console.log("Generated storage path hash:", hash);

        const postData = {
          userId: "temp", // authenticatorが準備できるまで仮で設定
          storeId: `post/${hash}/image`,
          text: text,
          goalId: "temp", // authenticatorが準備できるまで仮で設定
        };

        try {
          const response = await fetch(
            "http://127.0.0.1:5001/todo-real-c28fa/asia-northeast1/firestore/post/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(postData),
            }
          );

          if (!response.ok) {
            throw new Error("データの送信に失敗しました");
          }

          setProgress(100); // アップロード完了の進捗を表示
          console.log("success:", postData);
        } catch (err) {
          setError("データの送信に失敗しました");
          console.error(err);
        }
      }
    );
  };

  return (
    <div>
      <Typography variant="h6">投稿内容を入力</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {/* TODO: テキスト入力 */}
      <input
        type = "text"
        value={text}
        onChange={handleTextChange}
        placeholder = "投稿内容を入力して下さい"
      />

      {/* TODO: 画像選択 */}
      <input
        type="file"
        onChange={handleImageChange}
      />

      {/* TODO: アップロードボタン */}
      <button onClick={handleUpload}>Upload</button>

      {progress !== 100 && <LinearProgressWithLabel value={progress} />}

      {/* 一旦仮で表示 */}
      {imageUrl && (
        <Box mt={2}>
          <Typography variant="body1">アップロード完了:</Typography>
          <img src={imageUrl} alt="Uploaded file" width="400px" />
        </Box>
      )}
    </div>
  );
}

interface LinearProgressWithLabelProps {
  value: number;
}

const LinearProgressWithLabel: React.FC<LinearProgressWithLabelProps> = ({
  value,
}) => {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          value
        )}%`}</Typography>
      </Box>
    </Box>
  );
};
