"use client";
import { createPost, handleCreatePostError } from "@/utils/API/Post/createPost";
import { useResults } from "@/utils/ResultContext";
import { useUser } from "@/utils/UserContext";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import {
  DialogContent,
  DialogTitle,
  Input,
  Modal,
  ModalDialog,
} from "@mui/joy";
import JoyButton from "@mui/joy/Button";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import { showSnackBar } from "../SnackBar/SnackBar";

export default function EditPostModal({ goalId }: { goalId: string }) {
  const { user } = useUser();
  const { successResults, setSuccessResults } = useResults();

  const defaultPostData = successResults.find(
    (result) => result.goalId === goalId
  )?.post;
  const defaultText = defaultPostData?.text || "";

  const [open, setOpen] = useState(false);
  const [text, setText] = useState(defaultText);

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !defaultPostData?.storedId ||
      !defaultPostData?.submittedAt ||
      !user?.userId
    ) {
      showSnackBar({
        message: "投稿の編集に失敗しました",
        type: "warning",
      });
      return;
    }

    const postData = {
      ...defaultPostData,
      goalId,
      userId: user?.userId,
      text,
    };
    try {
      await createPost(postData);
      showSnackBar({
        message: "目標を編集しました",
        type: "success",
      });

      setSuccessResults((prev) =>
        prev.map((result) => {
          if (result.goalId === goalId) {
            return {
              ...result,
              post: postData,
            };
          }
          return result;
        })
      );

      setOpen(false);
    } catch (error) {
      const message = handleCreatePostError(error);
      showSnackBar({
        message,
        type: "warning",
      });
    }
  };

  return (
    <>
      <EditIcon
        style={{ fontSize: "23px" }}
        onClick={() => setOpen(true)}
        sx={{ cursor: "pointer" }}
      />

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
          <DialogTitle>完了投稿を編集</DialogTitle>
          <DialogContent>変更したい投稿コメントを入れてください</DialogContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="投稿コメントを入力して下さい"
              />
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
                  onClick={handleEdit}
                >
                  変更
                </JoyButton>
              </Stack>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </>
  );
}
