"use client";
import { handleUpdateGoalError, updateGoal } from "@/utils/API/Goal/updateGoal";
import { useResults } from "@/utils/ResultContext";
import { useUser } from "@/utils/UserContext";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
  DialogContent,
  DialogTitle,
  Input,
  Modal,
  ModalDialog,
  Typography,
} from "@mui/joy";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import { showSnackBar } from "../SnackBar/SnackBar";

export default function EditGoalModal({
  goalId,
  resultType,
}: {
  goalId: string;
  resultType: "success" | "failed" | "pending";
}) {
  const { user } = useUser();
  const {
    pendingResults,
    setPendingResults,
    successResults,
    setSuccessResults,
  } = useResults();

  let defaultText = "";
  let defaultDeadline = "";
  if (resultType === "pending") {
    defaultText =
      pendingResults.find((result) => result.goalId === goalId)?.text || "";
    defaultDeadline =
      pendingResults.find((result) => result.goalId === goalId)?.deadline || "";
  } else if (resultType === "success") {
    defaultText =
      successResults.find((result) => result.goalId === goalId)?.text || "";
    defaultDeadline =
      successResults.find((result) => result.goalId === goalId)?.deadline || "";
  }

  const defaultDate = new Date(defaultDeadline);
  const localDate = new Date(
    defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000
  );

  const [open, setOpen] = useState(false);
  const [text, setText] = useState(defaultText);
  const [deadline, setDeadline] = useState(
    localDate.toISOString().slice(0, 16)
  );

  if (!defaultText || !defaultDeadline) {
    return;
  }

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (deadline < new Date().toISOString().slice(0, 16)) {
      showSnackBar({
        message: "過去の時間を設定することはできません",
        type: "warning",
      });
      return;
    }

    const putData = {
      text,
      deadline: new Date(deadline),
    };

    try {
      await updateGoal(goalId, putData);

      showSnackBar({
        message: "目標を編集しました",
        type: "success",
      });

      // resultContextを更新
      if (resultType === "pending") {
        setPendingResults((prev) =>
          prev.map((result) =>
            result.goalId === goalId ? { ...result, text, deadline } : result
          )
        );
      } else {
        setSuccessResults((prev) =>
          prev.map((result) =>
            result.goalId === goalId ? { ...result, text, deadline } : result
          )
        );
      }

      setOpen(false);
    } catch (error: unknown) {
      const message = handleUpdateGoalError(error);
      showSnackBar({
        message,
        type: "warning",
      });
    }
  };

  // 失敗の時は表示しない
  if (resultType === "failed") {
    return;
  }

  return (
    <>
      <EditIcon
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
          aria-labelledby="create-goal-title"
          aria-describedby="create-goal-description"
          sx={{ width: "90%", maxWidth: 400 }}
        >
          <DialogTitle>目標を編集</DialogTitle>
          <DialogContent>
            編集したいテキストと期限を入れてください
          </DialogContent>
          <form onSubmit={handleEdit}>
            <Stack spacing={2}>
              <Input
                placeholder="目標内容"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
              <Typography color="danger">
                期限が1時間以内の目標は削除・編集できなくなります
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="plain"
                  color="neutral"
                  onClick={() => setOpen(false)}
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  variant="solid"
                  color="success"
                  disabled={
                    !user ||
                    user?.loginType === "Guest" ||
                    !user?.isMailVerified
                  }
                  endDecorator={<EditIcon />}
                >
                  編集
                </Button>
              </Stack>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </>
  );
}
