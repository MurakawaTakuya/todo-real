"use client";
import { functionsEndpoint } from "@/app/firebase";
import { GoalWithId, SuccessResult } from "@/types/types";
import { useEffect, useState } from "react";
import Progress from "../Progress/Progress";
import styles from "./DashBoard.module.scss";

// 投稿を取得してPostCardに渡す
export default function DashBoard() {
  const [successResults, setSuccessResults] = useState<SuccessResult[]>([]);
  const [failedResults, setFailedResults] = useState<GoalWithId[]>([]);
  const [pendingResults, setPendingResults] = useState<GoalWithId[]>([]); // テスト用
  const [noResult, setNoResult] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${functionsEndpoint}/result/?onlyPast`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
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
          setPendingResults(data.pendingResults); // テスト用
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
            pendingResults={pendingResults}
          />
        </div>
      )}
    </>
  );
}
