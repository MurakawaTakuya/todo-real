import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import { useState } from "react";
import CreateGoalModal from "./CreateGoalModal";

export default function CopyModalButton({
  deadline,
  text,
}: {
  deadline: string;
  text: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <LibraryAddOutlinedIcon
        onClick={() => setOpen(true)}
        sx={{ cursor: "pointer", fontSize: "23px" }}
      />

      <CreateGoalModal
        open={open}
        setOpen={setOpen}
        defaultText={text}
        defaultDeadline={deadline}
      />
    </>
  );
}
