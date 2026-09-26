import { Link, useParams } from "react-router-dom";
import { ArrowRight, ExternalLink, Info } from "lucide-react";
import Seo, { faqLd } from "../../lib/seo";
import Breadcrumb from "../../components/Breadcrumb";
import Reveal from "../../components/Reveal";
import { findAide } from "../../content/aides";
import NotFound from "../NotFound";

export default function AideDetail() {
  const { slug } = useParams();
  const aide = findAide(slug);
  if (!aide) return <NotFound />;

  return (
    <>
      <Seo
        title={`${aide.title} — Aides Énergie France`}
        description={aide.intro.slice(0, 155)}
        path={`/aides/${aide.slug}/`}
        image={aide.image}
        jsonLd={faqLd(aide.faq)}
        type="article"
      />
      <div className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: "Aides", to: "/aides/" }, { label: aide.title, to: "" }]} />

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <span className="chip !cursor-default mb-5">{aide.family}</span>
            <h1 className="h-serif text-3xl sm:text-5xl font-semibold leading-tight mb-5">{aide.title}</h1>
            <p className="text-lg text-brand-ink/75 leading-relaxed mb-8">{aide.intro}</p>

            <div className="rounded-2xl overflow-hidden mb-10 border border-brand-line">
              <img src={aide.image} alt={aide.title} className="h-64 sm:h-80 w-full object-cover" />
            </div>

            <Reveal>
              <p className="flex items-start gap-2 text-xs text-brand-ink/60 mb-10 rounded-xl bg-white border border-brand-line p-4" data-testid="aide-last-checked">
                <Info className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Dernière vérification :</strong>{" "}
                  {aide.lastChecked
                    ? new Date(aide.lastChecked).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                    : "en cours — les conditions et barèmes évoluent régulièrement, confirmez toujours sur les sources officielles ci-dessous avant toute décision."}
                </span>
              </p>
            </Reveal>

            <section className="mb-12" data-testid="aide-conditions">
              <h2 className="h-serif text-2xl sm:text-3xl font-semibold mb-5">Les grandes conditions</h2>
              <ul className="space-y-3">
                {aide.conditions.map((c, i) => (
                  <li key={i} className="flex gap-3 text-brand-ink/80 text-[15px] leading-relaxed">
                    <span className="h-2 w-2 rounded-full bg-brand-green mt-2 shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-12" data-testid="aide-demarches">
              <h2 className="h-serif text-2xl sm:text-3xl font-semibold mb-5">Les démarches</h2>
              <ol className="space-y-4">
                {aide.demarches.map((d, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="h-8 w-8 rounded-full bg-brand-green text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <p className="text-brand-ink/80 text-[15px] leading-relaxed pt-1.5">{d}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mb-12" data-testid="aide-faq">
              <h2 className="h-serif text-2xl sm:text-3xl font-semibold mb-5">Questions fréquentes</h2>
              <div className="space-y-3">
                {aide.faq.map((f, i) => (
                  <details key={i} className="card group p-5" data-testid={`aide-faq-item-${i}`}>
                    <summary className="cursor-pointer font-semibold text-brand-ink text-[15px] list-none flex justify-between gap-4 items-start">
                      {f.q}
                      <span className="text-brand-green group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-brand-ink/75 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* Colonne latérale */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-5">
              <div className="card p-6" data-testid="aide-sources">
                <p className="eyebrow mb-4">Sources officielles</p>
                <ul className="space-y-3">
                  {aide.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" data-testid={`aide-source-${aide.slug}`} className="text-sm text-brand-ink/80 hover:text-brand-green flex items-start gap-2 leading-relaxed">
                        <ExternalLink className="h-4 w-4 mt-0.5 shrink-0 text-brand-green" />
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {aide.cta && (
                <div className="card p-6 bg-brand-green text-white border-none" data-testid="aide-cta-card">
                  <p className="font-serif text-xl mb-2">Votre projet concerne des travaux ?</p>
                  <p className="text-sm text-white/80 mb-5">Testez l'adaptation de votre logement en 2 minutes. Gratuit et sans engagement.</p>
                  <Link to={aide.cta.to} data-testid={`aide-cta-${aide.slug}`} className="btn-gold w-full">
                    {aide.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}

              {aide.official && (
                <div className="card p-6 border-brand-gold/50" data-testid="aide-official-card">
                  <p className="font-serif text-xl mb-2 text-brand-ink">Service public</p>
                  <p className="text-sm text-brand-ink/70 mb-5">Cette page ne collecte aucune demande : passez par le service officiel.</p>
                  <a href={aide.official.url} target="_blank" rel="noopener noreferrer" data-testid={`aide-official-link-${aide.slug}`} className="btn-outline w-full">
                    {aide.official.label} <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <div className="card p-6" data-testid="aide-related">
                <p className="eyebrow mb-4">À lire aussi</p>
                <ul className="space-y-3">
                  {aide.related.map((r) => (
                    <li key={r.to}>
                      <Link to={r.to} className="text-sm text-brand-ink/80 hover:text-brand-green flex items-start gap-2 leading-relaxed">
                        <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-brand-soft" /> {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
