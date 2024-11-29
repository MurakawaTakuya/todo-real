import styles from "./PostCard.module.scss";

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
export default function PostCard({ post }: PostCardProps) {
  console.log(post);
  return (
    <div className={styles.card}>
      <p>User ID: {post.userId}</p>
      <p>Store ID: {post.storedId}</p>
      <p>Text: {post.text}</p>
      <p>Goal ID: {post.goalId}</p>
    </div>
  );
}
