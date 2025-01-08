"use client";
import DashBoard, {
  triggerDashBoardRerender,
} from "@/Components/DashBoard/DashBoard";
import GoalModalButton from "@/Components/GoalModal/GoalModalButton";
import { useEffect } from "react";

export default function Discover() {
  useEffect(() => {
    triggerDashBoardRerender();
  }, []);

  return (
    <>
      <DashBoard pending={false} />
      <GoalModalButton />
    </>
  );
}
