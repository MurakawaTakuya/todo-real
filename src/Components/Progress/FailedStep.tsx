import { GoalWithIdAndUserData, User } from "@/types/types";
import CloseIcon from "@mui/icons-material/Close";
import Step from "@mui/joy/Step";
import StepIndicator from "@mui/joy/StepIndicator";
import { GoalCard } from "./GoalCard";
import { StepperBlock } from "./StepperBlock";

export const FailedStep = ({
  result,
  user,
}: {
  result: GoalWithIdAndUserData;
  user: User;
}) => {
  return (
    <StepperBlock key={result.goalId} result={result} resultType="failed">
      <Step
        indicator={
          <StepIndicator variant="solid" color="danger">
            <CloseIcon />
          </StepIndicator>
        }
      >
        <GoalCard
          deadline={result.deadline}
          goalText={result.text}
          resultType="failed"
          goalId={result.goalId}
          userId={result.userId}
          user={user}
        />
      </Step>
    </StepperBlock>
  );
};
