import { GoalWithId, SuccessResult, UserData } from "@/types/types";
import { fetchUserById } from "@/utils/API/fetchUser";
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
        if (result.type === "success") {
          return successStep(result as SuccessResult, userName);
        }
        if (result.type === "failed") {
          return failedStep(result as GoalWithId, userName);
        }
        if (result.type === "pending") {
          return pendingStep(result as GoalWithId, userName, user as UserData);
        }
        return null;
      })}
    </>
  );
}

const successStep = (result: SuccessResult, userName: string) => {
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
            <Typography level="body-sm">
              {formatStringToDate(result.submittedAt)}に完了
            </Typography>
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

const failedStep = (result: GoalWithId, userName: string) => {
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
        />
      </Step>
    </StepperBlock>
  );
};

const pendingStep = (result: GoalWithId, userName: string, user: UserData) => {
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
        />
        {/* 自分の作成した目標の場合のみ投稿可能にする */}
        {result.userId === user?.userId && <PostModal goalId={result.goalId} />}
      </Step>
    </StepperBlock>
  );
};

const GoalCard = ({
  deadline,
  goalText,
  resultType,
}: {
  deadline: string;
  goalText: string;
  resultType?: "success" | "failed" | "pending";
}) => {
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
        <Typography level="body-sm">
          {formatStringToDate(deadline)}までに
        </Typography>
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
