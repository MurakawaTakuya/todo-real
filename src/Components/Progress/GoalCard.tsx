import { User } from "@/types/types";
import { formatStringToDate } from "@/utils/DateFormatter";
import { Divider } from "@mui/joy";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import DeleteGoalModal from "../DeleteGoalModal/DeleteGoalModal";
import CopyModalButton from "../GoalModal/CopyGoalButton";

export const innerBorderColors = {
  success: "#0034125e",
  failed: "#6205055c",
  pending: "#00206059",
};

export const GoalCard = ({
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography level="body-sm">
            {formatStringToDate(deadline)}までに
          </Typography>

          <div style={{ display: "flex", gap: "5px" }}>
            {user.loginType !== "Guest" && user.isMailVerified && (
              <CopyModalButton deadline={deadline} goalText={goalText} />
            )}

            {/* 期限の1時間以内、もしくは自分の目標ではない場合は削除できないようにする */}
            {!isWithinOneHour && userId === user?.userId && (
              <DeleteGoalModal goalId={goalId} />
            )}
          </div>
        </div>

        <Divider />

        <Typography
          level="body-lg"
          sx={{
            ...(resultType === "success" && {
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitLineClamp: 2,
            }),
          }}
        >
          {goalText}
        </Typography>
      </CardContent>
    </Card>
  );
};
