import GoalModal from "@/Components/GoalModal/GoalModal";
import PostForm from "@/Components/PostForm/PostForm";
import Posts from "@/Components/Posts/Posts";
import UserForm from "@/Components/UserForm/UserForm";
import {
  requestPermission,
  revokePermission,
} from "@/utils/CloudMessaging/notificationController";
import Button from "@mui/material/Button";

export default function Top() {
  return (
    <>
      <Posts />
      asdf
      <PostForm />
      <UserForm />
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
