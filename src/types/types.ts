export interface UserData {
  uid: string;
  name: string;
  streak: number;
  loginType: LoginType;
}

export type LoginType = "Mail" | "Google" | "Guest" | "None";

export interface Post {
  userId: string;
  storedId: string;
  text: string;
  goalId: string;
  submittedAt: Date;
}

export interface Goal {
  userId: string;
  deadline: Date;
  text: string;
}

export interface GoalWithId extends Goal {
  goalId: string;
}

export interface SuccessResult {
  userId: string;
  goalId: string;
  postId: string;
  goalText: string;
  postText: string;
  storedId: string;
  deadline: Date;
  submittedAt: Date;
}
