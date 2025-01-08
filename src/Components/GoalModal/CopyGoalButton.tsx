import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import { useState } from "react";
import { showSnackBar } from "../SnackBar/SnackBar";
import CreateGoalModal from "./CreateGoalModal";

export default function CopyModalButton({
  deadline,
  goalText,
}: {
  deadline: string;
  goalText: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <LibraryAddOutlinedIcon
        onClick={() => {
          setOpen(true);
          showSnackBar({
            message: "明日の同じ時間で同じ目標を作成できます",
            type: "normal",
          });
        }}
        sx={{ cursor: "pointer", fontSize: "23px" }}
      />

      <CreateGoalModal
        open={open}
        setOpen={setOpen}
        defaultText={goalText}
        defaultDeadline={deadline}
      />
    </>
  );
}
