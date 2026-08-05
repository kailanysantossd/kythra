import {
  FORCE_ORDER,
  FORCE_LABEL,
  SYSTEM_PROMPTS,
  type Force,
} from "@/lib/prompts";

export const maxDuration = 60;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// llama-3.3-70b-versatile depreciado pela Groq (encerramento 16/08/2026),
// migrado pro substituto oficial recomendado.
const GROQ_MODEL = "openai/gpt-oss-120b";

// Faixas Unicode onde Llama 3.3 tem histórico de vazar tokens em textos pt-BR:
// U+3000-303F CJK Punctuation, U+3040-309F Hiragana, U+30A0-30FF Katakana,
// U+3400-4DBF CJK Extension A, U+4E00-9FFF CJK Unified, U+AC00-D7A3 Hangul.
// Latino estendido (á, ã, ç etc) fica de fora intencionalmente.
const NON_LATIN_ARTIFACT =
  /[　-〿぀-ゟ゠-ヿ㐀-䶿一-鿿가-힣]/g;

function cleanArtifact(s: string): string {
  return s.replace(NON_LATIN_ARTIFACT, " ").replace(/[ \t]{2,}/g, " ");
}

type PreviousTurn = { force: Force; text: string };
type RequestBody = {
  idea?: string;
  force?: string;
  previous?: PreviousTurn[];
};

function isForce(value: string): value is Force {
  return (FORCE_ORDER as readonly string[]).includes(value);
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function buildUserPrompt(
  idea: string,
  previous: PreviousTurn[] | undefined
): string {
  if (!previous || previous.length === 0) {
    return `Ideia submetida à mesa:\n\n${idea}`;
  }

  const transcript = previous
    .map((t) => `${FORCE_LABEL[t.force].toUpperCase()}:\n${t.text}`)
    .join("\n\n---\n\n");

  return `Ideia submetida à mesa:\n\n${idea}\n\n---\n\nTranscript das forças anteriores nesta mesma sessão:\n\n${transcript}\n\n---\n\nAgora é sua vez. Considere o que já foi dito, mas fale com sua voz distinta. Discorde ou construa em cima quando fizer sentido.`;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonError("Corpo da requisição inválido.", 400);
  }

  const idea = body.idea;
  const forceParam = body.force;
  const previous = body.previous;

  if (!idea || typeof idea !== "string" || idea.trim().length < 30) {
    return jsonError("Ideia muito curta. Traga mais contexto.", 400);
  }

  if (!forceParam || typeof forceParam !== "string" || !isForce(forceParam)) {
    return jsonError(
      `Força inválida. Use uma de: ${FORCE_ORDER.join(", ")}.`,
      400
    );
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return jsonError("Chave da API não configurada no servidor.", 500);
  }

  const force: Force = forceParam;
  const systemPrompt = SYSTEM_PROMPTS[force];
  const userPrompt = buildUserPrompt(idea, previous);

  // REPERTÓRIO acumula o transcript das 3 forças anteriores e tem o TESTE DUPLO
  // pra cumprir no fechamento — historicamente a resposta mais longa das quatro.
  const FORCE_MAX_TOKENS: Record<Force, number> = {
    hype: 700,
    caixa: 700,
    freio: 700,
    repertorio: 800,
  };

  // HYPE tende a entrar em loop de repetição de frase em respostas mais longas.
  // Temperatura mais baixa favorece esse loop; sobe um pouco só pra essa força
  // e usa frequency_penalty pra penalizar tokens repetidos.
  const FORCE_TEMPERATURE: Record<Force, number> = {
    hype: 0.6,
    caixa: 0.4,
    freio: 0.4,
    repertorio: 0.4,
  };
  const FORCE_FREQUENCY_PENALTY: Record<Force, number> = {
    hype: 0.4,
    caixa: 0,
    freio: 0,
    repertorio: 0,
  };

  const groqBody = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: true,
    temperature: FORCE_TEMPERATURE[force],
    frequency_penalty: FORCE_FREQUENCY_PENALTY[force],
    max_tokens: FORCE_MAX_TOKENS[force],
    // gpt-oss gasta tokens de "raciocínio" antes da resposta visível;
    // "low" mantém esse overhead mínimo (~8 tokens vs ~63 em "medium"/"high" default).
    reasoning_effort: "low",
  };

  // Rate limit do Groq (TPM) estoura em sessões de 4 chamadas em sequência.
  // Um retry após a espera sugerida cobre o que a redução de tokens sozinha não garante.
  const MAX_RETRIES = 2;
  const MAX_WAIT_SECONDS = 25;

  function parseRetrySeconds(body: string, header: string | null): number {
    if (header) {
      const fromHeader = Number(header);
      if (Number.isFinite(fromHeader) && fromHeader > 0) return fromHeader;
    }
    const match = body.match(/try again in ([\d.]+)s/i);
    if (match) return Number(match[1]);
    return 5;
  }

  let groqRes: Response | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      groqRes = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(groqBody),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro de rede.";
      console.error("[/api/critique] groq fetch error:", err);
      return jsonError(`Falha de rede ao chamar Groq: ${message}`, 502);
    }

    if (groqRes.status !== 429 || attempt === MAX_RETRIES) break;

    const errText = await groqRes.text().catch(() => "");
    const waitSeconds = Math.min(
      parseRetrySeconds(errText, groqRes.headers.get("retry-after")),
      MAX_WAIT_SECONDS
    );
    console.warn(
      `[/api/critique] groq 429, retry ${attempt + 1}/${MAX_RETRIES} após ${waitSeconds}s`
    );
    await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
  }

  if (!groqRes || !groqRes.ok || !groqRes.body) {
    const errText = await groqRes?.text().catch(() => "") ?? "";
    console.error(
      "[/api/critique] groq api error:",
      groqRes?.status,
      errText.slice(0, 500)
    );
    return jsonError(
      `Groq retornou ${groqRes?.status}: ${errText.slice(0, 300)}`,
      groqRes?.status ?? 502
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = groqRes.body.getReader();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta.length > 0) {
                const cleaned = cleanArtifact(delta);
                if (cleaned.length > 0) {
                  controller.enqueue(encoder.encode(cleaned));
                }
              }
            } catch {
              // Ignora linhas SSE malformadas
            }
          }
        }
        controller.close();
      } catch (err) {
        console.error("[/api/critique] groq stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache",
      "x-kythra-provider": "groq",
    },
  });
}
