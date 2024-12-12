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
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { updateProfile } from "firebase/auth";
import React, { useState } from "react";

export default function NameUpdate({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [newName, setNewName] = useState("");
  const { user } = useUser();
  const handleNameUpdate = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch(`${functionsEndpoint}/user/${user?.userId}`, {
      method: "PUT",
      headers: {
        "X-Firebase-AppCheck": appCheckToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName }),
    });

    // Firebase Authentication の displayName を更新
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: newName });
      console.log("Firebase displayName updated successfully");
    } else {
      console.error("Failed to update displayName: No authenticated user");
    }

    if (!response.ok) {
      console.error("Failed to update name");
    } else {
      console.log("Name updated successfully");
      setNewName("");
      setOpen(false);
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
    <Modal open={open} onClose={() => setOpen(false)} keepMounted disablePortal>
      <ModalDialog
        aria-labelledby="update-name-title"
        aria-describedby="update-name-description"
      >
        <DialogTitle id="update-name-title">名前を変更</DialogTitle>
        <DialogContent id="update-name-description">
          新しい名前を入力してください.
        </DialogContent>
        <form onSubmit={handleNameUpdate}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Input
              placeholder="New Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Update Name
              </Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
