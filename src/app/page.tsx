import Goal from "./Components/Goal/Goal";
import BasicModalDialog from "./Components/Modal/Modal";
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
      <BasicModalDialog />
    </>
  );
}
