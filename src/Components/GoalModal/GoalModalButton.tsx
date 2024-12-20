import { useUser } from "@/utils/UserContext";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import { useState } from "react";
import CreateGoalModal from "./CreateGoalModal";

export default function GoalModalButton() {
  const [open, setOpen] = useState(false);

  const { user } = useUser();

  return (
    <>
      <Box
        sx={{
          "& > :not(style)": { m: 1 },
          display: "flex",
          flexDirection: "row-reverse",
          position: "fixed",
          bottom: "90px",
          width: "100%",
          maxWidth: "600px",
          zIndex: 1000,
        }}
      >
        <Fab
          color="primary"
          aria-label="add"
          sx={{ marginRight: "10px !important" }}
          // ゲストかメール認証が未完了のユーザーは使用不可
          onClick={() => setOpen(true)}
          disabled={
            !user || user?.loginType === "Guest" || !user?.isMailVerified
          }
        >
          <AddIcon />
        </Fab>
      </Box>

      <CreateGoalModal open={open} setOpen={setOpen} />
    </>
  );
}
