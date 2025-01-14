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

    const maxNameLength = 30;
    if (newName.length > maxNameLength) {
      showSnackBar({
        message: `名前は${maxNameLength}文字以内で入力してください`,
        type: "warning",
      });
      return;
    }

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
        const status = response.status;
        const data = await response.json();
        throw new Error(`Error ${status}: ${data.message}`);
      }

      // Firebase AuthenticationのdisplayNameを更新
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName });
        console.log("Firebase displayName updated successfully");
      } else {
        console.error("Failed to update displayName: No authenticated user");
      }

      setNewName("");
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating name:", error);
      showSnackBar({
        message: "名前の変更に失敗しました",
        type: "warning",
      });
    }
  };

  return (
    <>
      <RoundedButton
        variant="outlined"
        onClick={() => setOpen(true)}
        disabled={user?.loginType === "Guest" || !user?.isMailVerified}
      >
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
          sx={{ width: "90%", maxWidth: 400 }}
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
