"use client";
import { GoalWithId, SuccessResult } from "@/types/types";
import { fetchResult } from "@/utils/API/fetchResult";
import { useEffect, useState } from "react";
import Progress from "../Progress/Progress";
import styles from "./DashBoard.module.scss";

// 投稿を取得してPostCardに渡す
export default function DashBoard({
  userId = "",
  success = true,
  failed = true,
  pending = true,
}: {
  userId?: string;
  success?: boolean;
  failed?: boolean;
  pending?: boolean;
} = {}) {
  const [successResults, setSuccessResults] = useState<SuccessResult[]>([]);
  const [failedResults, setFailedResults] = useState<GoalWithId[]>([]);
  const [pendingResults, setPendingResults] = useState<GoalWithId[]>([]);
  const [noResult, setNoResult] = useState<boolean>(false);

  console.log(success, failed, pending);

  useEffect(() => {
    fetchResult({ userId })
      .then((data) => {
        console.log(data);
        if (
          data.successResults.length === 0 &&
          data.failedResults.length === 0 &&
          data.pendingResults.length === 0
        ) {
          setNoResult(true);
        }
        setSuccessResults(data.successResults);
        setFailedResults(data.failedResults);
        setPendingResults(data.pendingResults);
      })
      .catch((error) => {
        if (error instanceof Response && error.status === 404) {
          setNoResult(true);
        } else {
          console.error("Error fetching posts:", error);
        }
      });
  }, []);

  return (
    <>
      {noResult ? (
        <p>目標や投稿が見つかりませんでした</p>
      ) : (
        <div className={styles.postsContainer}>
          <Progress
            successResults={success ? successResults : []}
            failedResults={failed ? failedResults : []}
            pendingResults={pending ? pendingResults : []}
          />
        </div>
      )}
    </>
  );
}
