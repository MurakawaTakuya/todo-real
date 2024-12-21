"use client";
import DashBoard from "@/Components/DashBoard/DashBoard";
import GoalModalButton from "@/Components/GoalModal/GoalModalButton";

export default function Top() {
  return (
    <>
      <DashBoard pending={false} />
      <GoalModalButton />
    </>
  );
}
