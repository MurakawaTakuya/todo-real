"use client";
import { createUser } from "@/utils/createUserAuth";
import React, { useState } from "react";
export default function UserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await createUser(email, password, name);
    } catch (error) {
      console.error("errorCode:", (error as any)?.errorCode);
      console.error("errorMessage:", (error as any)?.errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
          autoComplete="current-password"
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
