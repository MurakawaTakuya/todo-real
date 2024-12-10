export interface UserData {
  uid: string;
  name: string;
  streak: number;
  loginType: LoginType;
  isMailVerified: boolean;
}

export type LoginType = "Mail" | "Google" | "Guest" | "None";

export interface Post {
  userId: string;
  storedId: string;
  text: string;
  goalId: string;
  submittedAt: Date | string;
}

export interface Goal {
  userId: string;
  deadline: Date | string;
  text: string;
}

export interface GoalWithId extends Goal {
  goalId: string;
  deadline: string;
}

export interface SuccessResult {
  userId: string;
  goalId: string;
  postId: string;
  goalText: string;
  postText: string;
  storedId: string;
  deadline: string;
  submittedAt: string;
  // dealineとsubmittedAtはAPIから取得するとString型になる
  // Date型で使用したい場合はsrc\utils\DateFormatter.tsで変換
}
