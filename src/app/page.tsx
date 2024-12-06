"use client";
import DashBoard from "@/Components/DashBoard/DashBoard";
import GoalModal from "@/Components/GoalModal/GoalModal";
import {
  requestPermission,
  revokePermission,
} from "@/utils/CloudMessaging/notificationController";
import { Button } from "@mui/material";

export default function Top() {
  return (
    <>
      <DashBoard />
      <GoalModal />
      <Button variant="contained" onClick={requestPermission}>
        通知を受信
      </Button>
      <Button variant="contained" onClick={revokePermission}>
        通知を解除
      </Button>
    </>
  );
}
