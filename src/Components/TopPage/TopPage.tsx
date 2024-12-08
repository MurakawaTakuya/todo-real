"use client";
import { useUser } from "@/utils/UserContext";
import CircularProgress from "@mui/joy/CircularProgress";
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
        <CircularProgress
          color="primary"
          variant="soft"
          size="lg"
          value={30}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ) : (
        <main>{children}</main>
      )}
    </>
  );
};
