"use client";
import { auth } from "@/app/firebase";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { LoginType, User } from "@/types/types";
import {
  fetchUserById,
  handleFetchUserError,
} from "@/utils/API/User/fetchUser";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserContextValue {
  user: User | null | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
}

let globalSetUser:
  | React.Dispatch<React.SetStateAction<User | null | undefined>>
  | null
  | undefined = undefined;

export const UserContext = createContext<UserContextValue | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
}

export const UserProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);

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
      return "Google";
    }
    if (isEmail) {
      return "Mail";
    }
    if (isGuest) {
      return "Guest";
    }

    return "None";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (!firebaseUser) {
          setUser(null);
          return;
        }

        const loginType = loginMethod(firebaseUser);

        // ゲスト以外のログインの場合はユーザーデータを取得しuseContextで保持
        if (loginType === "Guest") {
          const guestData: User = {
            userId: firebaseUser.uid,
            name: "Guest Login",
            loginType: "Guest",
            isMailVerified: true,
          };
          setUser(guestData);
          return;
        }

        try {
          const userData = await fetchUserById(firebaseUser.uid);
          if (userData.userId) {
            setUser({
              ...userData,
              loginType,
              isMailVerified: firebaseUser.emailVerified,
            });
          }
        } catch (error: unknown) {
          console.error("ユーザーデータの取得に失敗しました:", error);
          const message = handleFetchUserError(error);
          showSnackBar({
            message,
            type: "warning",
          });
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

export const updateUser = (userData: User | null) => {
  if (globalSetUser) {
    globalSetUser(userData);
  } else {
    console.error("UserProviderがまだ初期化されていません");
  }
};
