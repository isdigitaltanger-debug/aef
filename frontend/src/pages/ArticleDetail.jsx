import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import Seo from "../lib/seo";
import Breadcrumb from "../components/Breadcrumb";
import api from "../lib/api";
import NotFound from "./NotFound";

export default function ArticleDetail() {
  const { slug } = useParams();
  const { data: art, isLoading, isError } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => api.get(`/articles/${encodeURIComponent(slug)}`).then((r) => r.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="container-x py-24 flex items-center gap-3 text-brand-ink/60" data-testid="article-loading">
        <Loader2 className="h-5 w-5 animate-spin" /> Chargement de l'article…
      </div>
    );
  }
  if (isError || !art) return <NotFound />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: art.title,
    description: art.seo_description || art.excerpt,
    image: art.image_url,
    datePublished: art.published_at,
    author: { "@type": "Organization", name: art.author },
  };

  return (
    <>
      <Seo
        title={`${art.seo_title || art.title} — Aides Énergie France`}
        description={art.seo_description || art.excerpt}
        path={`/actualites/${art.slug}/`}
        image={art.image_url}
        jsonLd={jsonLd}
        type="article"
      />
      <article className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: "Actualités", to: "/actualites/" }, { label: art.title, to: "" }]} />

        <div className="mt-8 max-w-3xl mx-auto" data-testid="article-content">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-green mb-3">{art.category}</p>
          <h1 className="h-serif text-3xl sm:text-5xl font-semibold leading-tight mb-6">{art.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-ink/55 mb-8" data-testid="article-meta">
            <span>Par {art.author}</span>
            <span>·</span>
            <span>
              Publié le {new Date(art.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            {art.updated_at && (
              <>
                <span>·</span>
                <span>Mis à jour le {new Date(art.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
              </>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden border border-brand-line mb-10">
            <img src={art.image_url} alt="" className="h-64 sm:h-96 w-full object-cover" />
          </div>

          <div className="prose-editorial max-w-3xl">
            {art.content.split("\n\n").map((block, i) =>
              block.startsWith("## ") ? <h2 key={i}>{block.slice(3)}</h2> : <p key={i}>{block}</p>
            )}
          </div>

          {art.source_urls?.length > 0 && (
            <div className="card p-6 mt-10" data-testid="article-sources">
              <p className="eyebrow mb-4">Sources & pour aller plus loin</p>
              <ul className="space-y-2">
                {art.source_urls.map((u) => (
                  <li key={u}>
                    <a href={u} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-ink/80 hover:text-brand-green flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 mt-0.5 shrink-0 text-brand-green" /> {u}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card p-6 sm:p-8 mt-10 bg-brand-green text-white border-none" data-testid="article-cta">
            <p className="font-serif text-2xl mb-2">Un projet concret pour votre logement ?</p>
            <p className="text-sm text-white/80 mb-5">Testez l'adaptation de votre projet en 2 minutes. Gratuit et sans engagement.</p>
            <Link to="/simulation/" data-testid="article-cta-btn" className="btn-gold">
              Je teste mon éligibilité <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
