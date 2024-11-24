"use client";
import "@/utils/getNotification";
import "@/utils/messaging";
import requestPermission from "@/utils/requestNotificationPermission";
import { useEffect } from "react";
import Goal from "./Components/Goal/Goal";
import ImageUploader from "./Components/PostForm/PostForm";
import Posts from "./Components/Posts/Posts";
import UserForm from "./Components/UserForm/UserForm";

export default function Top() {
  useEffect(() => {
    requestPermission();
  }, []);
  return (
    <>
      <Posts />
      <ImageUploader />
      <UserForm />
      <Goal></Goal>
    </>
  );
}
