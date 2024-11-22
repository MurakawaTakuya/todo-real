export interface UserData {
  uid: string;
  name: string;
  streak: number;
  loginType: LoginType;
}

export type LoginType = "Mail" | "Google" | "Guest" | "None";
