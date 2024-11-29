"use client";
import ResultCard from "@/Components/ResultCard/ResultCard";
import { useEffect, useState } from "react";
import styles from "./Posts.module.scss";

// Postの中身の型を定義
interface Post {
  userId: string;
  storedId: string;
  text: string;
  goalId: string;
}

// 投稿を取得してPostCardに渡す
export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("https://firestore-okdtj725ta-an.a.run.app/post/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: Post[]) => {
        setPosts(data);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  return (
    <div className={styles.postsContainer}>
      {posts.map((post, index) => (
        <ResultCard key={index} post={post} />
      ))}
    </div>
  );
}
