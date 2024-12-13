"use client";
import PlaylistAddCheckCircleRoundedIcon from "@mui/icons-material/PlaylistAddCheckCircleRounded";
import Snackbar from "@mui/joy/Snackbar";
import { useEffect, useState } from "react";

interface SnackBarOptions {
  message: string;
  type: "success" | "normal" | "warning";
}

export let showSnackBar: (options: SnackBarOptions) => void;

export default function SnackBar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<"success" | "neutral" | "danger">(
    "neutral"
  );

  useEffect(() => {
    showSnackBar = ({ message, type }: SnackBarOptions) => {
      // 前のスナックバーが表示されている可能性があるので、一度閉じる
      setOpen(false);

      setTimeout(() => {
        setMessage(message);
        setColor(
          type == "success"
            ? "success"
            : type == "warning"
            ? "danger"
            : "neutral"
        );
        setOpen(true);
      }, 10);
    };
  }, []);

  return (
    <>
      {children}
      <Snackbar
        variant="soft"
        color={color}
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        startDecorator={<PlaylistAddCheckCircleRoundedIcon />}
      >
        {message}
      </Snackbar>
    </>
  );
}
