"use client";
import PlaylistAddCheckCircleRoundedIcon from "@mui/icons-material/PlaylistAddCheckCircleRounded";
import Snackbar from "@mui/joy/Snackbar";
import { useEffect, useState } from "react";

interface SnackBarOptions {
  message: string;
  color: "success" | "neutral" | "warning";
}

export let showSnackBar: (options: SnackBarOptions) => void;

export default function SnackBar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<"success" | "neutral" | "warning">(
    "success"
  );

  useEffect(() => {
    showSnackBar = ({ message, color }: SnackBarOptions) => {
      console.log("showSnackBar");
      setMessage(message);
      setColor(color);
      setOpen(true);
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
