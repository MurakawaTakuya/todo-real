import { GoalWithIdAndUserData, User } from "@/types/types";
import { useUser } from "@/utils/UserContext";
import { FailedStep } from "./FailedStep";
import { PendingStep } from "./PendingStep";
import { SuccessStep } from "./SuccessStep";

interface ProgressProps {
  successResults?: GoalWithIdAndUserData[];
  failedResults?: GoalWithIdAndUserData[];
  pendingResults?: GoalWithIdAndUserData[];
  orderBy?: "asc" | "desc";
  lastPostDate: string | null; // 投稿が0の場合はnull
}

export default function Progress({
  successResults = [],
  failedResults = [],
  pendingResults = [],
  orderBy = "desc", // 最新が上位
  lastPostDate,
}: ProgressProps) {
  const { user } = useUser();

  const allResults = [
    ...successResults.map((result) => ({ ...result, type: "success" })),
    ...failedResults.map((result) => ({ ...result, type: "failed" })),
    ...pendingResults.map((result) => ({ ...result, type: "pending" })),
  ];

  // typeがsuccessの場合はsubmittedAtでソートし、それ以外の場合はdeadlineでソートする
  allResults.sort((a, b) => {
    const getUpdatedTime = (item: typeof a) => {
      if (item.type === "success" && "post" in item) {
        return item.post?.submittedAt
          ? new Date(item.post.submittedAt).getTime()
          : 0;
      }
      return new Date(item.deadline).getTime();
    };
    return orderBy === "desc"
      ? getUpdatedTime(b) - getUpdatedTime(a) // 最新が上位
      : getUpdatedTime(a) - getUpdatedTime(b); // 最古が上位
  });

  return (
    <>
      {allResults.map((result) => {
        if (result.type === "success") {
          return (
            <SuccessStep
              key={result.goalId}
              result={result}
              user={user as User}
              isBlured={
                result.post?.submittedAt && lastPostDate
                  ? new Date(result.post.submittedAt) > new Date(lastPostDate)
                  : user?.loginType === "Guest" // ゲストユーザーは特別にモザイクを解除
                  ? false
                  : true
              }
            />
          );
        } else if (result.type === "failed") {
          return (
            <FailedStep
              key={result.goalId}
              result={result}
              user={user as User}
            />
          );
        } else if (result.type === "pending") {
          return (
            <PendingStep
              key={result.goalId}
              result={result}
              user={user as User}
            />
          );
        }
      })}
    </>
  );
}
