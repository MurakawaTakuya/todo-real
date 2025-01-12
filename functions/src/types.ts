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
  reaction: Reaction | null;
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
  storedId: string;
  text: string;
  submittedAt: Date;
}

export interface PostWithGoalId extends Post {
  goalId: string; // Postの所属するGoalId
}

export interface Reaction {
  userId: string;
  reactionType: ReactionType["success"] | ReactionType["failed"];
}

export interface ReactionType {
  success: "laugh" | "surprised" | "clap";
  failed: "sad" | "angry" | "muscle";
}

export const ReactionTypeMap = {
  success: ["laugh", "surprised", "clap"] as const,
  failed: ["sad", "angry", "muscle"] as const,
};
