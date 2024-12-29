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
