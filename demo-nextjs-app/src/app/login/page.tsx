"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Login attempt:", { username });
    localStorage.setItem("user", JSON.stringify({ username, loggedIn: true }));
    localStorage.setItem("loginTimestamp", new Date().toISOString());
    router.push("/");
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 60px)",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "32px",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          background: "var(--card-bg)",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
          Welcome back
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
          Sign in to your account
        </p>

        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontWeight: 500,
            fontSize: "0.875rem",
          }}
        >
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "1rem",
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        />

        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontWeight: 500,
            fontSize: "0.875rem",
          }}
        >
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            marginBottom: "24px",
            fontSize: "1rem",
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
