"use client";
import { functionsEndpoint } from "@/app/firebase";
import getAppCheckToken from "@/utils/getAppCheckToken";
import { useDeleteGoal } from "@/utils/ResultContext";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { DialogContent, DialogTitle, Modal, ModalDialog } from "@mui/joy";
import JoyButton from "@mui/joy/Button";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import { showSnackBar } from "../SnackBar/SnackBar";

export default function DeleteGoalModal({ goalId }: { goalId: string }) {
  const deleleGoal = useDeleteGoal();
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
      const response = await fetch(`${functionsEndpoint}/goal/${goalId}`, {
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
        deleleGoal(goalId);
      }
    } catch {
      showSnackBar({
        message: "目標の削除に失敗しました",
        type: "warning",
      });
    }
  };

  return (
    <>
      <DeleteOutlineIcon
        onClick={() => setOpen(true)}
        sx={{ cursor: "pointer", fontSize: "23px" }}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        keepMounted
        disablePortal={false}
      >
        <ModalDialog
          aria-labelledby="delete-goal-title"
          aria-describedby="delete-goal-description"
        >
          <DialogTitle id="delete-goal-title">目標を削除</DialogTitle>
          <DialogContent id="delete-goal-description">
            この目標を削除しますか?
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
