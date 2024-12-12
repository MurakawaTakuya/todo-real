"use client";
import DashBoard from "@/Components/DashBoard/DashBoard";
import { useUser } from "@/utils/UserContext";
import { styled } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";

const CenteredToggleButtonGroup = styled(ToggleButtonGroup)({
  display: "flex",
  justifyContent: "center",
  marginBottom: "16px",
});

export default function MyContent() {
  const { user } = useUser();
  const [value, setValue] = useState<"pending" | "finished">("pending");

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <CenteredToggleButtonGroup
          value={value}
          exclusive
          onChange={(event, newValue) => {
            if (newValue) {
              setValue(newValue);
            }
          }}
          aria-label="Loading button group"
        >
          <ToggleButton value="pending">未完了</ToggleButton>
          <ToggleButton value="finished">完了済み</ToggleButton>
        </CenteredToggleButtonGroup>
      </div>

      {value == "pending" ? (
        <DashBoard userId={user?.userId} success={false} failed={false} />
      ) : (
        <DashBoard userId={user?.userId} pending={false} />
      )}
    </>
  );
}
