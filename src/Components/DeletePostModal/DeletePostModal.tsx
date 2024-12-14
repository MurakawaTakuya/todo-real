"use client";
import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { useUser } from "@/utils/UserContext";
import DeleteIcon from "@mui/icons-material/Delete";
import { DialogContent, DialogTitle, Modal, ModalDialog } from "@mui/joy";
import JoyButton from "@mui/joy/Button";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import { RoundedButton } from "../Account/LoggedInView";

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
      console.error("Failed to delete post");
    } else {
      console.log("Post deleted successfully");
      setOpen(false);
    }
  };

  const isPastDeadline = new Date() > new Date(deadline);

  return (
    <>
      <RoundedButton variant="outlined" onClick={() => setOpen(true)}>
        <DeleteIcon style={{ fontSize: "20px" }} />
      </RoundedButton>

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
              : "本当にこの投稿を削除しますか？"}
          </DialogContent>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <JoyButton
              variant="plain"
              color="neutral"
              onClick={() => setOpen(false)}
            >
              いいえ
            </JoyButton>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDeletePost}
            >
              はい
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </>
  );
}
