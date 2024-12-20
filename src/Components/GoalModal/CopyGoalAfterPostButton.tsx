import { Add } from "@mui/icons-material";
import { Button } from "@mui/joy";
import { useState } from "react";
import CreateGoalModal from "./CreateGoalModal";

export default function CopyGoalAfterPostButton({
  goalText,
  deadline,
}: {
  goalText: string;
  deadline: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="solid"
        color="success"
        startDecorator={<Add />}
        onClick={() => setOpen(true)}
      >
        この目標を次の日も達成する
      </Button>

      <CreateGoalModal
        open={open}
        setOpen={setOpen}
        defaultText={goalText}
        defaultDeadline={deadline}
      />
    </>
  );
}
