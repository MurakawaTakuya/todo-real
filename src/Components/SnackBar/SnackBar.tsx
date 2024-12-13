"use client";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Snackbar from "@mui/joy/Snackbar";
import { ReactNode, useEffect, useState } from "react";

interface SnackBarOptions {
  message: string | ReactNode;
  type?: "success" | "normal" | "warning";
  duration?: number;
}

export let showSnackBar: (options: SnackBarOptions) => void;

export default function SnackBar() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | ReactNode>("");
  const [color, setColor] = useState<"success" | "neutral" | "danger">(
    "neutral"
  );
  const [duration, setDuration] = useState(3000);

  useEffect(() => {
    showSnackBar = ({
      message,
      type = "normal",
      duration = 3000,
    }: SnackBarOptions) => {
      // 初期化
      setOpen(false);
      setMessage("");
      setColor("neutral");
      setDuration(3000);

      setTimeout(() => {
        setMessage(message);
        setColor(
          type === "success"
            ? "success"
            : type === "warning"
            ? "danger"
            : "neutral"
        );
        setOpen(true);
        setDuration(duration);
      }, 10);
    };
  }, []);

  return (
    <>
      <Snackbar
        variant="soft"
        color={color}
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={duration}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        startDecorator={
          color === "success" ? (
            <CheckIcon />
          ) : color === "danger" ? (
            <ErrorOutlineIcon />
          ) : (
            <InfoOutlinedIcon />
          )
        }
        sx={{
          "--Snackbar-inset": "100px",
          "--Snackbar-padding": "12px 10px",
          justifyContent: "center",
          maxWidth: "90%",
          minWidth: "250px",
        }}
      >
        <span
          style={{
            width:
              typeof message !== "string" || message.length > 25
                ? "500px"
                : "auto",
          }}
        >
          {message}
        </span>
      </Snackbar>
    </>
  );
}
