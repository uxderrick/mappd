"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Login attempt:", { username });
    localStorage.setItem("user", JSON.stringify({ username, loggedIn: true }));
    router.push("/");
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--dm-header-height))] px-6">
      <Card.Root className="w-full max-w-sm">
        <Card.Header>
          <Card.Title className="text-lg">Welcome back</Card.Title>
          <Card.Description>Sign in to your account</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <Button variant="primary" className="w-full" type="submit">
              Sign In
            </Button>
          </form>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
