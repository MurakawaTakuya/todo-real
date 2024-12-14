"use client";
import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { useUser } from "@/utils/UserContext";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { DialogContent, DialogTitle, Modal, ModalDialog } from "@mui/joy";
import JoyButton from "@mui/joy/Button";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import { showSnackBar } from "../SnackBar/SnackBar";

export default function DeletePostModal({
  postId,
  deadline,
}: {
  postId: string;
  deadline: string;
}) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const handleDeletePost = async () => {
    const response = await fetch(`${functionsEndpoint}/post/${postId}`, {
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
          sx={{ width: "90%", maxWidth: 400 }}
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleDeletePost}
            >
              削除
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </>
  );
}
