"use client";
import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { useUser } from "@/utils/UserContext";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { DialogContent, DialogTitle, Modal, ModalDialog } from "@mui/joy";
import JoyButton from "@mui/joy/Button";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import { showSnackBar } from "../SnackBar/SnackBar";

export default function DeleteGoalModal({
  goalId,
  deadline,
}: {
  goalId: string;
  deadline: string;
}) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    const now = new Date();
    const goalDeadline = new Date(deadline);
    const oneHourInMillis = 60 * 60 * 1000;

    if (goalDeadline.getTime() - now.getTime() <= oneHourInMillis) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [deadline]);

  const handleDeleteGoal = async () => {
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
    }
  };

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
            <Button
              variant="contained"
              color="primary"
              onClick={handleDeleteGoal}
              disabled={isDisabled}
            >
              削除
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </>
  );
}
