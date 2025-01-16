"use client";
import { GoalWithIdAndUserData, Post } from "@/types/types";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface ResultContextType {
  successResults: GoalWithIdAndUserData[];
  setSuccessResults: React.Dispatch<
    React.SetStateAction<GoalWithIdAndUserData[]>
  >;
  failedResults: GoalWithIdAndUserData[];
  setFailedResults: React.Dispatch<
    React.SetStateAction<GoalWithIdAndUserData[]>
  >;
  pendingResults: GoalWithIdAndUserData[];
  setPendingResults: React.Dispatch<
    React.SetStateAction<GoalWithIdAndUserData[]>
  >;
  lastPostDate: string | null;
  setLastPostDate: React.Dispatch<string | null>;
  noMorePending: boolean;
  setNoMorePending: React.Dispatch<boolean>;
  noMoreFinished: boolean;
  setNoMoreFinished: React.Dispatch<boolean>;
  pendingOffset: number;
  setPendingOffset: React.Dispatch<number>;
  finishedOffset: number;
  setFinishedOffset: React.Dispatch<number>;
}

const ResultContext = createContext<ResultContextType | undefined>(undefined);

export const ResultProvider = ({ children }: { children: ReactNode }) => {
  const [successResults, setSuccessResults] = useState<GoalWithIdAndUserData[]>(
    []
  );
  const [failedResults, setFailedResults] = useState<GoalWithIdAndUserData[]>(
    []
  );
  const [pendingResults, setPendingResults] = useState<GoalWithIdAndUserData[]>(
    []
  );
  const [lastPostDate, setLastPostDate] = useState<string | null>(null); // 投稿が0の場合はnull
  const [noMorePending, setNoMorePending] = useState<boolean>(false);
  const [noMoreFinished, setNoMoreFinished] = useState<boolean>(false);
  const [pendingOffset, setPendingOffset] = useState<number>(0);
  const [finishedOffset, setFinishedOffset] = useState<number>(0);

  return (
    <ResultContext.Provider
      value={{
        successResults,
        setSuccessResults,
        failedResults,
        setFailedResults,
        pendingResults,
        setPendingResults,
        lastPostDate,
        setLastPostDate,
        noMorePending,
        setNoMorePending,
        noMoreFinished,
        setNoMoreFinished,
        pendingOffset,
        setPendingOffset,
        finishedOffset,
        setFinishedOffset,
      }}
    >
      {children}
    </ResultContext.Provider>
  );
};

export const useResults = () => {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error("useResults must be used within a ResultProvider");
  }
  return context;
};

// 目標作成時
// pendingに追加
export const useAddGoal = () => {
  const { setPendingResults } = useResults();
  return (result: GoalWithIdAndUserData) => {
    setPendingResults((prev) => [...prev, result]);
  };
};

// 目標削除時
// pendingとsuccessから削除
export const useDeleteGoal = () => {
  const { setPendingResults, setSuccessResults } = useResults();
  return (goalId: string) => {
    setPendingResults((prev) =>
      prev.filter((result) => result.goalId !== goalId)
    );
    setSuccessResults((prev) =>
      prev.filter((result) => result.goalId !== goalId)
    );
  };
};

// 投稿作成時
// pendingから削除してsuccessに追加
export const useAddPost = () => {
  const { setPendingResults, setSuccessResults } = useResults();
  return (
    goalId: string,
    post: Omit<Post, "submittedAt"> & { submittedAt: string }
  ) => {
    let targetResult: GoalWithIdAndUserData | null = null;
    setPendingResults((prev) =>
      prev.filter((pendingResult) => {
        if (pendingResult.goalId === goalId) {
          targetResult = pendingResult; // 投稿した目標を取得
          pendingResult.post = post; // 投稿データをつけると
        }
        return true;
      })
    );
    setSuccessResults((prev) => {
      if (targetResult) {
        // 投稿した目標に対してpostデータを追加
        targetResult.post = post;
        return [
          ...prev.filter((result) => result.goalId !== goalId),
          targetResult,
        ];
      }
      return prev;
    });
  };
};

// 投稿削除時
// successのpostの項目をundefinedにして、successからpendingに移動する
export const useDeletePost = () => {
  const { setPendingResults, setSuccessResults } = useResults();
  return (goalId: string) => {
    setSuccessResults((prev) => {
      const updatedResults = prev.filter((result) => result.goalId !== goalId);
      const movedResult = prev.find((result) => result.goalId === goalId);
      if (movedResult) {
        movedResult.post = undefined;
        setPendingResults((pendingPrev) => [
          ...pendingPrev.filter((result) => result.goalId !== goalId),
          movedResult,
        ]);
      }
      return updatedResults;
    });
  };
};

// TODO: implement updateResult
