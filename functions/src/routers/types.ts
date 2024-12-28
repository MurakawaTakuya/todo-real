export interface User {
  name: string;
  completed?: number;
  failed?: number;
  streak?: number;
  fcmToken?: string;
}

export interface Goal {
  userId: string;
  deadline: Date;
  text: string;
  post: Post | null;
}

export interface GoalWithId extends Goal {
  goalId: string;
}

export interface GoalWithIdAndUserData extends Goal {
  goalId: string;
  userData?: User;
}

export interface Post {
  userId?: string;
  storedURL: string;
  text: string;
  submittedAt: Date;
}

export interface PostWithGoalId extends Post {
  goalId: string; // Postの所属するGoalId
}
