// import styles from "./PostCard.module.scss";

import Progress from "./Progress";

// Postの中身の型を定義
interface Post {
  userId: string;
  storedId: string;
  text: string;
  goalId: string;
}

interface PostCardProps {
  post: Post;
}

// 投稿を取得してPostCardに渡す
export default function ResultCard({ post }: PostCardProps) {
  console.log(post);
  return (
    <>
      {/* Stepper作成 */}
      {/* goal表示 */}
      {/* post表示 */}
      <p>User ID: {post.userId}</p>
      <p>Store ID: {post.storedId}</p>
      <p>Text: {post.text}</p>
      <p>Goal ID: {post.goalId}</p>

      <Progress />
    </>
  );
}

// ファイル名をresultcardとかにする
