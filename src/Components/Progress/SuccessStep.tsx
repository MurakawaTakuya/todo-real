import { GoalWithIdAndUserData, User } from "@/types/types";
import { formatStringToDate } from "@/utils/DateFormatter";
import AppRegistrationRoundedIcon from "@mui/icons-material/AppRegistrationRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { CssVarsProvider, Divider, extendTheme } from "@mui/joy";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Skeleton from "@mui/joy/Skeleton";
import Step from "@mui/joy/Step";
import StepIndicator from "@mui/joy/StepIndicator";
import Typography from "@mui/joy/Typography";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { useState } from "react";
import CenterIn from "../Animation/CenterIn";
import DeletePostModal from "../PostModal/DeletePostModal";
import EditPostModal from "../PostModal/EditPostModal";
import { GoalCard, innerBorderColors } from "./GoalCard";
import { StepperBlock } from "./StepperBlock";

const successPostIndicatorStyle = {
  "& > div": {
    placeSelf: "start",
  },
};

const blurImageStyle = {
  filter: "blur(20px)",
  clipPath: "inset(0)",
};

export const SuccessStep = ({
  result,
  user,
  isBlured,
}: {
  result: GoalWithIdAndUserData;
  user: User;
  isBlured: boolean;
}) => {
  const [imageURL, setImageURL] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  const post = result.post;
  if (!post) {
    return null;
  }

  const storage = getStorage();
  const imageRef = ref(storage, `post/${post.storedId}`);

  getDownloadURL(imageRef)
    .then((url) => {
      setImageURL(url);
    })
    .catch((error) => {
      console.error("Error fetching image URL:", error);
    });

  const theme = extendTheme({
    components: {
      JoySkeleton: {
        defaultProps: {
          animation: "wave",
        },
      },
    },
  });

  return (
    <StepperBlock key={result.goalId} resultType="success" result={result}>
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
          <div
            style={{
              minHeight: "15vh",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CssVarsProvider theme={theme}>
              <Skeleton
                loading={!imageLoaded}
                variant="overlay"
                sx={{
                  borderRadius: "5px 5px 0 0",
                  height: "15vh",
                }}
              >
                {imageURL && (
                  <img
                    src={imageURL}
                    srcSet={imageURL}
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      maxHeight: "50vh",
                      margin: "0 auto",
                      borderRadius: "5px 5px 0 0",
                      borderBottom: "thin solid #cdcdcd",
                      ...(isBlured ? blurImageStyle : {}),
                    }}
                    loading="lazy"
                    alt=""
                    onLoad={() => setImageLoaded(true)}
                  />
                )}
              </Skeleton>
            </CssVarsProvider>

            {isBlured && imageURL && (
              <div
                style={{
                  position: "absolute",
                  top: "45%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "85%",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                <CenterIn delay={0.5}>
                  <Typography
                    level="body-lg"
                    sx={{
                      color: "black",
                      textShadow: "0 0 10px rgb(201 228 255)",
                    }}
                  >
                    投稿をするとモザイクが解除されます
                  </Typography>
                  <Typography
                    level="body-sm"
                    sx={{
                      color: "black",
                      textShadow: "0 0 8px rgb(201 228 255)",
                    }}
                  >
                    最後にあなたが完了した目標より後に投稿された画像はモザイクがかかります。自分も目標を達成して共有しましょう!
                  </Typography>
                </CenterIn>
              </div>
            )}
          </div>

          <CardContent sx={{ padding: "5px 10px 5px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography level="body-sm">
                {formatStringToDate(post.submittedAt)}に完了
              </Typography>
              {/* 自分の作成した投稿のみ編集・削除できるようにする */}
              {result.userId === user?.userId && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <EditPostModal goalId={result.goalId} />
                  <DeletePostModal
                    goalId={result.goalId}
                    deadline={result.deadline}
                  />
                </div>
              )}
            </div>

            {post.text && (
              <>
                <Divider />
                <Typography level="title-md" sx={{ paddingBottom: "3px" }}>
                  {post.text}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Step>
    </StepperBlock>
  );
};
