"use client";
import { storage } from "@/app/firebase";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import React, { ChangeEvent, useState } from "react";

const Uploader: React.FC = () => {
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

    const storageRef = ref(storage, `images/test/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percent);
      },
      (error) => {
        setError("ファイルアップに失敗しました。エラー: " + error.message);
        setProgress(100);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrl(downloadURL);
          setProgress(100);
        });
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
};

export default Uploader;

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
