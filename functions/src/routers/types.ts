export interface User {
  name: string;
  streak: number;
  fcmToken?: string;
}

export interface Goal {
  userId: string;
  deadline: Date;
  text: string;
}

export interface GoalWithId extends Goal {
  goalId: string;
}

export interface Post {
  userId: string;
  storedId: string;
  text: string;
  goalId: string;
  submittedAt: Date;
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
