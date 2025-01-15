"use client";
import DashBoard from "@/Components/DashBoard/DashBoard";
import GoalModalButton from "@/Components/GoalModal/GoalModalButton";
import { ResultProvider } from "@/utils/ResultContext";
import { useUser } from "@/utils/UserContext";
import Typography from "@mui/joy/Typography";
import { styled } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";

const CenteredToggleButtonGroup = styled(ToggleButtonGroup)({
  display: "flex",
  justifyContent: "center",
  margin: "30px 0 5px",
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
          <ToggleButton value="pending" sx={{ minWidth: "130px" }}>
            未完了
          </ToggleButton>
          <ToggleButton value="finished" sx={{ minWidth: "130px" }}>
            完了済み・失敗
          </ToggleButton>
        </CenteredToggleButtonGroup>
      </div>

      {user?.loginType === "Guest" ? (
        <Typography
          level="body-md"
          color="danger"
          sx={{ textAlign: "center", marginTop: "20px" }}
        >
          ゲストログインでは投稿を作成できません。
        </Typography>
      ) : !user?.isMailVerified ? (
        <Typography
          level="body-md"
          color="danger"
          sx={{ textAlign: "center", marginTop: "20px" }}
        >
          メールに届いた認証リンクを確認してください。
        </Typography>
      ) : value === "pending" ? (
        <ResultProvider>
          <DashBoard
            key="pending"
            userId={user?.userId}
            success={false}
            failed={false}
            orderBy="asc"
          />
        </ResultProvider>
      ) : (
        value === "finished" && (
          <ResultProvider>
            <DashBoard key="finished" userId={user?.userId} pending={false} />
          </ResultProvider>
        )
      )}

      <GoalModalButton />
    </>
  );
}
