"use client";
import DashBoard, {
  triggerDashBoardRerender,
} from "@/Components/DashBoard/DashBoard";
import GoalModalButton from "@/Components/GoalModal/GoalModalButton";
import { ResultProvider } from "@/utils/ResultContext";
import { useEffect } from "react";

export default function Discover() {
  useEffect(() => {
    triggerDashBoardRerender();
  }, []);

  return (
    <>
      <ResultProvider>
        <DashBoard pending={false} />
      </ResultProvider>
      <GoalModalButton />
    </>
  );
}
