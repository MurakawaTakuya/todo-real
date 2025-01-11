import { GoalWithIdAndUserData, User } from "@/types/types";
import AppRegistrationRoundedIcon from "@mui/icons-material/AppRegistrationRounded";
import Step from "@mui/joy/Step";
import StepIndicator from "@mui/joy/StepIndicator";
import { useState } from "react";
import CopyGoalAfterPostButton from "../GoalModal/CopyGoalAfterPostButton";
import PostModal from "../PostModal/PostModal";
import { GoalCard } from "./GoalCard";
import { StepperBlock } from "./StepperBlock";

export const PendingStep = ({
  result,
  user,
}: {
  result: GoalWithIdAndUserData;
  user: User;
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <StepperBlock
      key={result.goalId}
      userData={result.userData}
      resultType="pending"
    >
      <Step
        active
        indicator={
          <StepIndicator variant="solid" color="primary">
            <AppRegistrationRoundedIcon />
          </StepIndicator>
        }
      >
        <GoalCard
          deadline={result.deadline}
          goalText={result.text}
          resultType="pending"
          goalId={result.goalId}
          userId={result.userId}
          user={user}
        />

        {isSubmitted ? (
          // 投稿したら同じ目標で明日にも作成できるボタンを表示する
          <CopyGoalAfterPostButton
            goalText={result.text}
            deadline={result.deadline}
          />
        ) : (
          // 自分の作成した目標の場合のみ投稿可能にする
          result.userId === user?.userId && (
            <PostModal goalId={result.goalId} setIsSubmitted={setIsSubmitted} />
          )
        )}
      </Step>
    </StepperBlock>
  );
};
