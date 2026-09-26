import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "../../lib/seo";
import Breadcrumb from "../../components/Breadcrumb";
import Reveal from "../../components/Reveal";
import { SOLUTIONS } from "../../content/solutions";

export default function SolutionsIndex() {
  return (
    <>
      <Seo
        title="Nos solutions énergétiques — Aides Énergie France"
        description="Système solaire combiné, pompe à chaleur, PAC + solaire thermique, isolation, chauffage : fonctionnement, pour qui, points de vigilance."
        path="/solutions/"
      />
      <div className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: "Solutions", to: "" }]} />
        <div className="mt-8 mb-10 max-w-2xl">
          <p className="eyebrow mb-4">Les solutions</p>
          <h1 className="h-serif text-3xl sm:text-5xl font-semibold mb-5">Des solutions concrètes, expliquées simplement</h1>
          <p className="text-brand-ink/75 text-base sm:text-lg leading-relaxed">
            Le cœur de notre expertise : le solaire thermique et son association à la pompe à
            chaleur. Comprenez chaque équipement avant d'engager des travaux.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 0.07}>
              <Link to={`/solutions/${s.slug}/`} data-testid={`solutions-page-card-${s.slug}`} className="card card-hover group block h-full overflow-hidden">
                <div className="h-44 overflow-hidden">
                  <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <p className="font-serif text-xl text-brand-ink mb-2">{s.title}</p>
                  <p className="text-sm text-brand-ink/70">{s.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-green">
                    Découvrir <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
