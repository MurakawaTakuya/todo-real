"use client";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { Goal } from "@/types/types";
import { createGoal, handleCreateGoalError } from "@/utils/API/Goal/createGoal";
import { useUser } from "@/utils/UserContext";
import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  DialogContent,
  DialogTitle,
  Input,
  Modal,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import React, { useEffect, useState } from "react";
import { triggerDashBoardRerender } from "../DashBoard/DashBoard";

export default function CreateGoalModal({
  open,
  setOpen,
  defaultText,
  defaultDeadline,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultText?: string;
  defaultDeadline?: string;
}) {
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { user } = useUser();

  useEffect(() => {
    if (defaultText) {
      setText(defaultText);
    }
    if (defaultDeadline) {
      const convertedDate = new Date(defaultDeadline);
      const localDate = new Date(
        convertedDate.getTime() - convertedDate.getTimezoneOffset() * 60000
      );
      localDate.setDate(localDate.getDate() + 1); // 1日後にする
      setDueDate(localDate.toISOString().slice(0, 16));
    } else {
      // 初期値の指定が無い場合は次の日の23時に設定
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(23, 0, 0, 0);
      const localNextDay = new Date(
        nextDay.getTime() - nextDay.getTimezoneOffset() * 60000
      );
      setDueDate(localNextDay.toISOString().slice(0, 16));
    }
  }, [defaultText, defaultDeadline]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // 過去の時間が入力されている場合
    if (new Date(dueDate).getTime() < Date.now()) {
      showSnackBar({
        message: "過去の時間を指定することはできません",
        type: "warning",
      });
      return;
    }

    const postData: Goal = {
      userId: user?.userId as string,
      text: text,
      deadline: new Date(dueDate),
    };

    try {
      const data = await createGoal(postData);
      console.log("Success:", data);

      showSnackBar({
        message: "目標を作成しました",
        type: "success",
      });
      triggerDashBoardRerender();

      setText("");
      setDueDate("");
      setOpen(false);
    } catch (error: unknown) {
      console.error("Error creating goal:", error);
      const message = handleCreateGoalError(error);
      showSnackBar({
        message,
        type: "warning",
      });
    }
  };

  return (
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
        <DialogTitle>目標を作成</DialogTitle>
        <DialogContent>達成したい内容と期限を入力してください</DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Input
              placeholder="Goal Title"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <Typography color="danger">
              期限が1時間以内の目標は削除できなくなります
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
                color="primary"
                disabled={
                  !user || user?.loginType === "Guest" || !user?.isMailVerified
                }
                endDecorator={<AddIcon />}
              >
                作成
              </Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
