"use client";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Snackbar from "@mui/joy/Snackbar";
import { ReactNode, useEffect, useState } from "react";

interface SnackBarOptions {
  message: string | ReactNode;
  type?: "success" | "normal" | "warning";
}

export let showSnackBar: (options: SnackBarOptions) => void;

export default function SnackBar({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | ReactNode>("");
  const [color, setColor] = useState<"success" | "neutral" | "danger">(
    "neutral"
  );

  useEffect(() => {
    showSnackBar = ({ message, type = "normal" }: SnackBarOptions) => {
      // 前のスナックバーが表示されている可能性があるので、一度初期化
      setOpen(false);
      setMessage("");
      setColor("neutral");

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
        autoHideDuration={3000}
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
        sx={{ "--Snackbar-inset": "100px" }}
      >
        {message}
      </Snackbar>
    </>
  );
}