"use client";
import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { Post } from "@/types/types";
import { uploadImage } from "@/utils/Uploader";
import { useUser } from "@/utils/UserContext";
import { Add } from "@mui/icons-material";
import {
  Button,
  DialogContent,
  DialogTitle,
  Input,
  Modal,
  ModalDialog,
  Stack,
} from "@mui/joy";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import React, { ChangeEvent, useState } from "react";

export default function PostModal({ goalId }: { goalId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(100);
  const { user } = useUser();

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

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
      async (url, hash) => {
        const postData: Post = {
          userId: user?.uid as string,
          storedId: url,
          text: text,
          goalId: goalId,
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

          setProgress(100);
          const data = await response.json();
          console.log("Post created:", data);

          setImage(null);
          setText("");
          setOpen(false);
        } catch (err) {
          setError("データの送信に失敗しました");
          console.error(err);
        }
      }
    );
  };

  // 以下のJoy UIによるエラーを無効化
  try {
    const consoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes("Accessing element.ref was removed")) {
        return;
      }
      consoleError(...args);
    };
  } catch {
    console.error("Failed to disable Joy UI error");
  }

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startDecorator={<Add />}
        onClick={() => setOpen(true)}
        disabled={!user || user?.loginType === "Guest"}
      >
        写真を撮って完了する
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        keepMounted
        disablePortal
      >
        <ModalDialog
          aria-labelledby="create-post-title"
          aria-describedby="create-post-description"
        >
          <DialogTitle>完了投稿を作成</DialogTitle>
          <DialogContent>投稿コメントと画像を入れてください</DialogContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {error && <Typography color="error">{error}</Typography>}
              <Input
                type="text"
                value={text}
                onChange={handleTextChange}
                placeholder="投稿コメントを入力して下さい"
                required
              />
              <input type="file" onChange={handleImageChange} />
              {progress !== 100 && <LinearProgressWithLabel value={progress} />}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="plain"
                  color="neutral"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="solid"
                  color="primary"
                  disabled={!user || user?.loginType === "Guest"}
                  onClick={handleUpload}
                >
                  投稿
                </Button>
              </Stack>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </>
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
