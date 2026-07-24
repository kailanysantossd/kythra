export const maxDuration = 15;

const RESEND_CONTACTS_URL = (audienceId: string) =>
  `https://api.resend.com/audiences/${audienceId}/contacts`;

type RequestBody = { email?: string };

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonError("Corpo da requisição inválido.", 400);
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return jsonError("Email inválido.", 400);
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim();
  if (!apiKey || !audienceId) {
    return jsonError("Resend não configurado no servidor.", 500);
  }

  let resendRes: Response;
  try {
    resendRes = await fetch(RESEND_CONTACTS_URL(audienceId), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro de rede.";
    console.error("[/api/subscribe] resend fetch error:", err);
    return jsonError(`Falha de rede ao chamar Resend: ${message}`, 502);
  }

  if (!resendRes.ok) {
    const errText = await resendRes.text().catch(() => "");
    // Resend retorna 409 quando o contato já existe na audience — trata como sucesso.
    if (resendRes.status === 409) {
      return new Response(JSON.stringify({ ok: true, already: true }), {
        headers: { "content-type": "application/json" },
      });
    }
    console.error(
      "[/api/subscribe] resend api error:",
      resendRes.status,
      errText.slice(0, 500)
    );
    return jsonError(
      `Resend retornou ${resendRes.status}: ${errText.slice(0, 300)}`,
      resendRes.status
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
}
