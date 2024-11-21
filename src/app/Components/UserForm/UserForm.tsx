"use client";
import { createUser } from "@/utils/createUserAuth";
import { loginUser } from "@/utils/loginUserAuth";
import { signInAsGuest } from "@/utils/signInAnonymously";
import { signInWithGoogleAccount } from "@/utils/signInWithGoogleAccount";
import React, { useState } from "react";
export default function UserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await createUser(email, password, name);
    } catch (error) {
      console.error("errorCode:", (error as any)?.errorCode);
      console.error("errorMessage:", (error as any)?.errorMessage);
    }
  };

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // ログイン処理
    try {
      await loginUser(email, password);
    } catch (error) {
      console.error("errorCode:", (error as any)?.errorCode);
      console.error("errorMessage:", (error as any)?.errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogleAccount();
  };

  const handleGuestLogin = async () => {
    await signInAsGuest();
  };

  return (
    <>
      アカウント作成
      <form onSubmit={handleRegisterSubmit}>
        <label>
          Username:
          {/* user name */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="username"
          />
          {/* email */}
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {/* password */}
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        <button type="submit">Submit</button>
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
        <button type="submit">Submit</button>
      </form>
      <button onClick={handleGoogleLogin}>Googleでログイン</button>
      <button onClick={handleGuestLogin}>ゲストログイン</button>
    </>
  );
}
