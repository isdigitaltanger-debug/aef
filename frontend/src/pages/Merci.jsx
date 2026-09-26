import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BadgeCheck, Home, Loader2 } from "lucide-react";
import Seo from "../lib/seo";
import api from "../lib/api";

export default function Merci() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || "";
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lead", ref],
    queryFn: () => api.get(`/leads/${encodeURIComponent(ref)}`).then((r) => r.data),
    enabled: !!ref,
    retry: false,
  });

  useEffect(() => {
    if (!ref) navigate("/", { replace: true });
  }, [ref, navigate]);

  return (
    <>
      <Seo title="Demande enregistrée — Aides Énergie France" description="Votre demande d'étude a bien été enregistrée." path="/merci/" />
      <div className="container-x py-16 sm:py-24">
        {isLoading && (
          <div className="flex items-center gap-3 text-brand-ink/60" data-testid="merci-loading">
            <Loader2 className="h-5 w-5 animate-spin" /> Vérification de votre référence…
          </div>
        )}

        {isError && (
          <div className="card max-w-2xl p-8" data-testid="merci-error">
            <p className="font-serif text-2xl text-brand-ink mb-3">Référence introuvable</p>
            <p className="text-sm text-brand-ink/70 mb-6">
              Nous n'avons pas trouvé de demande associée à cette référence. Si vous venez de
              soumettre le formulaire, vérifiez le lien reçu, ou renvoyez-nous votre demande.
            </p>
            <Link to="/simulation/" className="btn-primary">Refaire une demande</Link>
          </div>
        )}

        {data && (
          <div className="max-w-3xl" data-testid="merci-content">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-12 w-12 rounded-full bg-brand-green flex items-center justify-center">
                <BadgeCheck className="h-6 w-6 text-white" />
              </span>
              <p className="eyebrow !text-brand-green">Confirmation</p>
            </div>
            <h1 className="h-serif text-3xl sm:text-5xl font-semibold mb-4">Votre demande a bien été enregistrée.</h1>
            <p className="text-brand-ink/75 text-base sm:text-lg leading-relaxed mb-8">
              Conservez votre référence de suivi. Vous serez recontacté(e) au sujet de votre étude ;
              le délai de prise en charge vous sera confirmé lors de cet échange.
            </p>

            <div className="card p-6 sm:p-8 mb-8" data-testid="merci-reference-card">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/50 mb-2">Référence de suivi</p>
              <p className="font-mono text-2xl text-brand-green tracking-wider" data-testid="merci-reference">{data.reference}</p>
            </div>

            {data.headline && (
              <div className="card p-6 sm:p-8 mb-8" data-testid="merci-prequal">
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-ink/50 mb-3">Préqualification commerciale</p>
                <p className="font-serif text-xl sm:text-2xl text-brand-ink mb-4">{data.headline}</p>
                <ul className="space-y-2 mb-2">
                  {(data.messages || []).map((m, i) => (
                    <li key={i} className="text-sm text-brand-ink/75 flex gap-2 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-gold mt-2 shrink-0" /> {m}
                    </li>
                  ))}
                  {(data.orientations || []).map((m, i) => (
                    <li key={`o${i}`} className="text-sm text-brand-ink/75 flex gap-2 leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-green mt-2 shrink-0" /> {m}
                    </li>
                  ))}
                </ul>
                {(data.pack_kw || data.zone) && (
                  <div className="mt-5 grid grid-cols-2 gap-4 max-w-sm">
                    <div className="rounded-xl bg-brand-ivory border border-brand-line p-4">
                      <p className="text-[11px] uppercase tracking-wider text-brand-ink/50 mb-1">Zone estimée</p>
                      <p className="font-semibold text-brand-ink" data-testid="merci-zone">{data.zone}</p>
                    </div>
                    <div className="rounded-xl bg-brand-ivory border border-brand-line p-4">
                      <p className="text-[11px] uppercase tracking-wider text-brand-ink/50 mb-1">Pack préliminaire</p>
                      <p className="font-semibold text-brand-ink" data-testid="merci-pack">{data.pack_kw ? `${data.pack_kw} kW` : "à définir"}</p>
                    </div>
                  </div>
                )}
                {data.pack_note && <p className="mt-4 text-xs text-brand-ink/60">{data.pack_note}</p>}
                <p className="mt-4 text-[11px] text-brand-ink/50">{data.disclaimer}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link to="/aides/" data-testid="merci-link-aides" className="btn-primary">
                Explorer les aides <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/" data-testid="merci-link-home" className="btn-outline">
                <Home className="h-4 w-4" /> Retour à l'accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
