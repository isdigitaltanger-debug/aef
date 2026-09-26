import { Link } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";
import Seo from "../lib/seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page introuvable — Aides Énergie France" description="La page demandée n'existe pas ou a été déplacée." path="/404" />
      <div className="container-x py-24 sm:py-32 text-center max-w-2xl" data-testid="not-found-page">
        <p className="font-serif text-7xl sm:text-8xl text-brand-green mb-6">404</p>
        <h1 className="h-serif text-2xl sm:text-4xl font-semibold mb-4">Cette page a pris le soleil</h1>
        <p className="text-brand-ink/70 leading-relaxed mb-10">
          La page que vous cherchez n'existe plus ou a été déplacée. Reprenez la visite depuis
          l'accueil, ou explorez nos aides et solutions.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" data-testid="not-found-home" className="btn-primary">
            <Compass className="h-4 w-4" /> Retour à l'accueil
          </Link>
          <Link to="/aides/" data-testid="not-found-aides" className="btn-outline">
            Voir les aides <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
