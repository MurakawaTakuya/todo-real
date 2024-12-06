"use client";
import { GoalWithId, SuccessResult } from "@/types/types";
import { fetchResult } from "@/utils/API/fetchResult";
import { useEffect, useState } from "react";
import Progress from "../Progress/Progress";
import styles from "./DashBoard.module.scss";

// 投稿を取得してPostCardに渡す
export default function DashBoard() {
  const [successResults, setSuccessResults] = useState<SuccessResult[]>([]);
  const [failedResults, setFailedResults] = useState<GoalWithId[]>([]);
  const [noResult, setNoResult] = useState<boolean>(false);

  useEffect(() => {
    fetchResult()
      .then((data) => {
        if (
          data.successResults.length === 0 &&
          data.failedResults.length === 0
        ) {
          setNoResult(true);
        } else {
          console.log(data);
          setSuccessResults(data.successResults);
          setFailedResults(data.failedResults);
        }
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
            successResults={successResults}
            failedResults={failedResults}
          />
        </div>
      )}
    </>
  );
}
