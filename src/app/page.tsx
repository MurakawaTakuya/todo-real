import Goal from "./Components/Goal/Goal";
import Posts from "./Components/Posts/Posts";
import UpLoadTest from "./Components/Uploader/Uploader";

export default function Home() {
  return (
    <>
      <Posts />
      <UpLoadTest />
      <Goal></Goal>
    </>
  );
}
