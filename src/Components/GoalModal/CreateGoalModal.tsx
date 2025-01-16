"use client";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { Goal } from "@/types/types";
import { createGoal, handleCreateGoalError } from "@/utils/API/Goal/createGoal";
import { useAddGoal } from "@/utils/ResultContext";
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
  const [deadline, setDeadline] = useState("");

  const { user } = useUser();
  const addResult = useAddGoal();

  const resetDeadline = () => {
    // 次の日の23時に設定
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(23, 0, 0, 0);
    const localNextDay = new Date(
      nextDay.getTime() - nextDay.getTimezoneOffset() * 60000
    );
    return localNextDay.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (defaultText) {
      setText(defaultText);
    }
    if (defaultDeadline) {
      const convertedDate = new Date(defaultDeadline);
      const localDate = new Date(
        convertedDate.getTime() - convertedDate.getTimezoneOffset() * 60000
      );
      localDate.setDate(localDate.getDate() + 1); // 明日にする
      setDeadline(localDate.toISOString().slice(0, 16));
    } else {
      setDeadline(resetDeadline());
    }
  }, [defaultText, defaultDeadline]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const postData: Goal = {
      userId: user?.userId as string,
      text: text,
      deadline: new Date(deadline),
    };

    try {
      const data = await createGoal(postData);

      showSnackBar({
        message: "目標を作成しました",
        type: "success",
      });

      if (user) {
        addResult({
          ...postData,
          goalId: data.goalId,
          userData: user,
          deadline: deadline,
        });
      }

      setText(defaultText || "");
      setDeadline(defaultDeadline || resetDeadline());
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
