"use client";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { PostWithGoalId } from "@/types/types";
import { createPost, handleCreatePostError } from "@/utils/API/Post/createPost";
import { useAddPost } from "@/utils/ResultContext";
import { removeImageMetadata, uploadImage } from "@/utils/Uploader";
import { useUser } from "@/utils/UserContext";
import { Add } from "@mui/icons-material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import SendIcon from "@mui/icons-material/Send";
import {
  DialogContent,
  DialogTitle,
  Input,
  Button as JoyButton,
  Modal,
  ModalDialog,
  Stack,
} from "@mui/joy";
import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import React, { ChangeEvent, useState } from "react";

export default function CreatePostModal({ goalId }: { goalId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(100);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUser();
  const addPost = useAddPost();

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      showSnackBar({
        message: "画像が選択されていません",
        type: "warning",
      });
      return;
    }

    // ファイルサイズの上限を設定
    const maxSize = 8; // 上限8MB
    const fileWithoutMetadata = await removeImageMetadata(selectedFile); // モーションフォトの動画を除いたサイズを取得
    const fileSizeMB = fileWithoutMetadata.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      showSnackBar({
        message: `最大ファイルサイズは${maxSize}MBです。`,
        type: "warning",
      });
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      showSnackBar({
        message: "画像ファイルのみアップロードできます",
        type: "warning",
      });
      return;
    }
    setImage(selectedFile || null);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  const handleUpload = async () => {
    if (!image) {
      showSnackBar({
        message: "画像が選択されていません",
        type: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      await uploadImage(
        image,
        (percent) => setProgress(percent),
        async (url, id) => {
          const postData: PostWithGoalId = {
            userId: user?.userId as string,
            storedId: id,
            text: text,
            goalId: goalId,
            submittedAt: new Date(),
          };

          try {
            await createPost(postData);

            setProgress(100);

            showSnackBar({
              message: "投稿しました",
              type: "success",
            });

            const postDataWithStringDate = {
              ...postData,
              submittedAt: (postData.submittedAt as Date).toISOString(),
            };
            addPost(goalId, postDataWithStringDate);

            setImage(null);
            setText("");
            setOpen(false);
            setFileName("");
            setLoading(false);
          } catch (error: unknown) {
            console.error("Error creating post:", error);
            const message = handleCreatePostError(error);
            showSnackBar({
              message,
              type: "warning",
            });
            setLoading(false);
          }
        }
      );
    } catch (error: unknown) {
      console.error(error);
      showSnackBar({
        message: "画像のアップロードに失敗しました",
        type: "warning",
      });
      setLoading(false);
    }
  };

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const FileName = styled("span")({
    display: "inline-block",
    maxWidth: "200px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "bottom",
  });

  return (
    <>
      <JoyButton
        variant="outlined"
        color="primary"
        startDecorator={<Add />}
        onClick={() => setOpen(true)}
      >
        写真を撮って完了する
      </JoyButton>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        keepMounted
        disablePortal={false}
      >
        <ModalDialog
          aria-labelledby="create-post-title"
          aria-describedby="create-post-description"
          sx={{ width: "90%", maxWidth: 400 }}
        >
          <DialogTitle>完了投稿を作成</DialogTitle>
          <DialogContent>投稿コメントと画像を入れてください</DialogContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Input
                type="text"
                value={text}
                onChange={handleTextChange}
                placeholder="投稿コメントを入力して下さい"
              />
              <MuiButton
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<AddAPhotoIcon />}
                sx={{ margin: "16px auto 0 !important", height: "40px" }}
              >
                <FileName>
                  {fileName ? fileName : "画像をアップロード"}
                </FileName>
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                />
              </MuiButton>
              {progress !== 100 && <LinearProgressWithLabel value={progress} />}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <JoyButton
                  variant="plain"
                  color="neutral"
                  onClick={() => setOpen(false)}
                >
                  キャンセル
                </JoyButton>
                <JoyButton
                  type="submit"
                  variant="solid"
                  color="primary"
                  endDecorator={<SendIcon />}
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ marginRight: 1 }} />
                      投稿中
                    </>
                  ) : (
                    "投稿"
                  )}
                </JoyButton>
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
    <>
      <Box
        display="flex"
        alignItems="center"
        sx={{ marginTop: "16px !important" }}
      >
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" value={value} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(
            value
          )}%`}</Typography>
        </Box>
      </Box>
    </>
  );
};
