"use client";
import { appCheckToken, auth, functionsEndpoint } from "@/app/firebase";
import { useUser } from "@/utils/UserContext";
import {
  DialogContent,
  DialogTitle,
  Input,
  Modal,
  ModalDialog,
} from "@mui/joy";
import JoyButton from "@mui/joy/Button";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { RoundedButton } from "../Account/LoggedInView";
import { showSnackBar } from "../SnackBar/SnackBar";

export default function NameUpdate() {
  const { user } = useUser();
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  const handleNameUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${functionsEndpoint}/user/${user?.userId}`,
        {
          method: "PUT",
          headers: {
            "X-Firebase-AppCheck": appCheckToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Firebase AuthenticationのdisplayNameを更新
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName });
        console.log("Firebase displayName updated successfully");
      } else {
        console.error("Failed to update displayName: No authenticated user");
      }

      showSnackBar({
        message: "名前を変更しました",
        type: "success",
      });
      setNewName("");
      setOpen(false);
    } catch (error) {
      console.error("Error updating name:", error);
      showSnackBar({
        message: "名前の変更に失敗しました",
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
      <RoundedButton variant="outlined" onClick={() => setOpen(true)}>
        名前を変更
      </RoundedButton>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        keepMounted
        disablePortal
      >
        <ModalDialog
          aria-labelledby="update-name-title"
          aria-describedby="update-name-description"
        >
          <DialogTitle id="update-name-title">名前を変更</DialogTitle>
          <DialogContent id="update-name-description">
            現在の名前: {user?.name}
          </DialogContent>
          <form onSubmit={handleNameUpdate}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Input
                placeholder="新しい名前"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <JoyButton
                  variant="plain"
                  color="neutral"
                  onClick={() => setOpen(false)}
                >
                  キャンセル
                </JoyButton>
                <Button type="submit" variant="contained" color="primary">
                  変更
                </Button>
              </Stack>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </>
  );
}
