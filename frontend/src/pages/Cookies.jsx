import { useEffect, useState } from "react";
import Seo from "../lib/seo";
import Breadcrumb from "../components/Breadcrumb";

const KEY = "aef_cookie_consent";

export default function Cookies() {
  const [prefs, setPrefs] = useState({ necessary: true, audience: false, marketing: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {
      /* aucune préférence */
    }
  }, []);

  const save = () => {
    window.localStorage.setItem(KEY, JSON.stringify({ ...prefs, ts: new Date().toISOString() }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <Seo
        title="Cookies — Aides Énergie France"
        description="Gérez vos préférences de cookies : nécessaires, mesure d'audience, marketing. Aucun suivi sans votre accord."
        path="/cookies/"
      />
      <div className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: "Cookies", to: "" }]} />
        <div className="mt-8 max-w-3xl mx-auto" data-testid="cookies-page">
          <h1 className="h-serif text-3xl sm:text-5xl font-semibold mb-6">Vos préférences de cookies</h1>
          <p className="text-brand-ink/75 leading-relaxed mb-8">
            Ce site dépose des cookies strictement nécessaires à son fonctionnement. Les cookies de
            mesure d'audience et de marketing ne sont activés qu'avec votre accord, recueilli au
            même niveau de choix. Aucun script publicitaire n'est chargé sans consentement.
          </p>

          <div className="space-y-4">
            <Row
              label="Cookies nécessaires"
              desc="Session, sécurité du formulaire, préférences d'affichage. Toujours actifs."
              checked
              disabled
            />
            <Row
              label="Mesure d'audience"
              desc="Statistiques anonymisées de fréquentation (désactivé par défaut)."
              checked={prefs.audience}
              onChange={(v) => setPrefs({ ...prefs, audience: v })}
              testid="cookies-page-toggle-audience"
            />
            <Row
              label="Marketing"
              desc="Aucun partenaire publicitaire activé à ce jour. Le bouton reste disponible si un jour un outil est branché."
              checked={prefs.marketing}
              onChange={(v) => setPrefs({ ...prefs, marketing: v })}
              testid="cookies-page-toggle-marketing"
            />
          </div>

          <button onClick={save} data-testid="cookies-page-save" className="btn-primary mt-8">
            Enregistrer mes préférences
          </button>
          {saved && (
            <p className="mt-3 text-sm text-brand-green font-semibold" data-testid="cookies-page-saved">
              Préférences enregistrées.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, desc, checked, onChange, disabled, testid }) {
  return (
    <div className="card p-5 flex items-start justify-between gap-6">
      <div>
        <p className="font-semibold text-brand-ink text-[15px] mb-1">{label}</p>
        <p className="text-sm text-brand-ink/70 leading-relaxed">{desc}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        data-testid={testid}
        className="mt-1 h-5 w-5 accent-[#155C45] shrink-0 disabled:opacity-50"
      />
    </div>
  );
}
