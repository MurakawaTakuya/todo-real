"use client";
import { appCheckToken, functionsEndpoint } from "@/app/firebase";
import { Goal } from "@/types/types";
import { useUser } from "@/utils/UserContext";
import { Add } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import {
  Button,
  DialogContent,
  DialogTitle,
  Input,
  Modal,
  ModalDialog,
  Stack,
} from "@mui/joy";
import React, { useState } from "react";

export default function GoalModal() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const { user } = useUser();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const postData: Goal = {
      userId: user?.uid as string,
      text: text,
      deadline: new Date(dueDate),
    };

    try {
      const response = await fetch(`${functionsEndpoint}/goal/`, {
        method: "POST",
        headers: {
          "X-Firebase-AppCheck": appCheckToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Success:", data);

      setText("");
      setDueDate("");
      setOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Fetch error:", error.message);
      } else {
        console.error("An unknown error occurred");
      }
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
      <Button
        variant="outlined"
        color="primary"
        startDecorator={<Add />}
        onClick={() => setOpen(true)}
        disabled={!user || user?.loginType === "Guest" || !user?.isMailVerified}
      >
        Create Goal
      </Button>

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
            <Stack spacing={2} sx={{ mt: 2 }}>
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
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="plain"
                  color="neutral"
                  onClick={() => setOpen(false)}
                >
                  Cancel
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
                  Create Goal
                </Button>
              </Stack>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </>
  );
}
