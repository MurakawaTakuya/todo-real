import { ReactNode } from "react";

export interface User {
  userId: string;
  name: string;
  completed?: number;
  failed?: number;
  streak?: number;
  loginType: LoginType;
  isMailVerified: boolean;
}

export type LoginType = "Mail" | "Google" | "Guest" | "None";

export interface Goal {
  userId: string;
  deadline: Date | string;
  text: string;
  post?: Omit<Post, "submittedAt"> & { submittedAt: string };
}

export interface GoalWithIdAndUserData extends Goal {
  goalId: string;
  userData: User;
  deadline: string;
}

export interface Post {
  userId: string;
  storedId: string;
  text: string;
  submittedAt: Date | string;
}

export interface PostWithGoalId extends Post {
  goalId: string;
}

export const animationTypes = [
  "left",
  "right",
  "center",
  "bottom",
  "top",
] as const;
export type AnimationType = (typeof animationTypes)[number];

export interface AnimationConfigs {
  children: ReactNode;
  duration?: number;
  delay?: number;
  distance?: number; // アニメーションの移動距離(ex. 右に100px移動しながらフェードイン)
  margin?: number; // 画面に入ってから何px超えたら表示するか
}
