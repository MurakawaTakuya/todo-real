"use client";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { GoalWithIdAndUserData } from "@/types/types";
import {
  fetchResult,
  handleFetchResultError,
} from "@/utils/API/Result/fetchResult";
import Typography from "@mui/joy/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { useEffect, useState } from "react";
import Progress from "../Progress/Progress";
import styles from "./DashBoard.module.scss";

// 投稿を取得してProgress
export default function DashBoard({
  userId = "",
  success = true,
  failed = true,
  pending = true,
  orderBy,
}: {
  userId?: string;
  success?: boolean;
  failed?: boolean;
  pending?: boolean;
  orderBy?: "asc" | "desc";
} = {}) {
  const [successResults, setSuccessResults] = useState<GoalWithIdAndUserData[]>(
    []
  );
  const [failedResults, setFailedResults] = useState<GoalWithIdAndUserData[]>(
    []
  );
  const [pendingResults, setPendingResults] = useState<GoalWithIdAndUserData[]>(
    []
  );
  const [noResult, setNoResult] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchResult({ userId, success, failed, pending })
      .then((data) => {
        setSuccessResults(data.successResults);
        setFailedResults(data.failedResults);
        setPendingResults(data.pendingResults);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching results:", error);
        setIsLoading(false);
        const message = handleFetchResultError(error);
        showSnackBar({
          message,
          type: "warning",
        });
      });
  }, [userId, success, failed, pending]);

  useEffect(() => {
    // 表示したい項目にデータがない場合はnoResultをtrueにする
    setNoResult(
      ((success && successResults.length === 0) || !success) &&
        ((failed && failedResults.length === 0) || !failed) &&
        ((pending && pendingResults.length === 0) || !pending)
    );
  }, [success, failed, pending, successResults, failedResults, pendingResults]);

  return (
    <>
      {isLoading ? (
        <LinearProgress
          sx={{
            width: "90%",
            margin: "35vh auto 0",
            backgroundColor: "rgb(213 237 255) !important",
          }}
        />
      ) : noResult ? (
        <Typography level="h4" sx={{ textAlign: "center", marginTop: "20px" }}>
          +ボタンから目標を作成しましょう!
        </Typography>
      ) : (
        <div className={styles.postsContainer}>
          <Progress
            successResults={success ? successResults : []}
            failedResults={failed ? failedResults : []}
            pendingResults={pending ? pendingResults : []}
            orderBy={orderBy}
          />
        </div>
      )}
    </>
  );
}
