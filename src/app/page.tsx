import Link from "next/link";
import { EmailSignup } from "./_components/EmailSignup";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* glow discreto atrás do wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(245,181,68,0.35) 0%, rgba(245,181,68,0) 70%)",
        }}
      />

      {/* hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-16 text-center sm:px-10">
        <h1 className="text-[22vw] font-semibold leading-[0.85] tracking-[-0.04em] sm:text-[180px]">
          kythra
        </h1>

        <p className="mt-14 max-w-2xl font-serif text-3xl italic leading-[1.15] tracking-tight text-foreground/90 sm:text-4xl">
          Aqui, a ideia apanha antes de amadurecer.
        </p>

        <EmailSignup />
      </section>

      {/* proposta */}
      <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-40">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            Ideia sozinha na cabeça{" "}
            <span className="relative inline-block px-2">
              <span className="relative z-10 font-serif italic font-normal text-accent">
                parece
              </span>
              <svg
                aria-hidden
                viewBox="0 0 220 90"
                className="absolute inset-0 h-full w-full text-accent"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M18 45 Q10 12 110 8 Q212 14 205 45 Q212 78 110 82 Q8 76 18 45"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </svg>
            </span>{" "}
            genial.
            <br />
            Na primeira reunião,{" "}
            <span className="font-serif italic font-normal">desmorona</span>.
          </h2>

          <p className="mt-14 max-w-xl text-xl leading-[1.4] text-foreground/80 sm:text-2xl">
            Cola sua ideia aqui. Quatro perspectivas atacam por eixos
            diferentes. Você sai com um briefing melhor. Ou desiste dela. De
            graça.
          </p>
        </div>
      </section>

      {/* forças */}
      <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-40">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            As quatro{" "}
            <span className="font-serif italic font-normal text-accent">
              forças
            </span>
            .
          </h2>
        </div>

        <div className="mx-auto mt-8 max-w-6xl sm:mt-24">
          {forces.map((force, i) => {
            const isEven = i % 2 === 0;
            return (
              <article
                key={force.name}
                className="grid gap-6 border-b border-border py-10 last:border-b-0 sm:grid-cols-[1fr_1.15fr] sm:gap-20 sm:py-32"
              >
                {/* nome, alterna lado */}
                <div
                  className={`flex min-w-0 items-start ${
                    isEven ? "" : "sm:order-2"
                  }`}
                >
                  <h3 className="font-serif text-6xl italic leading-[0.85] text-accent sm:text-7xl md:text-8xl">
                    {force.name}
                  </h3>
                </div>

                {/* stack de texto */}
                <div className={`min-w-0 ${isEven ? "" : "sm:order-1"}`}>
                  <p className="text-2xl font-medium leading-[1.25] tracking-tight text-foreground/95 sm:text-3xl">
                    {force.lead}
                  </p>
                  <p className="mt-6 text-base leading-relaxed text-foreground/65 sm:text-lg">
                    {force.description}
                  </p>
                  <blockquote className="mt-10 border-l-2 border-accent/50 pl-5 text-base italic leading-relaxed text-foreground/60 sm:text-lg">
                    &ldquo;{force.quote}&rdquo;
                  </blockquote>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* mesa */}
      <section className="border-t border-border px-6 py-24 sm:px-10 sm:py-48">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-8xl sm:leading-[1]">
            Chega a{" "}
            <span className="font-serif italic font-normal text-accent">
              mesa
            </span>
            .
          </h2>

          <p className="mt-4 font-serif text-base italic leading-snug tracking-tight text-foreground/60 sm:mt-10 sm:text-3xl">
            Onde sua ideia se prova. Ou é enterrada.
          </p>

          <Link
            href="/mesa"
            className="mt-12 inline-block rounded-full bg-accent px-8 py-4 text-sm font-semibold tracking-tight text-background transition hover:opacity-90 sm:mt-16"
          >
            colocar uma ideia na mesa →
          </Link>
        </div>
      </section>

    </main>
  );
}

const forces = [
  {
    name: "hype",
    lead: "Não deixa você ser esquecido.",
    description:
      "O pecado é o tédio. Ideia correta e educada é pior que ideia ruim e ousada. Sem risco, não tem valor.",
    quote:
      "Beleza, tá tudo certinho. Mas você vai lembrar disso na quinta que vem? Não? Então não importa quão certo tá.",
  },
  {
    name: "caixa",
    lead: "Quer saber se vende.",
    description:
      "Desconfia de criatividade pela criatividade. Quer o caminho até a venda desenhado. Se não cabe numa frase, não aprova.",
    quote:
      "Bonito eu vi, prêmio isso ganha. Agora me mostra o que muda na cabeça de quem tá decidindo entre você e o concorrente.",
  },
  {
    name: "freio",
    lead: "Aponta o risco.",
    description:
      "Olha como sua ideia envelhece: como pode ser cortada fora de contexto, quem pode se ofender, o que vira piada em seis meses.",
    quote:
      "Se isso vazar cortado no pior segundo, a gente sobrevive? Já vi marca boa virar piada por menos.",
  },
  {
    name: "repertório",
    lead: "Já viu tudo.",
    description:
      "Cita a campanha parecida na hora, aponta clichê sem dó. Se trocar o logo e a ideia continuar igual a algo já rodado em outra categoria, reprova.",
    quote:
      "Isso é a campanha do banco tal, só trocando a cor. Se não é homenagem de propósito, é plágio de repertório.",
  },
];
