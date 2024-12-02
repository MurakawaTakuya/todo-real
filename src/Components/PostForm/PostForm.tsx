"use client";
import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { Post } from "@/types/types";
import { uploadImage } from "@/utils/Uploader";
import { useUser } from "@/utils/UserContext";
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
  const { user } = useUser();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setImage(selectedFile || null);
    setError("");
  };

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleUpload = () => {
    if (!image) {
      setError("ファイルが選択されていません");
      return;
    }

    // アップロード開始
    uploadImage(
      image,
      (percent) => setProgress(percent),
      (errorMsg) => setError(errorMsg),
      async (url, hash) => {
        setImageUrl(url);
        console.log("Image is save at:", url);
        console.log("Generated storage path hash:", hash);

        const postData: Post = {
          userId: user ? user.uid : "",
          storedId: url, // TODO: トークン管理ができるまではurlをそのまま管理
          text: text,
          goalId: "temp", // TODO: 実際のgoalIdを入れる
          submittedAt: new Date(),
        };

        try {
          const response = await fetch(`${functionsEndpoint}/post/`, {
            method: "POST",
            headers: {
              "X-Firebase-AppCheck": appCheckToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          });

          if (!response.ok) {
            throw new Error("データの送信に失敗しました");
          }

          setProgress(100); // アップロード完了の進捗を表示
          const data = await response.json();
          console.log("Success:", data);
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

      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        placeholder="投稿内容を入力して下さい"
      />

      <input type="file" onChange={handleImageChange} />

      <button
        onClick={handleUpload}
        disabled={!user || user?.loginType === "Guest"}
      >
        Upload
      </button>

      {progress !== 100 && <LinearProgressWithLabel value={progress} />}

      {imageUrl && (
        <Box mt={2}>
          <Typography variant="body1">アップロード完了:</Typography>
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
