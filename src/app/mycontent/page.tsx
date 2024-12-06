"use client";
import DashBoard from "@/Components/DashBoard/DashBoard";
import { useUser } from "@/utils/UserContext";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { useState } from "react";

export default function MyContent() {
  const { user } = useUser();
  const [buttonState, setButtonState] = useState<"pending" | "finished">(
    "pending"
  );

  const handlePendingClick = () => {
    setButtonState("pending");
  };

  const handleCompletedClick = () => {
    setButtonState("finished");
  };
  console.log(buttonState);
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <ButtonGroup variant="outlined" aria-label="Loading button group">
          <Button onClick={handlePendingClick}>未完了</Button>
          <Button onClick={handleCompletedClick}>完了済み</Button>
        </ButtonGroup>
      </div>

      {buttonState == "pending" ? (
        <DashBoard userId={user?.uid} success={false} failed={false} />
      ) : (
        <DashBoard userId={user?.uid} pending={false} />
      )}
    </>
  );
}
