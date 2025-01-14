import { GoalWithIdAndUserData } from "@/types/types";
import { getSuccessRate } from "@/utils/successRate";
import { Divider } from "@mui/joy";
import Card from "@mui/joy/Card";
import { stepClasses } from "@mui/joy/Step";
import { stepIndicatorClasses } from "@mui/joy/StepIndicator";
import Stepper from "@mui/joy/Stepper";
import Typography, { typographyClasses } from "@mui/joy/Typography";
import { ReactNode } from "react";
import CenterIn from "../Animation/CenterIn";
import { Reaction } from "./Reaction";

const outerBorderColors = {
  success: "#008c328a",
  failed: "#a2000082",
  pending: "#0045cf80",
};

export const StepperBlock = ({
  children,
  resultType,
  result,
}: {
  children: ReactNode;
  resultType?: "success" | "failed" | "pending";
  result: GoalWithIdAndUserData;
}) => {
  const userData = result.userData;

  const successRate = userData
    ? getSuccessRate(userData.completed, userData.failed)
    : 0;

  return (
    <CenterIn duration={0.3}>
      <Card
        variant="soft"
        size="sm"
        sx={{
          width: "87%",
          margin: "10px auto",
          padding: "10px 13px",
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
          <Typography
            level="title-lg"
            component="span"
            sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
          >
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
            // completedとactive両方の場合
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

        <Reaction resultType={resultType} result={result} />
      </Card>
    </CenterIn>
  );
};
