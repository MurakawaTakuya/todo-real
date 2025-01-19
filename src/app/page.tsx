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
  padding: 0 13px;
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
          <StyledTypography level="h1" sx={{ padding: "0 !important" }}>
            TODO REAL
          </StyledTypography>
        </div>
        <img src="/img/app.webp" alt="アプリ画面" />
      </CenterIn>

      <div>
        <StyledTypography level="h2">TODO REALとは?</StyledTypography>
        <CenterIn>
          <StyledTypography level="body-md">
            やりたいことがつい後回しになってしまったり、毎日続けたいと思っていた習慣が途切れてしまったり…そんな経験はありませんか?
            <br />
            TODO REALはあなたの目標達成・継続を手助けします!
            <img src="/img/todoListImage.webp" alt="TODOリストイメージ画像" />
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
      </div>

      <div>
        <StyledTypography level="h3" component="h2">
          完了したTODOリストを友達と共有
        </StyledTypography>
        <CenterIn>
          <StyledTypography level="body-md">
            完了したTODOリストは友達に公開されます。友達に共有することで、達成感を共有できます。
          </StyledTypography>
          <img src="/img/completed1.webp" alt="完了したら共有される" />
        </CenterIn>
      </div>

      <div>
        <StyledTypography level="h3" component="h2">
          期限に間に合わなくても公開される
        </StyledTypography>
        <CenterIn>
          <StyledTypography level="body-md">
            通常のペナルティの無いTODOリストとは異なり、期限内に完了しなかった目標は失敗として公開され、その目標に対する完了投稿はできなくなります。写真を共有するためには期限内に完了しましょう!
          </StyledTypography>
          <img src="/img/failed.webp" alt="失敗しても共有される" />
        </CenterIn>
      </div>

      <div>
        <StyledTypography level="h3" component="h2">
          友達と応援し合おう
        </StyledTypography>
        <CenterIn>
          <StyledTypography level="body-md">
            リアクション機能を使うことで友達と応援し合ったり、驚きや達成感を共有することができます。リアクションは成功した目標と失敗した目標で異なります。
          </StyledTypography>
          <img src="/img/reaction.webp" alt="リアクション機能" />
        </CenterIn>
      </div>

      <div>
        <StyledTypography level="h3" component="h2">
          期限が近づくと通知を送信
        </StyledTypography>
        <CenterIn>
          <StyledTypography level="body-md">
            期限10分前にまだ完了していない場合は通知を送信します。通知を受け取ることで、TODOリストの達成を手助けします。(iOS
            16.3以前の端末や、通知に対応していない端末では使用できません。)
          </StyledTypography>
          <img src="/img/notification.webp" alt="10分前に通知を送信" />
        </CenterIn>
      </div>

      <div>
        <StyledTypography level="h3" component="h2">
          毎日継続して友達と競おう
        </StyledTypography>
        <CenterIn>
          <StyledTypography level="body-md">
            連続記録で毎日目標を達成することを促進します!
            また、達成率や達成回数で友達と競うこともできます!
          </StyledTypography>
          <img
            src="/img/competition.webp"
            alt="毎日継続"
            style={{ width: "70%" }}
          />
        </CenterIn>
      </div>

      <div>
        <StyledTypography level="h3" component="h2">
          明日の目標も簡単に作成
        </StyledTypography>
        <CenterIn>
          <StyledTypography level="body-md">
            毎回目標を設定するのが面倒?ワンクリックで作成可能に!
            完了投稿をすると投稿ボタンが変化して、同じ目標をワンクリックで複製できるようになります!
          </StyledTypography>
          <img src="/img/copyGoal.webp" alt="簡単に目標を複製" />
        </CenterIn>
      </div>

      <div>
        <StyledTypography level="h3" component="h2">
          見る専になるのを防ぐ
        </StyledTypography>
        <CenterIn>
          <StyledTypography level="body-md">
            あなたが最後に目標を完了した時間より後の投稿はモザイクがかかっています。友達の投稿を表示するには、あなたも完了した目標をシェアしましょう!(ゲストログインの場合は特別に表示されます)
          </StyledTypography>
          <img src="/img/blur.webp" alt="投稿するまでモザイク" />
        </CenterIn>
      </div>

      <div>
        <StyledTypography level="h3" component="h2">
          ホーム画面からすぐにアクセス
        </StyledTypography>
        <CenterIn>
          <StyledTypography level="body-md">
            アカウントページからホーム画面にアプリとして追加することができ、使いたいときにすぐにアクセスできます!また、見た目もモバイルアプリのようになります。(iOS
            16.3以前の端末や、PWAに対応していない端末では使用できません。)
          </StyledTypography>
        </CenterIn>
      </div>

      <div>
        <StyledTypography level="h2" component="h2">
          使い方
        </StyledTypography>
        <CenterIn>
          <StyledTypography level="h4" component="h3">
            1. 目標を作成
          </StyledTypography>
          <StyledTypography level="body-md" textAlign="center">
            画面右下の+ボタンから目標を作成できます。
          </StyledTypography>
          <img
            src="/img/create.webp"
            alt="作成"
            style={{ marginBottom: "15px" }}
          />

          <StyledTypography level="h4" component="h3">
            2. 投稿
          </StyledTypography>
          <StyledTypography level="body-md" textAlign="center">
            目標を完了したら写真をアップロードして共有しましょう!
          </StyledTypography>
          <img
            src="/img/goal.webp"
            alt="アップロード"
            style={{ marginBottom: "10px" }}
          />

          <StyledTypography level="body-md" textAlign="center">
            アップロードしたら自動で友達に公開されます!
          </StyledTypography>
          <img src="/img/completed2.webp" alt="公開" />
        </CenterIn>
      </div>

      <div>
        <h1>今すぐ始めよう!</h1>
        <CenterIn>
          <StyledTypography
            level="body-sm"
            sx={{ textAlign: "center", padding: "5px 0 8px !important" }}
          >
            あなたの最初の目標はこのアプリを使い始めることです!
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
            ゲストログインを使用するとアカウントを作成せずに閲覧できますが、閲覧以外の機能は利用できません。
          </Typography>
        </CenterIn>
      </div>

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
    </div>
  );
}

const Highlight = ({ children }: { children: ReactNode }) => {
  return <span className={styles.highlight}>{children}</span>;
};
