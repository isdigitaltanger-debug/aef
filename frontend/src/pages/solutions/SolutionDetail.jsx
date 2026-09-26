import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import Seo, { faqLd } from "../../lib/seo";
import Breadcrumb from "../../components/Breadcrumb";
import Reveal from "../../components/Reveal";
import { findSolution, SOLUTIONS } from "../../content/solutions";
import NotFound from "../NotFound";

export default function SolutionDetail() {
  const { slug } = useParams();
  const sol = findSolution(slug);
  if (!sol) return <NotFound />;
  const others = SOLUTIONS.filter((s) => s.slug !== sol.slug).slice(0, 3);

  return (
    <>
      <Seo
        title={`${sol.title} — Aides Énergie France`}
        description={sol.tagline}
        path={`/solutions/${sol.slug}/`}
        image={sol.image}
        jsonLd={faqLd(sol.faq)}
        type="article"
      />
      <div className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: "Solutions", to: "/solutions/" }, { label: sol.title, to: "" }]} />

        <div className="mt-8 mb-10 max-w-3xl">
          <p className="eyebrow mb-4">Solution</p>
          <h1 className="h-serif text-3xl sm:text-5xl font-semibold leading-tight mb-4">{sol.title}</h1>
          <p className="text-lg text-brand-ink/75 leading-relaxed">{sol.tagline}</p>
        </div>

        <div className="rounded-2xl overflow-hidden mb-12 border border-brand-line">
          <img src={sol.image} alt={sol.title} className="h-64 sm:h-96 w-full object-cover" />
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-12">
            <Reveal>
              <section data-testid="solution-fonctionnement">
                <h2 className="h-serif text-2xl sm:text-3xl font-semibold mb-5">Comment ça fonctionne</h2>
                <ul className="space-y-3">
                  {sol.fonctionnement.map((f, i) => (
                    <li key={i} className="flex gap-3 text-brand-ink/80 text-[15px] leading-relaxed">
                      <span className="h-2 w-2 rounded-full bg-brand-gold mt-2 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section data-testid="solution-pour-qui">
                <h2 className="h-serif text-2xl sm:text-3xl font-semibold mb-5">Pour qui ?</h2>
                <ul className="space-y-3">
                  {sol.pourQui.map((p, i) => (
                    <li key={i} className="flex gap-3 text-brand-ink/80 text-[15px] leading-relaxed">
                      <CheckCircle2 className="h-5 w-5 text-brand-green shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section data-testid="solution-vigilance">
                <h2 className="h-serif text-2xl sm:text-3xl font-semibold mb-5">Points de vigilance</h2>
                <ul className="space-y-3">
                  {sol.vigilance.map((v, i) => (
                    <li key={i} className="flex gap-3 text-brand-ink/80 text-[15px] leading-relaxed rounded-xl bg-white border border-brand-line p-4">
                      <ShieldAlert className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" /> {v}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <section data-testid="solution-faq">
              <h2 className="h-serif text-2xl sm:text-3xl font-semibold mb-5">Questions fréquentes</h2>
              <div className="space-y-3">
                {sol.faq.map((f, i) => (
                  <details key={i} className="card group p-5">
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

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-5">
              <div className="card p-6 bg-brand-green text-white border-none" data-testid="solution-cta-card">
                <p className="font-serif text-xl mb-2">Votre logement correspond-il ?</p>
                <p className="text-sm text-white/80 mb-5">Testez l'adaptation de votre projet en 2 minutes. Gratuit et sans engagement.</p>
                <Link to="/simulation/" data-testid={`solution-cta-${sol.slug}`} className="btn-gold w-full">
                  Je teste mon éligibilité en 2 minutes <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="card p-6" data-testid="solution-related">
                <p className="eyebrow mb-4">Autres solutions</p>
                <ul className="space-y-3">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <Link to={`/solutions/${o.slug}/`} className="text-sm text-brand-ink/80 hover:text-brand-green flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 mt-0.5 shrink-0 text-brand-soft" /> {o.title}
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
