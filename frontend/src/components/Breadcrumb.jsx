import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { breadcrumbLd } from "../lib/seo";

export default function Breadcrumb({ items }) {
  const all = [{ label: "Accueil", to: "/" }, ...items];
  return (
    <nav aria-label="Fil d'Ariane" data-testid="breadcrumb" className="text-xs sm:text-sm text-brand-ink/55">
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
            {it.to && i < all.length - 1 ? (
              <Link to={it.to} className="hover:text-brand-green transition-colors">
                {it.label}
              </Link>
            ) : (
              <span className="text-brand-ink/80 font-medium" aria-current="page">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbLd(all.map((a) => ({ label: a.label, to: a.to || "" }))))}
      </script>
    </nav>
  );
}
