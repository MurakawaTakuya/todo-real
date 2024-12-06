"use client";
import { useUser } from "@/utils/UserContext";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface TopPageProps {
  children: ReactNode;
}

export const TopPage = ({ children }: TopPageProps) => {
  const { user } = useUser();
  if (user === null && window.location.pathname !== "/account/") {
    redirect("/account");
  }
  return (
    <>
      {user === undefined ? (
        <>ローディングぐるぐるしてるつもり</>
      ) : (
        <main>{children}</main>
      )}
    </>
  );
};
