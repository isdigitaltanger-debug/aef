import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "../../lib/seo";
import Breadcrumb from "../../components/Breadcrumb";
import Reveal from "../../components/Reveal";
import { AIDS } from "../../content/aides";

const FAMILIES = ["Toutes", ...new Set(AIDS.map((a) => a.family))];

export default function AidesIndex() {
  const [family, setFamily] = useState("Toutes");
  const list = family === "Toutes" ? AIDS : AIDS.filter((a) => a.family === family);

  return (
    <>
      <Seo
        title="Toutes les aides énergétiques — Aides Énergie France"
        description="MaPrimeRénov', primes CEE, solaire thermique, pompe à chaleur, aides locales, chèque énergie : comprendre chaque dispositif avant de se lancer."
        path="/aides/"
      />
      <div className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: "Aides", to: "" }]} />
        <div className="mt-8 mb-10 max-w-2xl">
          <p className="eyebrow mb-4">Les aides</p>
          <h1 className="h-serif text-3xl sm:text-5xl font-semibold mb-5">Comprendre les aides énergétiques</h1>
          <p className="text-brand-ink/75 text-base sm:text-lg leading-relaxed">
            Chaque dispositif a ses conditions, ses démarches et ses barèmes. Nous décrivons les
            mécanismes sans promettre de montant : seule la source officielle fait foi.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-10" data-testid="aides-filter">
          {FAMILIES.map((f) => (
            <button key={f} onClick={() => setFamily(f)} data-testid={`aides-filter-${f.toLowerCase().replace(/\s/g, "-")}`} className={`chip ${family === f ? "chip-active" : ""}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 3) * 0.07}>
              <Link to={`/aides/${a.slug}/`} data-testid={`aide-page-card-${a.slug}`} className="card card-hover group block h-full overflow-hidden">
                <div className="h-40 overflow-hidden relative">
                  <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[11px] font-semibold text-brand-green">
                    {a.family}
                  </span>
                </div>
                <div className="p-6">
                  <p className="font-serif text-xl text-brand-ink mb-2">{a.title}</p>
                  <p className="text-sm text-brand-ink/70 leading-relaxed">{a.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-green">
                    Lire la fiche <ArrowRight className="h-3.5 w-3.5" />
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
