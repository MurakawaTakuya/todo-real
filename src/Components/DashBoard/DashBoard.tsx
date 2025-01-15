"use client";
import { showSnackBar } from "@/Components/SnackBar/SnackBar";
import { GoalWithIdAndUserData } from "@/types/types";
import {
  fetchResult,
  handleFetchResultError,
} from "@/utils/API/Result/fetchResult";
import { useResults } from "@/utils/ResultContext";
import { useUser } from "@/utils/UserContext";
import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { useEffect, useRef, useState } from "react";
import CenterIn from "../Animation/CenterIn";
import Progress from "../Progress/Progress";
import styles from "./DashBoard.module.scss";

// eslint-disable-next-line @typescript-eslint/no-empty-function
let rerenderDashBoard: () => void = () => {};

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
}) {
  const {
    successResults,
    setSuccessResults,
    failedResults,
    setFailedResults,
    pendingResults,
    setPendingResults,
  } = useResults();
  const [noResult, setNoResult] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reachedBottom, setReachedBottom] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAlreadyFetching = useRef(false);
  const [noMorePending, setNoMorePending] = useState<boolean>(false);
  const [noMoreFinished, setNoMoreFinished] = useState<boolean>(false);

  const [lastPostDate, setLastPostDate] = useState<string | null>(null); // 投稿が0の場合はnull

  const { user } = useUser();
  const myUserId = user?.userId;

  const limit = 10; // limitずつ表示

  const fetchData = () => {
    if ((pending && noMorePending) || (success && failed && noMoreFinished)) {
      return; // TODO: うまく動作していない
    }
    if (isAlreadyFetching.current) {
      return;
    } else {
      isAlreadyFetching.current = true;
    }
    if (reachedBottom && !isLoadingMore) {
      setIsLoadingMore(true);
    }
    const offset = pending
      ? pendingResults.length
      : successResults.length + failedResults.length;
    fetchResult({
      userId,
      success,
      failed,
      pending,
      offset,
      limit,
    })
      .then((data) => {
        // 既に追加されている場合は追加しない
        setSuccessResults((prev) => {
          const newResults = data.successResults.filter(
            (result: GoalWithIdAndUserData) =>
              !prev.some((item) => item.goalId === result.goalId)
          );
          return [...prev, ...newResults];
        });
        setFailedResults((prev) => {
          const newResults = data.failedResults.filter(
            (result: GoalWithIdAndUserData) =>
              !prev.some((item) => item.goalId === result.goalId)
          );
          return [...prev, ...newResults];
        });
        setPendingResults((prev) => {
          const newResults = data.pendingResults.filter(
            (result: GoalWithIdAndUserData) =>
              !prev.some((item) => item.goalId === result.goalId)
          );
          return [...prev, ...newResults];
        });

        if (pending && data.pendingResults.length < limit) {
          setNoMorePending(true);
        }

        if (
          success &&
          failed &&
          data.successResults.length + data.failedResults.length < limit
        ) {
          setNoMoreFinished(true);
        }

        setIsLoading(false);
        setReachedBottom(false);
        isAlreadyFetching.current = false;
        setIsLoadingMore(false);
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
  };

  // 画面下に到達したことを検知
  useEffect(() => {
    setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !isLoading &&
            ((pending && !noMorePending) ||
              (success && failed && !noMoreFinished))
          ) {
            setReachedBottom(true);
            fetchData();
          }
        },
        { threshold: 1 }
      );

      if (bottomRef.current) {
        observer.observe(bottomRef.current);
      }

      return () => {
        if (bottomRef.current) {
          observer.disconnect();
        }
      };
    }, 1000);
  }, [isLoading, noMorePending, noMoreFinished, bottomRef.current, bottomRef]);

  useEffect(() => {
    rerenderDashBoard = fetchData;
    if (userId) {
      fetchData();
    }
  }, [userId, success, failed, pending]);

  useEffect(() => {
    setNoResult(
      ((success && successResults.length === 0) || !success) &&
        ((failed && failedResults.length === 0) || !failed) &&
        ((pending && pendingResults.length === 0) || !pending)
    );
  }, [success, failed, pending, successResults, failedResults, pendingResults]);

  useEffect(() => {
    if (user?.loginType === "Guest") {
      return;
    }

    if (success && myUserId) {
      // 最後に成功した目標を取得
      fetchResult({
        userId: myUserId,
        success,
        failed: false,
        pending: false,
        offset: 0,
        limit: 1,
      })
        .then((data) => {
          if (data.successResults.length > 0) {
            setLastPostDate(data.successResults[0].post?.submittedAt);
          }
        })
        .catch((error) => {
          console.error("Error fetching last post date:", error);
        });
    }
  }, [success]);

  return (
    <>
      {isLoading ? (
        // ロード中
        <LinearProgress
          sx={{
            width: "90%",
            margin: "35vh auto 0",
            backgroundColor: "rgb(213 237 255) !important",
          }}
        />
      ) : noResult ? (
        // 目標や投稿が無い場合
        <CenterIn delay={1}>
          <Typography
            level="h4"
            sx={{ textAlign: "center", marginTop: "20px" }}
          >
            +ボタンから目標を作成しましょう!
          </Typography>
        </CenterIn>
      ) : (
        <div className={styles.postsContainer}>
          <Progress
            successResults={success ? successResults : []}
            failedResults={failed ? failedResults : []}
            pendingResults={pending ? pendingResults : []}
            orderBy={orderBy}
            lastPostDate={lastPostDate}
          />
          <div className="bottom" ref={bottomRef}></div>

          {/* 下に到達した時に続きを表示 */}
          {((pending && !noMorePending) ||
            (success && failed && !noMoreFinished)) &&
            (reachedBottom ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <CircularProgress
                  color="primary"
                  variant="soft"
                  size="lg"
                  value={30}
                />
              </div>
            ) : (
              <Typography
                level="body-md"
                color="primary"
                textAlign="center"
                sx={{ fontWeight: 700 }}
              >
                スクロールしてもっと表示
              </Typography>
            ))}
        </div>
      )}
    </>
  );
}

export function triggerDashBoardRerender() {
  rerenderDashBoard();
}
