import { GoalWithId, SuccessResult } from "@/types/types";
import { formatStringToDate } from "@/utils/DateFormatter";
import AppRegistrationRoundedIcon from "@mui/icons-material/AppRegistrationRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseIcon from "@mui/icons-material/Close";
import AspectRatio from "@mui/joy/AspectRatio";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CardOverflow from "@mui/joy/CardOverflow";
import Step, { stepClasses } from "@mui/joy/Step";
import StepIndicator, { stepIndicatorClasses } from "@mui/joy/StepIndicator";
import Stepper from "@mui/joy/Stepper";
import Typography, { typographyClasses } from "@mui/joy/Typography";
import { ReactNode } from "react";

interface ProgressProps {
  successResults?: SuccessResult[];
  failedResults?: GoalWithId[];
  pendingResults?: GoalWithId[];
}

export default function Progress({
  successResults,
  failedResults,
  pendingResults,
}: ProgressProps) {
  console.log("successResults:", successResults);
  console.log("failedResults:", failedResults);
  console.log("pendingResults:", pendingResults);

  return (
    <>
      {successResults && successResults.map((result) => successStep(result))}
      {failedResults && failedResults.map((result) => failedStep(result))}
      {pendingResults && pendingResults.map((result) => pendingStep(result))}
    </>
  );
}

function successStep(result: SuccessResult) {
  return (
    <StepperBlock key={result.goalId} resultType="success">
      <Step
        completed
        indicator={
          <StepIndicator variant="solid" color="success">
            <CheckRoundedIcon />
          </StepIndicator>
        }
      >
        <GoalCard deadline={result.deadline} goalText={result.goalText} />
      </Step>
      <Step
        completed
        indicator={
          <StepIndicator variant="solid" color="success">
            <CheckRoundedIcon />
          </StepIndicator>
        }
      >
        <Card variant="soft" size="sm">
          {result.storedId && (
            <CardOverflow>
              <AspectRatio ratio="2">
                <img
                  src={result.storedId}
                  srcSet={result.storedId}
                  loading="lazy"
                  alt=""
                />
              </AspectRatio>
            </CardOverflow>
          )}
          <CardContent>
            <Typography level="body-sm">
              {formatStringToDate(result.submittedAt)}
            </Typography>
            <Typography level="title-md">{result.postText}</Typography>
          </CardContent>
        </Card>
      </Step>
    </StepperBlock>
  );
}

function failedStep(result: GoalWithId) {
  return (
    <StepperBlock key={result.goalId} resultType="failed">
      <Step
        indicator={
          <StepIndicator variant="solid" color="danger">
            <CloseIcon />
          </StepIndicator>
        }
      >
        <GoalCard deadline={result.deadline} goalText={result.text} />
      </Step>
    </StepperBlock>
  );
}

function pendingStep(result: GoalWithId) {
  return (
    <StepperBlock key={result.goalId} resultType="pending">
      <Step
        active
        indicator={
          <StepIndicator variant="solid" color="primary">
            <AppRegistrationRoundedIcon />
          </StepIndicator>
        }
      >
        <GoalCard deadline={result.deadline} goalText={result.text} />
      </Step>
    </StepperBlock>
  );
}

function StepperBlock({
  children,
  resultType,
}: {
  children: ReactNode;
  resultType?: "success" | "failed" | "pending";
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        width: "88%",
        margin: "10px auto",
        borderColor:
          resultType == "success"
            ? "#00cb48"
            : resultType == "failed"
            ? "#ff3f3f"
            : "#2f74ff",
      }}
      size="sm"
    >
      <Stepper
        orientation="vertical"
        sx={(theme) => ({
          "--Stepper-verticalGap": "2.5rem",
          "--StepIndicator-size": "2.5rem",
          "--Step-gap": "1rem",
          "--Step-connectorInset": "0.5rem",
          "--Step-connectorRadius": "1rem",
          "--Step-connectorThickness": "4px",
          "--joy-palette-success-solidBg": "var(--joy-palette-success-400)",
          [`& .${stepClasses.completed}`]: {
            "&::after": { bgcolor: "success.solidBg" },
          },
          [`& .${stepClasses.active}`]: {
            [`& .${stepIndicatorClasses.root}`]: {
              border: "4px solid",
              borderColor: "#fff",
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
}

function GoalCard({
  deadline,
  goalText,
}: {
  deadline: string;
  goalText: string;
}) {
  return (
    <Card variant="soft" size="sm">
      <CardContent>
        <Typography level="body-sm">{formatStringToDate(deadline)}</Typography>
        <Typography level="body-lg">{goalText}</Typography>
      </CardContent>
    </Card>
  );
}
