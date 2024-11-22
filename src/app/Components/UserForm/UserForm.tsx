"use client";
import { auth } from "@/app/firebase";
import { createUser } from "@/utils/createUserAuth";
import { loginUser } from "@/utils/loginUserAuth";
import { signInAsGuest } from "@/utils/signInAnonymously";
import { signInWithGoogleAccount } from "@/utils/signInWithGoogleAccount";
import { useUser } from "@/utils/UserContext";
import { signOut } from "firebase/auth";
import React, { useState } from "react";

export default function UserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { user } = useUser();

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createUser(email, password, name);
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await loginUser(email, password);
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogleAccount();
  };

  const handleGuestLogin = async () => {
    await signInAsGuest();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Signed out");
    } catch (error) {
      console.error("errorCode:", (error as Error)?.name);
      console.error("errorMessage:", (error as Error)?.message);
    }
  };

  return (
    <>
      <p>{user ? `ログイン中: ${user.name}` : "ログインしてください"}</p>
      アカウント作成
      <form onSubmit={handleRegisterSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="username"
          />
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        <button type="submit">アカウント作成</button>
      </form>
      ログイン
      <form onSubmit={handleLoginSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit">ログイン</button>
      </form>
      <button onClick={handleGoogleLogin}>Googleでログイン</button>
      <button onClick={handleGuestLogin}>ゲストログイン</button>
      <button onClick={handleLogout}>ログアウト</button>
    </>
  );
}
