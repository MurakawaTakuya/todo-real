import { GoalWithIdAndUserData, User } from "@/types/types";
import { formatStringToDate } from "@/utils/DateFormatter";
import { getSuccessRate } from "@/utils/successRate";
import { useUser } from "@/utils/UserContext";
import AppRegistrationRoundedIcon from "@mui/icons-material/AppRegistrationRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseIcon from "@mui/icons-material/Close";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Step, { stepClasses } from "@mui/joy/Step";
import StepIndicator, { stepIndicatorClasses } from "@mui/joy/StepIndicator";
import Stepper from "@mui/joy/Stepper";
import Typography, { typographyClasses } from "@mui/joy/Typography";
import { Divider } from "@mui/material";
import { ReactNode, useState } from "react";
import DeleteGoalModal from "../DeleteGoalModal/DeleteGoalModal";
import DeletePostModal from "../DeletePostModal/DeletePostModal";
import CopyGoalAfterPostButton from "../GoalModal/CopyGoalAfterPostButton";
import CopyModalButton from "../GoalModal/CopyGoalButton";
import PostModal from "../PostModal/PostModal";

const successPostIndicatorStyle = {
  "& > div": {
    placeSelf: "start",
  },
};

const outerBorderColors = {
  success: "#008c328a",
  failed: "#a2000082",
  pending: "#0045cf80",
};

const innerBorderColors = {
  success: "#0034125e",
  failed: "#6205055c",
  pending: "#00206059",
};

interface ProgressProps {
  successResults?: GoalWithIdAndUserData[];
  failedResults?: GoalWithIdAndUserData[];
  pendingResults?: GoalWithIdAndUserData[];
  orderBy?: "asc" | "desc";
}

