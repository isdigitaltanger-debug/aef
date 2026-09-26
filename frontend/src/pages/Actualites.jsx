import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Seo from "../lib/seo";
import Breadcrumb from "../components/Breadcrumb";
import Reveal from "../components/Reveal";
import api from "../lib/api";

export default function Actualites() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const category = params.get("category") || "";
  const q = params.get("q") || "";
  const [search, setSearch] = useState(q);

  useEffect(() => setSearch(q), [q]);

  const { data, isLoading } = useQuery({
    queryKey: ["articles", { page, category, q }],
    queryFn: () => api.get("/articles", { params: { page, category, q, limit: 9 } }).then((r) => r.data),
  });

  const update = (patch) => {
    const next = { page: 1, category, q };
    Object.entries(patch).forEach(([k, v]) => {
      if (v) next[k] = v;
      else delete next[k];
    });
    setParams(next);
  };

  return (
    <>
      <Seo
        title="Actualités & guides — Aides Énergie France"
        description="Guides pratiques et repères sur les aides énergétiques, le solaire thermique et les pompes à chaleur."
        path="/actualites/"
      />
      <div className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: "Actualités", to: "" }]} />
        <div className="mt-8 mb-8 max-w-2xl">
          <p className="eyebrow mb-4">Le journal</p>
          <h1 className="h-serif text-3xl sm:text-5xl font-semibold mb-5">Actualités & guides</h1>
          <p className="text-brand-ink/75 text-base sm:text-lg leading-relaxed">
            Des repères factuels et intemporels, sourcés vers les sites officiels. Aucun montant
            d'aide n'est annoncé : les barèmes évoluent trop souvent pour être promis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10" data-testid="articles-toolbar">
          <div className="flex flex-wrap gap-2">
            <button className={`chip ${!category ? "chip-active" : ""}`} data-testid="articles-cat-all" onClick={() => update({ category: "" })}>
              Tous
            </button>
            {(data?.categories || []).map((c) => (
              <button key={c.slug} className={`chip ${category === c.slug ? "chip-active" : ""}`} data-testid={`articles-cat-${c.slug}`} onClick={() => update({ category: c.slug })}>
                {c.label}
              </button>
            ))}
          </div>
          <form
            className="relative sm:ml-auto w-full sm:w-72"
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: search });
            }}
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-ink/40" />
            <input
              className="input-base !pl-10"
              placeholder="Rechercher un article…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="articles-search-input"
              aria-label="Rechercher un article"
            />
          </form>
        </div>

        {isLoading ? (
          <p className="text-brand-ink/55 text-sm py-16" data-testid="articles-loading">Chargement des articles…</p>
        ) : data.items.length === 0 ? (
          <div className="card p-10 text-center max-w-lg mx-auto" data-testid="articles-empty">
            <p className="font-serif text-2xl text-brand-ink mb-2">Aucun article trouvé</p>
            <p className="text-sm text-brand-ink/65">Essayez un autre mot-clé ou revenez aux publications générales.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 3) * 0.07}>
                <Link to={`/actualites/${a.slug}/`} data-testid={`articles-item-${a.slug}`} className="card card-hover group block h-full overflow-hidden">
                  <div className="h-44 overflow-hidden">
                    <img src={a.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-green mb-2">{a.category}</p>
                    <p className="font-serif text-lg text-brand-ink leading-snug mb-2">{a.title}</p>
                    <p className="text-sm text-brand-ink/70 leading-relaxed line-clamp-3">{a.excerpt}</p>
                    <p className="mt-4 text-xs text-brand-ink/50">
                      {new Date(a.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3" data-testid="articles-pagination">
            <button
              className="btn-outline !px-4 !py-2.5 !text-sm disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setParams({ page: page - 1, category, q })}
              data-testid="articles-prev-page"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </button>
            <span className="text-sm text-brand-ink/60 font-medium">Page {page} / {data.pages}</span>
            <button
              className="btn-outline !px-4 !py-2.5 !text-sm disabled:opacity-40"
              disabled={page >= data.pages}
              onClick={() => setParams({ page: page + 1, category, q })}
              data-testid="articles-next-page"
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
