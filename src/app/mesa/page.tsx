"use client";

import { useState } from "react";
import Link from "next/link";
import { FORCE_LABEL, FORCE_ORDER, type Force } from "@/lib/prompts";

type ForceStatus = "idle" | "waiting" | "streaming" | "done" | "error";

type ForceState = {
  status: ForceStatus;
  text: string;
  error: string | null;
};

const INITIAL_STATE: Record<Force, ForceState> = {
  hype: { status: "idle", text: "", error: null },
  caixa: { status: "idle", text: "", error: null },
  freio: { status: "idle", text: "", error: null },
  repertorio: { status: "idle", text: "", error: null },
};

export default function MesaPage() {
  const [idea, setIdea] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [forces, setForces] = useState<Record<Force, ForceState>>(INITIAL_STATE);

  function updateForce(force: Force, patch: Partial<ForceState>) {
    setForces((prev) => ({ ...prev, [force]: { ...prev[force], ...patch } }));
  }

  async function streamOneForce(
    force: Force,
    ideaText: string,
    previous: { force: Force; text: string }[]
  ) {
    updateForce(force, { status: "streaming", text: "", error: null });

    let res: Response;
    try {
      res = await fetch("/api/critique", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idea: ideaText, force, previous }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro de rede.";
      updateForce(force, { status: "error", error: message });
      return;
    }

    if (!res.ok) {
      let errorMessage = "Algo quebrou.";
      try {
        const data = (await res.json()) as { error?: string };
        errorMessage = data.error ?? errorMessage;
      } catch {}
      updateForce(force, { status: "error", error: errorMessage });
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      updateForce(force, { status: "error", error: "Sem stream disponível." });
      return;
    }

    const decoder = new TextDecoder();
    let acc = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        // Rede de segurança pro cenário cross-SSE: dois artefatos filtrados
        // consecutivamente no server podem chegar como dois espaços separados.
        const safe = acc.replace(/[ \t]{2,}/g, " ");
        updateForce(force, { text: safe });
      }
      const finalText = acc.replace(/[ \t]{2,}/g, " ");
      updateForce(force, { status: "done", text: finalText });
      return finalText;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stream falhou.";
      updateForce(force, { status: "error", error: message });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (idea.trim().length < 30) {
      setGlobalError("Traga mais contexto. Mínimo umas 30 letras.");
      return;
    }

    setGlobalError(null);
    setSessionActive(true);
    setSessionDone(false);

    const reset: Record<Force, ForceState> = {
      hype: { status: "waiting", text: "", error: null },
      caixa: { status: "waiting", text: "", error: null },
      freio: { status: "waiting", text: "", error: null },
      repertorio: { status: "waiting", text: "", error: null },
    };
    setForces(reset);

    const transcript: { force: Force; text: string }[] = [];
    for (const force of FORCE_ORDER) {
      const text = await streamOneForce(force, idea, transcript);
      if (text && text.trim().length > 0) {
        transcript.push({ force, text });
      }
    }

    setSessionDone(true);
  }

  function handleReset() {
    setIdea("");
    setForces(INITIAL_STATE);
    setSessionActive(false);
    setSessionDone(false);
    setGlobalError(null);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12 sm:px-10 sm:py-20">
      <header className="mb-12">
        <Link
          href="/"
          className="text-sm text-foreground/60 transition hover:text-foreground/90"
        >
          ← voltar
        </Link>
        <h1 className="mt-8 font-serif text-5xl italic leading-[0.9] tracking-tight sm:text-6xl">
          a mesa
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-foreground/60 sm:text-base">
          cola sua ideia. quatro forças reagem em sequência, hype, caixa,
          freio, repertório.
        </p>
      </header>

      {!sessionActive && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="idea" className="text-xs uppercase tracking-[0.15em] text-foreground/50">
            sua ideia
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="descreve a ideia. quanto mais contexto, mais afiada a crítica."
            rows={7}
            className="w-full rounded-lg border border-border bg-foreground/[0.03] p-4 text-base leading-relaxed placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground/40">
              {idea.trim().length < 30
                ? `${idea.trim().length}/30 mínimo`
                : `${idea.trim().length} caracteres`}
            </span>
            <button
              type="submit"
              disabled={idea.trim().length < 30}
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold tracking-tight text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              colocar na mesa →
            </button>
          </div>
        </form>
      )}

      {globalError && (
        <p className="mt-6 rounded-lg border border-red-900/40 bg-red-900/10 p-4 text-sm text-red-300">
          {globalError}
        </p>
      )}

      {sessionActive && (
        <>
          <section className="rounded-lg border border-border bg-foreground/[0.02] p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-foreground/50">
              ideia na mesa
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
              {idea}
            </p>
          </section>

          <div className="mt-12 flex flex-col divide-y divide-border">
            {FORCE_ORDER.map((force) => (
              <ForceSection
                key={force}
                force={force}
                state={forces[force]}
              />
            ))}
          </div>

          {sessionDone && (
            <div className="mt-16 flex flex-col items-start gap-4 border-t border-border pt-10">
              <p className="font-serif text-2xl italic text-foreground/70">
                a mesa fechou.
              </p>
              <button
                onClick={handleReset}
                className="rounded-full border border-border px-5 py-2 text-sm text-foreground/80 transition hover:border-accent hover:text-accent"
              >
                nova sessão
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

function ForceSection({ force, state }: { force: Force; state: ForceState }) {
  const label = FORCE_LABEL[force];
  const isActive = state.status === "streaming";
  const isDone = state.status === "done";
  const isWaiting = state.status === "waiting";
  const isError = state.status === "error";

  const headerColor = isActive || isDone
    ? "text-accent"
    : "text-foreground/25";

  const statusLabel = isWaiting
    ? "aguardando"
    : isActive
    ? "respondendo"
    : isDone
    ? "pronto"
    : isError
    ? "falhou"
    : "";

  return (
    <article className="py-10 sm:py-14">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          className={`font-serif text-5xl italic leading-none transition-colors sm:text-6xl ${headerColor}`}
        >
          {label}
        </h2>
        {statusLabel && (
          <span
            className={`text-[10px] uppercase tracking-[0.2em] ${
              isActive
                ? "text-accent"
                : isError
                ? "text-red-400/80"
                : "text-foreground/40"
            }`}
          >
            {isActive && (
              <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent align-middle motion-reduce:animate-none" />
            )}
            {statusLabel}
          </span>
        )}
      </div>

      <div className="mt-6 min-h-[3rem]">
        {isWaiting && (
          <div className="space-y-2">
            <div className="h-3 w-11/12 rounded bg-foreground/[0.06]" />
            <div className="h-3 w-9/12 rounded bg-foreground/[0.06]" />
            <div className="h-3 w-10/12 rounded bg-foreground/[0.06]" />
          </div>
        )}

        {(isActive || isDone) && (
          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 sm:text-lg">
            {state.text}
            {isActive && (
              <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-accent align-middle motion-reduce:animate-none" />
            )}
          </div>
        )}

        {isError && state.error && (
          <p className="rounded-lg border border-red-900/40 bg-red-900/10 p-3 text-sm text-red-300">
            {state.error}
          </p>
        )}
      </div>
    </article>
  );
}
