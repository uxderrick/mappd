"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

export default function ContactPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Contact form submitted:", { name, email, message });
    router.push("/");
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--dm-header-height))] px-6">
      <Card.Root className="w-full max-w-md">
        <Card.Header>
          <Card.Title className="text-lg">Get in Touch</Card.Title>
          <Card.Description>We&apos;d love to hear from you</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
            <Input label="Email" id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-msg" className="text-xs font-medium text-secondary">Message</label>
              <textarea
                id="contact-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="How can we help?"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all bg-surface-input border-surface-border text-primary placeholder:text-tertiary focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/30 resize-none"
              />
            </div>
            <Button variant="primary" className="w-full" type="submit">
              Send Message
            </Button>
          </form>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
