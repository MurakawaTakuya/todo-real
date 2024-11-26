import {
  requestPermission,
  revokePermission,
} from "@/utils/notificationController";
import Button from "@mui/material/Button";
import Goal from "./Components/Goal/Goal";
import GoalModal from "./Components/GoalModal/GoalModal";
import ImageUploader from "./Components/PostForm/PostForm";
import Posts from "./Components/Posts/Posts";
import UserForm from "./Components/UserForm/UserForm";

export default function Top() {
  return (
    <>
      <Posts />
      <ImageUploader />
      <UserForm />
      <Goal></Goal>
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
