"use client";
import { functionsEndpoint } from "@/app/firebase";
import getAppCheckToken from "@/utils/getAppCheckToken";
import { useDeletePost } from "@/utils/ResultContext";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { DialogContent, DialogTitle, Modal, ModalDialog } from "@mui/joy";
import JoyButton from "@mui/joy/Button";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import { showSnackBar } from "../SnackBar/SnackBar";

export default function DeletePostModal({
  goalId,
  deadline,
}: {
  goalId: string;
  deadline: string;
}) {
  const deletePost = useDeletePost();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    const appCheckToken = await getAppCheckToken().catch((error) => {
      showSnackBar({
        message: error.message,
        type: "warning",
      });
      return "";
    });

    if (!appCheckToken) {
      showSnackBar({
        message:
          "App Checkの初期化に失敗しました。debug tokenがサーバーに登録されていることを確認してください。",
        type: "warning",
      });
      return;
    }

    try {
      const response = await fetch(`${functionsEndpoint}/post/${goalId}`, {
        method: "DELETE",
        headers: {
          "X-Firebase-AppCheck": appCheckToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        showSnackBar({
          message: "目標の削除に失敗しました",
          type: "warning",
        });
      } else {
        setOpen(false);
        showSnackBar({
          message: "目標を削除しました",
          type: "success",
        });
        deletePost(goalId);
      }
    } catch {
      showSnackBar({
        message: "目標の削除に失敗しました",
        type: "warning",
      });
    }
  };

  const isPastDeadline = new Date() > new Date(deadline);

  return (
    <>
      <DeleteOutlineIcon
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
          aria-labelledby="delete-post-title"
          aria-describedby="delete-post-description"
        >
          <DialogTitle id="delete-post-title">投稿を削除</DialogTitle>
          <DialogContent id="delete-post-description">
            {isPastDeadline
              ? "この投稿を削除すると、目標は失敗したことになります。"
              : "この投稿を削除しますか?"}
          </DialogContent>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <JoyButton
              variant="plain"
              color="neutral"
              onClick={() => setOpen(false)}
            >
              キャンセル
            </JoyButton>
            <Button variant="contained" color="error" onClick={handleDelete}>
              削除
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </>
  );
}
