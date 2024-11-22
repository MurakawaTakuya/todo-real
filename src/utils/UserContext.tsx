"use client";
import { auth } from "@/app/firebase";
import { LoginType, UserData } from "@/types/types";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchUserAPI } from "./fetchUserAPI";

interface UserContextValue {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
}

let globalSetUser: React.Dispatch<
  React.SetStateAction<UserData | null>
> | null = null;

export const UserContext = createContext<UserContextValue | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
}

export const UserProvider = ({ children }: Props) => {
  const [user, setUser] = useState<UserData | null>(null);

  globalSetUser = setUser;

  const loginMethod = (firebaseUser: FirebaseUser): LoginType => {
    const isGoogle = firebaseUser.providerData.some(
      (profile) => profile.providerId === "google.com"
    );
    const isEmail = firebaseUser.providerData.some(
      (profile) => profile.providerId === "password"
    );
    const isGuest = firebaseUser.isAnonymous;

    if (isGoogle) {
      console.log("Googleアカウントでログインしています");
      return "Google";
    }
    if (isEmail) {
      console.log("メールとパスワードでログインしています");
      return "Mail";
    }
    if (isGuest) {
      console.log("匿名（ゲスト）でログインしています");
      return "Guest";
    }

    console.log("ログインしていません");
    return "None";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (!firebaseUser) {
          console.log("No user is logged in.");
          setUser(null);
          return;
        }

        const loginType = loginMethod(firebaseUser);

        // ゲスト以外のログインの場合はユーザーデータを取得しuseContextで保持
        if (loginType === "Guest") {
          const guestData: UserData = {
            uid: firebaseUser.uid,
            name: "Guest",
            streak: 0,
            loginType: "Guest",
          };
          setUser(guestData);
          return;
        }

        try {
          const userData = await fetchUserAPI(firebaseUser.uid);
          // ユーザーデータを作成する前にfetchしようとして"User not found"になるので、postした場所でsetさせている
          // "User not found"ではない(= 初回ログイン直後ではない)場合のみsetする
          if (userData.uid) {
            setUser({ ...userData, loginType });
          }
        } catch (error) {
          console.error("ユーザーデータの取得に失敗しました:", error);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const updateUser = (userData: UserData | null) => {
  if (globalSetUser) {
    globalSetUser(userData);
  } else {
    console.error("UserProviderがまだ初期化されていません。");
  }
};
