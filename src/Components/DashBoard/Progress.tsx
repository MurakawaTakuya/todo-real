import { GoalWithId, SuccessResult } from "@/types/types";
import { formatStringToDate } from "@/utils/DateFormatter";
import AppRegistrationRoundedIcon from "@mui/icons-material/AppRegistrationRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseIcon from "@mui/icons-material/Close";
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
    <StepperBlock key={result.goalId}>
      <Step
        completed
        indicator={
          <StepIndicator variant="solid" color="success">
            <CheckRoundedIcon />
          </StepIndicator>
        }
      >
        <div>
          <Typography level="title-sm">
            {formatStringToDate(result.deadline)}
          </Typography>
          {result.goalText}
        </div>
      </Step>
      <Step
        completed
        indicator={
          <StepIndicator variant="solid" color="success">
            <CheckRoundedIcon />
          </StepIndicator>
        }
      >
        <div>
          <Typography level="title-sm">
            {formatStringToDate(result.submittedAt)}
          </Typography>
          <img
            src={result.storedId}
            alt="Success Result"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </Step>
    </StepperBlock>
  );
}

function failedStep(result: GoalWithId) {
  return (
    <StepperBlock key={result.goalId}>
      <Step
        indicator={
          <StepIndicator variant="solid" color="danger">
            <CloseIcon />
          </StepIndicator>
        }
      >
        <div>
          <Typography level="title-sm">
            {formatStringToDate(result.deadline)}
          </Typography>
          {result.text}
        </div>
      </Step>
    </StepperBlock>
  );
}

function pendingStep(result: GoalWithId) {
  return (
    <StepperBlock key={result.goalId}>
      <Step
        active
        indicator={
          <StepIndicator variant="solid" color="primary">
            <AppRegistrationRoundedIcon />
          </StepIndicator>
        }
      >
        <div>
          <Typography level="title-sm">
            {formatStringToDate(result.deadline)}
          </Typography>
          {result.text}
        </div>
      </Step>
    </StepperBlock>
  );
}

function StepperBlock({ children }: { children: ReactNode }) {
  return (
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
  );
}
