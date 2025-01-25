import {
  GoalWithIdAndUserData,
  ReactionType,
  ReactionTypeMap,
} from "@/types/types";
import { updateReaction } from "@/utils/API/Reaction/updateReaction";
import { useUser } from "@/utils/UserContext";
import { Fade, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { showSnackBar } from "../SnackBar/SnackBar";

export interface reactionValue {
  icon: string;
  count?: number;
}

const validReactionTypes = [
  ...Object.keys(ReactionType.success),
  ...Object.keys(ReactionType.failed),
];

export const Reaction = ({
  resultType,
  result,
}: {
  resultType?: "success" | "failed" | "pending";
  result: GoalWithIdAndUserData;
}) => {
  const goalId = result.goalId;

  const { user } = useUser();

  const [isReacted, setIsReacted] = useState(""); // 値はリアクションの種類
  const [isOnceClicked, setIsOnceClicked] = useState(true);
  const [reactionList, setReactionList] = useState<
    Record<string, reactionValue>
  >({}); // <リアクションの種類, リアクションのアイコンとカウント>

  useEffect(() => {
    // 絵文字の種類を定義
    let emojiList: Record<string, string> = {};
    if (resultType === "success") {
      emojiList = ReactionType.success;
      const updatedReactionList = Object.keys(emojiList).reduce(
        (acc: Record<string, reactionValue>, key) => {
          acc[key] = { icon: emojiList[key], count: 0 };
          return acc;
        },
        {} as Record<string, reactionValue>
      );
      setReactionList(updatedReactionList);
    } else if (resultType === "failed") {
      emojiList = ReactionType.failed;
      const updatedReactionList = Object.keys(emojiList).reduce(
        (acc: Record<string, reactionValue>, key) => {
          acc[key] = { icon: emojiList[key], count: 0 };
          return acc;
        },
        {} as Record<string, reactionValue>
      );
      setReactionList(updatedReactionList);
    }

    setTimeout(() => {
      setIsOnceClicked(false);
    }, 1000);
  }, [resultType]);

  useEffect(() => {
    // リアクションのカウントを更新
    if (result.reaction) {
      Object.entries(result.reaction).forEach(([userId, reactionType]) => {
        if (!validReactionTypes.includes(reactionType)) {
          return;
        }

        if (reactionList[reactionType] === undefined) {
          // successやfailedで別のリアクションが押されている場合
          return;
        }

        if (reactionList[reactionType].count === undefined) {
          // 初期化失敗
          return;
        }

        reactionList[reactionType].count += 1;
        if (user?.userId === userId) {
          setIsReacted(reactionType);
          setIsOnceClicked(true);
        }
      });
    }
  }, [reactionList]);

  const handleReaction = (type: string) => {
    if (user?.loginType === "Guest" || !user?.isMailVerified) {
      return;
    }

    // typeがReactionTypeに含まれない場合
    if (!validReactionTypes.includes(type)) {
      showSnackBar({
        message: "リアクションに失敗しました。",
        type: "warning",
      });
      return;
    }

    setIsOnceClicked(true);

    const updatedReactionList = { ...reactionList };
    if (updatedReactionList[type].count === undefined) {
      return;
    }

    try {
      if (isReacted === type) {
        // 既に同じものが押されている場合(リアクションを削除)
        updateReaction(user.userId, goalId, "");
        updatedReactionList[type].count -= 1;
        setIsReacted("");
      } else {
        // 押されていない場合(リアクションを追加もしくは変更)
        updateReaction(user.userId, goalId, type as ReactionTypeMap);
        updatedReactionList[type].count += 1; // 新しいリアクションを追加
        if (isReacted && updatedReactionList[isReacted].count) {
          updatedReactionList[isReacted].count -= 1; // 古いリアクションを削除
        }
        setIsReacted(type);
      }
    } catch {
      showSnackBar({
        message: "リアクションに失敗しました。",
        type: "warning",
      });
    }
  };

  return (
    <>
      {(resultType === "success" || resultType === "failed") && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            margin: "5px 8px 3px",
          }}
        >
          <Tooltip
            title={
              user?.loginType === "Guest"
                ? "ログインしてリアクションしよう!"
                : !user?.isMailVerified
                ? "メール認証してリアクションしよう!"
                : resultType === "success"
                ? "Nice!"
                : "応援しよう!"
            }
            slots={{
              transition: Fade,
            }}
            slotProps={{
              transition: { timeout: 400 },
            }}
            placement="left"
            arrow
            open={!isOnceClicked && !isReacted}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {Object.entries(reactionList).map(([key, reaction]) => (
                <React.Fragment key={key}>
                  <button
                    key={key}
                    style={{
                      minWidth: "0",
                      padding: "0",
                      margin: "0 5px",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      fontSize: "28px",
                      lineHeight: "1",
                      transition: "0.3s",
                      filter: `grayscale(${isReacted === key ? 0 : 100}%)`,
                      opacity: isReacted === key ? 1 : 0.5,
                    }}
                    onClick={() => handleReaction(key)}
                  >
                    <motion.div whileTap={{ scale: 0.4 }}>
                      {reaction.icon}
                    </motion.div>
                  </button>
                  <span>{reaction.count}</span>
                </React.Fragment>
              ))}
            </div>
          </Tooltip>
        </div>
      )}
    </>
  );
};
