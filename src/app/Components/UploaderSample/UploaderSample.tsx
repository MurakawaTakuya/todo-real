// 画像アップロードテスト用
"use client";
import { uploadImage } from "@/app/utils/Uploader";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import React, { ChangeEvent, useState } from "react";

export default function UploaderSample() {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(100);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setImage(selectedFile || null);
    setError("");
  };

  const handleUpload = () => {
    if (!image) {
      setError("ファイルが選択されていません");
      return;
    }

    uploadImage(
      image,
      (percent) => setProgress(percent),
      (errorMsg) => setError(errorMsg),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (url, hash) => {
        setImageUrl(url);
        // console.log("Generated Hash:", hash); // アップロード完了時にユニークIDを表示
      }
    );
  };

  return (
    <div>
      <Typography variant="h6">ファイルをアップロード</Typography>
      {error && <Typography color="error">{error}</Typography>}

      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>

      {progress !== 100 && <LinearProgressWithLabel value={progress} />}

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
