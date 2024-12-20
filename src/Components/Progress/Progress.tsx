import { GoalWithId, SuccessResult, UserData } from "@/types/types";
import { fetchUserById } from "@/utils/API/User/fetchUser";
import { formatStringToDate } from "@/utils/DateFormatter";
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
import { ReactNode, useEffect, useState } from "react";
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
  successResults?: SuccessResult[];
  failedResults?: GoalWithId[];
  pendingResults?: GoalWithId[];
  orderBy?: "asc" | "desc";
}

export default function Progress({
  successResults = [],
  failedResults = [],
  pendingResults = [],
  orderBy = "desc", // 最新が上位
}: ProgressProps) {
  const [userNames, setUserNames] = useState<Record<string, string>>({}); // <userId, userName>
  const { user } = useUser();

  const fetchUserName = async (userId: string) => {
    if (userNames[userId]) return; // 既に取得済みの場合はキャッシュのように再利用
    setUserNames((prev) => ({ ...prev, [userId]: "Loading..." }));
    try {
      const userData = await fetchUserById(userId);
      setUserNames((prev) => ({ ...prev, [userId]: userData.name }));
    } catch (error) {
      console.error("Failed to fetch user name:", error);
      setUserNames((prev) => ({ ...prev, [userId]: "Unknown user" }));
    }
  };

  useEffect(() => {
    const allUserIds = [
      ...successResults.map((result) => result.userId),
      ...failedResults.map((result) => result.userId),
      ...pendingResults.map((result) => result.userId),
    ];
    // 同じuserIdに対して1回だけ取得し、キャッシュする
    const uniqueUserIds = Array.from(new Set(allUserIds));
    uniqueUserIds.forEach((userId) => fetchUserName(userId));
  }, [successResults, failedResults, pendingResults, fetchUserName]);

  const allResults = [
    ...successResults.map((result) => ({ ...result, type: "success" })),
    ...failedResults.map((result) => ({ ...result, type: "failed" })),
    ...pendingResults.map((result) => ({ ...result, type: "pending" })),
  ];

  // typeがsuccessの場合はsubmittedAtでソートし、それ以外の場合はdeadlineでソートする
  allResults.sort((a, b) => {
    const getUpdatedTime = (item: typeof a) => {
      if (item.type === "success" && "submittedAt" in item) {
        return new Date(item.submittedAt).getTime();
      }
      return new Date(item.deadline).getTime();
    };
    return orderBy === "desc"
      ? getUpdatedTime(b) - getUpdatedTime(a) // 最新が上位
      : getUpdatedTime(a) - getUpdatedTime(b); // 最古が上位
  });

  return (
    <>
      {allResults.map((result) => {
        const userName = userNames[result.userId] || "Loading...";

        if (!user) {
          return null;
        }

        if (result.type === "success") {
          return (
            <SuccessStep
              key={result.goalId}
              result={result as SuccessResult}
              userName={userName}
              user={user}
            />
          );
        }
        if (result.type === "failed") {
          return (
            <FailedStep
              key={result.goalId}
              result={result as GoalWithId}
              userName={userName}
              user={user as UserData}
            />
          );
        }
        if (result.type === "pending") {
          return (
            <PendingStep
              key={result.goalId}
              result={result as GoalWithId}
              userName={userName}
              user={user as UserData}
            />
          );
        }
        return null;
      })}
    </>
  );
}

const SuccessStep = ({
  result,
  userName,
  user,
}: {
  result: SuccessResult;
  userName: string;
  user: UserData;
}) => {
  return (
    <StepperBlock key={result.goalId} userName={userName} resultType="success">
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
          goalText={result.goalText}
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
          {result.storedId && (
            <img
              src={result.storedId}
              srcSet={result.storedId}
              style={{
                objectFit: "contain",
                maxWidth: "100%",
                maxHeight: "70vh",
                borderRadius: "6px 6px 0 0",
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
                {formatStringToDate(result.submittedAt)}に完了
              </Typography>
              {/* 自分の作成した投稿のみ削除できるようにする */}
              {result.userId === user?.userId && (
                <DeletePostModal
                  postId={result.postId}
                  deadline={result.deadline}
                />
              )}
            </div>
            {result.postText && (
              <>
                <Divider />
                <Typography level="title-md">{result.postText}</Typography>
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
  userName,
  user,
}: {
  result: GoalWithId;
  userName: string;
  user: UserData;
}) => {
  return (
    <StepperBlock key={result.goalId} userName={userName} resultType="failed">
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
  userName,
  user,
}: {
  result: GoalWithId;
  userName: string;
  user: UserData;
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <StepperBlock key={result.goalId} userName={userName} resultType="pending">
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
  user: UserData;
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
        width: "93%",
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
  userName = "Unknown user",
  resultType,
}: {
  children: ReactNode;
  userName: string;
  resultType?: "success" | "failed" | "pending";
}) => {
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
      <Typography level="title-lg">{userName}</Typography>
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
