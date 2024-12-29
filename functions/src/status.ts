import admin from "firebase-admin";
import { logger } from "firebase-functions";

const db = admin.firestore();

// 完了した目標をカウント(postがnullでないものをカウント)
export const countCompletedGoals = async (userId: string): Promise<number> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const countSnapshot = await db
      .collection("goal")
      .where("userId", "==", userId)
      .where("post", "!=", null)
      .count()
      .get();

    return countSnapshot.data().count;
  } catch (error) {
    logger.error("Error counting completed goals:", error);
    return 0;
  }
};

// 失敗した目標をカウント(今より前の`deadline`を持ち、postがnullの目標の数をカウント)
export const countFailedGoals = async (userId: string): Promise<number> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const now = admin.firestore.Timestamp.now();

    const countSnapshot = await db
      .collection("goal")
      .where("userId", "==", userId)
      .where("deadline", "<", now)
      .where("post", "==", null)
      .count()
      .get();

    return countSnapshot.data().count;
  } catch (error) {
    logger.error("Error counting expired goals with null post:", error);
    return 0;
  }
};

// 指定期間内で達成した目標があるかを判定 (startDate <= deadline < endDate)
export const hasCompletedGoalWithinRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<boolean> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

    const snapshot = await admin
      .firestore()
      .collection("goal")
      .where("userId", "==", userId)
      .where("post", "!=", null)
      .where("post.submittedAt", ">=", startTimestamp)
      .where("post.submittedAt", "<", endTimestamp)
      .limit(1) // データが1件でもあればOK
      .get();

    return !snapshot.empty;
  } catch (error) {
    logger.error("Error checking goals within range:", error);
    return false;
  }
};

// 昨日達成した目標があるかを判定
export const hasCompletedYesterdayGoal = async (
  userId: string
): Promise<boolean> => {
  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  return await hasCompletedGoalWithinRange(
    userId,
    startOfYesterday,
    startOfToday
  );
};

// 今日達成した目標があるかを判定
export const hasCompletedTodayGoal = async (
  userId: string
): Promise<boolean> => {
  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);

  return await hasCompletedGoalWithinRange(userId, startOfToday, endOfToday);
};

export const updateStreak = async (userId: string): Promise<void> => {
  const userRef = db.collection("user").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  if (!userData) {
    throw new Error("User data not found");
  }

  let streak = userData.streak;

  // 昨日で途切れている場合は1にリセット(今日既に達成していても1なので問題ない)
  if (!(await hasCompletedYesterdayGoal(userId))) {
    streak = 1;
  }

  // 今日まだ完了していない場合は+1
  if (
    (await hasCompletedYesterdayGoal(userId)) &&
    !(await hasCompletedTodayGoal(userId))
  ) {
    streak++;
  }

  await userRef.update({ streak });
};

export const getStreak = async (userId: string): Promise<number> => {
  const userDoc = await db.collection("user").doc(userId).get();
  const userData = userDoc.data();

  if (!userData) {
    return 0;
  }

  const streak = userData.streak;
  // 連続達成が途切れている場合は0を返す(今日達成している場合は除く)
  if (
    !(await hasCompletedYesterdayGoal(userId)) &&
    (streak > 1 || (streak == 1 && !(await hasCompletedTodayGoal(userId))))
  ) {
    return 0;
  }
  return streak;
};
