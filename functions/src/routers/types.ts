export interface User {
  name: string;
  streak: number;
  fcmToken?: string;
}

export interface Goal {
  userId: string;
  deadline: Date;
  text: string;
  post?: Post;
}

export interface GoalWithId extends Goal {
  goalId: string;
}

export interface GoalWithIdAndName extends Goal {
  goalId: string;
  userName: string;
}

export interface Post {
  userId: string;
  storedURL: string;
  text: string;
  submittedAt: Date;
}

export interface PostWithGoalId extends Post {
  goalId: string; // Postの所属するGoalId
}