export default function Progress({
  successResults = [],
  failedResults = [],
  pendingResults = [],
  orderBy = "desc", // 最新が上位
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

  console.log("allResults: ", allResults);

  return (
    <>
      {allResults.map((result) => {
        if (result.type === "success") {
          return (
            <SuccessStep
              key={result.goalId}
              result={result as GoalWithIdAndUserData}
              user={user as User}
            />
          );
        } else if (result.type === "failed") {
          return (
            <FailedStep
              key={result.goalId}
              result={result as GoalWithIdAndUserData}
              user={user as User}
            />
          );
        } else if (result.type === "pending") {
          return (
            <PendingStep
              key={result.goalId}
              result={result as GoalWithIdAndUserData}
              user={user as User}
            />
          );
        }
      })}
    </>
  );
}

const SuccessStep = ({
  result,
  user,
}: {
  result: GoalWithIdAndUserData;
  user: User;
}) => {
  const post = result.post;
  if (!post) {
    return null;
  }

  return (
    <StepperBlock
      key={result.goalId}
      userData={result.userData}
      resultType="success"
    >
      <Step
        active
        completed
        indicator={
          <StepIndicator variant="solid" color="primary">
            <AppRegistrationRoundedIcon />
          </StepIndicator>
        }
      >
        <GoalCard
          deadline={result.deadline}
          goalText={result.text}
          resultType="success"
          goalId={result.goalId}
          userId={result.userId}
          user={user}
        />
      </Step>
      <Step
        completed
        sx={successPostIndicatorStyle}
        indicator={
          <StepIndicator variant="solid" color="success">
            <CheckRoundedIcon />
          </StepIndicator>
        }
      >
        <Card
          variant="outlined"
          size="sm"
          sx={{
            borderColor: innerBorderColors.success,
            width: "100%",
            padding: 0,
            gap: 0,
            zIndex: 0,
          }}
        >
          {post.storedURL && (
            <img
              src={post.storedURL}
              srcSet={post.storedURL}
              style={{
                objectFit: "contain",
                maxWidth: "100%",
                maxHeight: "50vh",
                borderRadius: "5px 5px 0 0",
              }}
              loading="lazy"
              alt=""
            />
          )}
          <CardContent
            sx={{ padding: "10px", borderTop: "thin solid #cdcdcd" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography level="body-sm">
                {formatStringToDate(post.submittedAt)}に完了
              </Typography>
              {/* 自分の作成した投稿のみ削除できるようにする */}
              {result.userId === user?.userId && (
                <DeletePostModal
                  goalId={result.goalId}
                  deadline={result.deadline}
                />
              )}
            </div>
            {post.text && (
              <>
                <Divider />
                <Typography level="title-md">{post.text}</Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Step>
    </StepperBlock>
  );
};

const FailedStep = ({
  result,
  user,
}: {
  result: GoalWithIdAndUserData;
  user: User;
}) => {
  return (
    <StepperBlock
      key={result.goalId}
      userData={result.userData}
      resultType="failed"
    >
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

const PendingStep = ({
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

const GoalCard = ({
  deadline,
  goalText,
  resultType,
  goalId = "",
  userId,
  user,
}: {
  deadline: string;
  goalText: string;
  resultType?: "success" | "failed" | "pending";
  goalId: string;
  userId: string;
  user: User;
}) => {
  const deadlineDate = new Date(deadline);
  const currentDate = new Date();
  const isWithinOneHour =
    deadlineDate.getTime() - currentDate.getTime() <= 3600000;

  return (
    <Card
      variant="outlined"
      size="sm"
      sx={{
        width: "100%",
        boxSizing: "border-box",
        borderColor:
          resultType == "success"
            ? innerBorderColors.success
            : resultType == "failed"
            ? innerBorderColors.failed
            : innerBorderColors.pending,
      }}
    >
      <CardContent>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography level="body-sm">
            {formatStringToDate(deadline)}までに
          </Typography>
          <div style={{ display: "flex", gap: "5px" }}>
            <CopyModalButton deadline={deadline} goalText={goalText} />
            {/* 期限の1時間以内、もしくは自分の目標ではない場合は削除できないようにする */}
            {!isWithinOneHour && userId === user?.userId && (
              <DeleteGoalModal goalId={goalId} />
            )}
          </div>
        </div>
        <Divider />
        <Typography level="body-lg">{goalText}</Typography>
      </CardContent>
    </Card>
  );
};

const StepperBlock = ({
  children,
  userData = null,
  resultType,
}: {
  children: ReactNode;
  userData?: User | null;
  resultType?: "success" | "failed" | "pending";
}) => {
  const successRate = userData
    ? getSuccessRate(userData.completed, userData.failed)
    : 0;

  return (
    <Card
      variant="soft"
      size="sm"
      sx={{
        width: "87%",
        margin: "10px auto",
        padding: "13px",
        borderRadius: "8px",
        border: "1px solid",
        borderColor:
          resultType == "success"
            ? outerBorderColors.success
            : resultType == "failed"
            ? outerBorderColors.failed
            : outerBorderColors.pending,
        boxShadow: "1px 1px 8px #d9d9d96b",
        gap: "6px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: "5px 20px",
        }}
      >
        <Typography level="title-lg" component="span">
          {userData?.name}
        </Typography>
        <div style={{ display: "flex", gap: "10px" }}>
          <Typography level="title-sm" component="span">
            {userData?.streak}日連続
          </Typography>
          <Typography level="title-sm" component="span">
            達成率{successRate}%
          </Typography>
          <Typography level="title-sm" component="span">
            累計{userData?.completed}回達成
          </Typography>
        </div>
      </div>
      <Divider />
      <Stepper
        orientation="vertical"
        sx={(theme) => ({
          gap: "0px",
          "--Stepper-verticalGap": "30px",
          "--StepIndicator-size": "2.5rem",
          "--Step-gap": "1rem",
          "--Step-connectorInset": "0.5rem",
          "--Step-connectorRadius": "1rem",
          "--Step-connectorThickness": "4px",
          "--joy-palette-success-solidBg": "var(--joy-palette-success-400)",
          [`& .${stepClasses.completed}`]: {
            "&::after": { bgcolor: "success.solidBg" },
          },
          // copletedとactive両方の場合
          [`& .${stepClasses.completed}.${stepClasses.active}`]: {
            [`& .${stepIndicatorClasses.root}`]: {
              border: "4px solid #fff",
              boxShadow: `0 0 0 1px ${theme.vars.palette.primary[500]}`,
            },
            "&::after": {
              bgcolor: "success.solidBg",
              marginTop: "-50px",
            },
          },
          [`& .${stepClasses.active}`]: {
            [`& .${stepIndicatorClasses.root}`]: {
              border: "4px solid #fff",
              boxShadow: `0 0 0 1px ${theme.vars.palette.primary[500]}`,
            },
          },
          [`& .${stepClasses.disabled} *`]: {
            color: "neutral.softDisabledColor",
          },
          [`& .${typographyClasses["title-sm"]}`]: {
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontSize: "10px",
          },
        })}
      >
        {children}
      </Stepper>
    </Card>
  );
};
