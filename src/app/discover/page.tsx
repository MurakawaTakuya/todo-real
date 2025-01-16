"use client";
import DashBoard from "@/Components/DashBoard/DashBoard";
import GoalModalButton from "@/Components/GoalModal/GoalModalButton";
import { ResultProvider } from "@/utils/ResultContext";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";
import styled from "styled-components";

const CenteredToggleButtonGroup = styled(ToggleButtonGroup)({
  display: "flex",
  justifyContent: "center",
  margin: "30px 0 5px",
});

export default function Discover() {
  const [value, setValue] = useState<"finished" | "pending">("finished");

  return (
    <ResultProvider>
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
          <ToggleButton value="pending" sx={{ minWidth: "130px" }}>
            未完了
          </ToggleButton>
          <ToggleButton value="finished" sx={{ minWidth: "130px" }}>
            完了済み・失敗
          </ToggleButton>
        </CenteredToggleButtonGroup>
      </div>

      {value === "pending" ? (
        <DashBoard key="pending" success={false} failed={false} orderBy="asc" />
      ) : (
        <DashBoard key="finished" pending={false} />
      )}

      <GoalModalButton />
    </ResultProvider>
  );
}
