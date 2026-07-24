"use client";

import { useState } from "react";

export function EmailSignup() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || status === "sending") return;

    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-10 flex w-full max-w-md flex-col items-center gap-2">
        <p className="font-serif text-2xl italic leading-tight text-accent">
          anotado.
        </p>
        <p className="text-sm text-foreground/70">
          te aviso das novidades da mesa.
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
        novidades da mesa, direto no seu email.
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
          disabled={status === "sending"}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold tracking-tight text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {status === "sending" ? "enviando…" : "me avise →"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-500">
          deu ruim, tenta de novo em instantes.
        </p>
      )}
      <a
        href="#mesa"
        className="mt-3 block text-center text-xs text-foreground/50 underline-offset-4 hover:underline"
      >
        ou já testa agora ↓
      </a>
    </div>
  );
}
