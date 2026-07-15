"use client";

import { useState } from "react";

export function EmailSignup() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="mt-10 flex w-full max-w-md flex-col items-center gap-2">
        <p className="font-serif text-2xl italic leading-tight text-accent">
          anotado.
        </p>
        <p className="text-sm text-foreground/70">
          te aviso quando a mesa abrir.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 w-full max-w-md">
      <label htmlFor="email" className="sr-only">
        seu email
      </label>
      <p className="mb-2 text-xs text-foreground/60">
        te aviso quando a mesa abrir.
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="flex-1 rounded-full border border-border bg-foreground/[0.03] px-6 py-3 text-sm font-medium tracking-tight placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold tracking-tight text-background transition hover:opacity-90"
        >
          me avise →
        </button>
      </form>
    </div>
  );
}
