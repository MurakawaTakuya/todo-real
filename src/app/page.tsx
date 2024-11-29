"use client";
import Goal from "./Components/Goal/Goal";
import Posts from "./Components/Posts/Posts";
import UpLoadTest from "./Components/Uploader/Uploader";
import UserForm from "./Components/UserForm/UserForm";

export default function Home() {
  return (
    <>
      <Posts />
      <UserForm />
      <UpLoadTest />
      <Goal></Goal>
    </>
  );
}
