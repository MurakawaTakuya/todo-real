"use client";
import { useState } from "react";

export default function Goal() {
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/todo-real-c28fa/asia-northeast1/firestore/goal/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: "sampleUser123",
            text: text,
            deadline: dueDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Success:", data);

      setText("");
      setDueDate("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Fetch error:", error.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        目標テキスト:
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </label>
      <label>
        期日:
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </label>
      <button type="submit">アップロード</button>
    </form>
  );
}
