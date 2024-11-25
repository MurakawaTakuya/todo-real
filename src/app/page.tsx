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
    </>
  );
}
