"use client";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { Goal } from "@/types/types";
import { createGoal, handleCreateGoalError } from "@/utils/API/Goal/createGoal";
import { useUser } from "@/utils/UserContext";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
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
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import React, { useState } from "react";

export default function GoalModal() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const { user } = useUser();

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

  // 以下のJoy UIによるエラーを無効化
  // Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release. Error Component Stack
  try {
    const consoleError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes("Accessing element.ref was removed")) {
        return;
      }
      consoleError(...args);
    };
  } catch {
    console.error("Failed to disable Joy UI error");
  }

  return (
    <>
      <Box
        sx={{
          "& > :not(style)": { m: 1 },
          display: "flex",
          flexDirection: "row-reverse",
          position: "fixed",
          bottom: "90px",
          width: "100%",
          maxWidth: "600px",
          zIndex: 1000,
        }}
      >
        <Fab
          color="primary"
          aria-label="add"
          sx={{ marginRight: "10px !important" }}
          // ゲストかメール認証が未完了のユーザーは使用不可
          onClick={() => setOpen(true)}
          disabled={
            !user || user?.loginType === "Guest" || !user?.isMailVerified
          }
        >
          <AddIcon />
        </Fab>
      </Box>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        keepMounted
        disablePortal
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
                    !user ||
                    user?.loginType === "Guest" ||
                    !user?.isMailVerified
                  }
                  endDecorator={<SendIcon />}
                >
                  作成
                </Button>
              </Stack>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </>
  );
}
