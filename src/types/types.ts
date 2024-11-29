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
  submittedAt: Date; // TODO: dateじゃない
}

export interface Goal {
  userId: string;
  deadline: Date;
  text: string;
}
