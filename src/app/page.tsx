"use client";

import CenterIn from "@/Components/Animation/CenterIn";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GitHubIcon from "@mui/icons-material/GitHub";
import Button from "@mui/joy/Button";
import Typography, { TypographyProps } from "@mui/joy/Typography";
import { ReactNode } from "react";
import styled from "styled-components";
import styles from "./page.module.scss";

const StyledTypography = styled(Typography)<TypographyProps>`
  color: var(--primary-color);
  font-family: Roboto, "Zen Kaku Gothic New", sans-serif;
  font-weight: 600;
  padding: 0 3px;
`;

export default function Top() {
  return (
    <div className={styles.introductionBody}>
      <CenterIn>
        <StyledTypography level="h4" component="h2" sx={{ paddingTop: "20px" }}>
          友達と共有・競争できるTODOリスト
        </StyledTypography>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <FormatListBulletedIcon className={styles.svg} />
          <StyledTypography level="h1">TODO REAL</StyledTypography>
        </div>
        <img src="/img/app.webp" />
      </CenterIn>

      <CenterIn>
        <StyledTypography level="h2">TODO REALとは?</StyledTypography>
        <StyledTypography level="body-md">
          やりたいことがつい後回しになってしまったり、毎日続けたいと思っていた習慣が途切れてしまったり…そんな経験はありませんか?
          <br />
          TODO REALはあなたの目標達成・継続を手助けします!
          <img src="/img/todoListImage.webp" />
          TODO REALでは目標を完了したら写真を投稿することができ、
          <Highlight>
            SNS感覚でTODOリストを使ったり友達と共有できます!
          </Highlight>
          <br />
          面倒なイメージのTODOリストも、TODO REALを使えば
          <Highlight>思わず開きたくなるアプリに</Highlight>
          変えることができます!
        </StyledTypography>
      </CenterIn>

      <CenterIn>
        <StyledTypography level="h3" component="h2">
          完了したTODOリストを友達と共有
        </StyledTypography>
        <StyledTypography level="body-md">
          完了したTODOリストは友達に公開されます。友達に共有することで、達成感を共有できます。
        </StyledTypography>
        <img src="/img/completed1.webp" />
      </CenterIn>

      <CenterIn>
        <StyledTypography level="h3" component="h2">
          失敗したら友達に晒す
        </StyledTypography>
        <StyledTypography level="body-md">
          失敗してもペナルティの無いTODOリストとは異なり、期限内に完了しなかったTODOリストも公開されます。なんて恥ずかしい。
        </StyledTypography>
        <img src="/img/failed.webp" />
      </CenterIn>

      <CenterIn>
        <StyledTypography level="h3" component="h2">
          期限が近づくと通知を送信
        </StyledTypography>
        <StyledTypography level="body-md">
          5分前になると通知を送信します。通知を受け取ることで、TODOリストの達成を手助けします。
          {/* TODO: 画像を差し替える */}
        </StyledTypography>
        <img src="/img/notification.webp" />
      </CenterIn>

      <CenterIn>
        <StyledTypography level="h3" component="h2">
          毎日継続して友達と競おう
        </StyledTypography>
        <StyledTypography level="body-md">
          連続記録で毎日目標を達成することを促進します!
          <br />
          また、達成率や達成回数で友達と競うこともできます!
        </StyledTypography>
        <img src="/img/competition.webp" />
      </CenterIn>

      <CenterIn>
        <StyledTypography level="h3" component="h2">
          目標を作成する面倒を無くす
        </StyledTypography>
        <StyledTypography level="body-md">
          毎回目標を設定するのが面倒?ワンクリックで作成可能に!
          <br />
          完了投稿をすると投稿ボタンが変化して同じ目標をワンクリックで複製できるように!
        </StyledTypography>
        <img src="/img/copyGoal.webp" />
      </CenterIn>

      <CenterIn>
        <StyledTypography level="h3" component="h2">
          友達の投稿を見たいなら、あなたも投稿しましょう
        </StyledTypography>
        <StyledTypography level="body-md">
          友達の投稿を表示するには、あなたの完了した目標をシェアしましょう。あなたが最後に投稿した時間より後の目標の画像はモザイクがかかっています。
        </StyledTypography>
        {/* TODO: 正式に実装したら画像を新しくする */}
        <img src="/img/blur.webp" />
      </CenterIn>

      <CenterIn>
        <StyledTypography level="h2" component="h2">
          使い方
        </StyledTypography>
        <StyledTypography level="h4" component="h3">
          1. 目標を作成
        </StyledTypography>
        <StyledTypography level="body-md">
          画面右下の+ボタンから目標を作成できます。
        </StyledTypography>
        <img src="/img/create.webp" style={{ marginBottom: "15px" }} />

        <StyledTypography level="h4" component="h3">
          2. 投稿
        </StyledTypography>
        <StyledTypography level="body-md">
          目標を完了したら写真をアップロードして共有しましょう!
        </StyledTypography>
        <img src="/img/post.webp" style={{ marginBottom: "10px" }} />

        <StyledTypography level="body-md">
          アップロードしたら自動で友達に公開されます!
        </StyledTypography>
        <img src="/img/completed2.webp" />
      </CenterIn>

      <CenterIn>
        <h1>今すぐ始めよう!</h1>
        <StyledTypography
          level="body-sm"
          sx={{ textAlign: "center", padding: "5px 0 8px !important" }}
        >
          あなたの最初の目標はこのアプリを使い始めることです。
        </StyledTypography>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button variant="outlined" size="lg" component="a" href="/account">
            始める
          </Button>
        </div>
        <Typography
          level="body-sm"
          sx={{ textAlign: "center", paddingTop: "10px", fontWeight: 600 }}
        >
          ゲストログインを使用するとアカウントを作成せずに閲覧できますが、投稿機能は使用できません。
        </Typography>
      </CenterIn>

      <CenterIn>
        <StyledTypography level="h3" component="h2">
          今後追加したい機能
        </StyledTypography>
        <StyledTypography level="body-md">
          いいねやコメント等の友達とインタラクトできる機能を実装予定です。
        </StyledTypography>
      </CenterIn>

      <CenterIn>
        <Typography level="body-sm" sx={{ marginTop: "10px" }}>
          <a
            href="https://github.com/MurakawaTakuya/todo-real"
            target="_blank"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <GitHubIcon /> コード・実装方法はGitHubのドキュメントを参照
          </a>
        </Typography>
      </CenterIn>
    </div>
  );
}

const Highlight = ({ children }: { children: ReactNode }) => {
  return <span className={styles.highlight}>{children}</span>;
};
