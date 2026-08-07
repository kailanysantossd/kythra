import Link from "next/link";

export const metadata = {
  title: "privacidade · kythra",
};

export default function Privacidade() {
  return (
    <main className="relative flex flex-1 flex-col px-6 py-24 sm:px-10 sm:py-40">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
          privacidade
        </h1>

        <p className="mt-8 text-lg leading-relaxed text-foreground/70">
          Aqui vai, de forma direta, o que acontece com os dados que você
          deixa no kythra. Essa política segue a LGPD (Lei 13.709/2018), a
          lei brasileira que se aplica a qualquer produto que trata dado
          pessoal de gente no Brasil.
        </p>

        <section className="mt-16 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            o que coletamos
          </h2>
          <p className="text-base leading-relaxed text-foreground/70">
            Só o seu email, quando você preenche o formulário de assinatura
            no topo do site. A base legal é o seu consentimento ao
            preencher o formulário. Usamos esse email só pra te mandar
            novidades da mesa. Não coletamos mais nada além disso na
            landing.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            e quando você usa a mesa
          </h2>
          <p className="text-base leading-relaxed text-foreground/70">
            O texto da ideia que você cola na mesa é enviado pra Groq, que
            roda o modelo Llama 3.3 e devolve a crítica das quatro forças.
            Pelos{" "}
            <a
              href="https://console.groq.com/docs/your-data"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-4"
            >
              termos públicos da Groq
            </a>
            , esse texto não é usado pra treinar modelo. Em casos de
            investigação de abuso ou erro técnico, a Groq pode manter logs
            por até 30 dias — ao usar a mesa, você está ciente disso. Do
            nosso lado, não guardamos sua ideia depois que a sessão
            termina.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            quem mais vê seu email
          </h2>
          <p className="text-base leading-relaxed text-foreground/70">
            Seu email fica armazenado na Resend, que usamos só pra enviar as
            novidades. A Resend segue GDPR e SOC 2 e tem{" "}
            <a
              href="https://resend.com/legal/dpa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-4"
            >
              contrato de processamento de dados publicado
            </a>
            , mas quem responde pela LGPD sobre esse dado é o kythra, não a
            Resend. Seu email fica guardado enquanto você quiser continuar
            recebendo novidades, sem prazo automático de expiração. Não
            vendemos nem compartilhamos esse dado com mais ninguém.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            cookies e rastreamento
          </h2>
          <p className="text-base leading-relaxed text-foreground/70">
            O kythra não usa Google Analytics, Meta Pixel, Hotjar ou
            qualquer outra ferramenta de rastreamento. Não usamos cookies de
            terceiro. O único dado técnico registrado é o log padrão de
            acesso do servidor (endereço IP e horário da requisição),
            mantido pela Vercel, empresa que hospeda o site, só pra
            operação e segurança básica — não usamos isso pra te
            identificar ou perfilar.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            quer sair ou apagar seu dado
          </h2>
          <p className="text-base leading-relaxed text-foreground/70">
            Responde um email pra{" "}
            <a
              href="mailto:contatokythra@gmail.com"
              className="text-accent underline underline-offset-4"
            >
              contatokythra@gmail.com
            </a>{" "}
            pedindo pra descadastrar ou apagar seu email. A gente resolve em
            até 15 dias.
          </p>
        </section>

        <Link
          href="/"
          className="mt-20 inline-block text-sm text-foreground/60 underline underline-offset-4 hover:text-foreground"
        >
          ← voltar
        </Link>
      </div>
    </main>
  );
}
