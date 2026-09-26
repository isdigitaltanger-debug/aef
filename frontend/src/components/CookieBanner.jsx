import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, ShieldCheck } from "lucide-react";

const KEY = "aef_cookie_consent";

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(prefs) {
  window.localStorage.setItem(KEY, JSON.stringify({ ...prefs, ts: new Date().toISOString() }));
  window.dispatchEvent(new Event("aef-cookie-consent"));
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState(false);
  const [audience, setAudience] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const check = () => setVisible(!read());
    check();
    window.addEventListener("aef-cookie-consent", check);
    return () => window.removeEventListener("aef-cookie-consent", check);
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    write({ necessary: true, audience: true, marketing: true });
    setVisible(false);
  };
  const refuseAll = () => {
    write({ necessary: true, audience: false, marketing: false });
    setVisible(false);
  };
  const saveCustom = () => {
    write({ necessary: true, audience, marketing });
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[70]" data-testid="cookie-banner">
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Cookie className="h-5 w-5 text-brand-gold" />
          <p className="font-serif text-lg text-brand-ink">Vos préférences de cookies</p>
        </div>
        <p className="text-sm text-brand-ink/75 leading-relaxed">
          Nous utilisons des cookies nécessaires au fonctionnement du site. Les cookies de mesure
          d'audience et de marketing ne sont déposés qu'avec votre accord, au même niveau de choix.
          Aucun suivi publicitaire n'est actif avant consentement.
        </p>

        <AnimatePresence>
          {custom && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 space-y-3 overflow-hidden">
              <Toggle label="Cookies nécessaires (toujours actifs)" checked disabled />
              <Toggle label="Mesure d'audience (statistiques anonymes)" checked={audience} onChange={setAudience} testid="cookie-toggle-audience" />
              <Toggle label="Marketing (aucun script actif sans accord)" checked={marketing} onChange={setMarketing} testid="cookie-toggle-marketing" />
              <button onClick={saveCustom} data-testid="cookie-save-btn" className="btn-primary w-full !py-2.5 !text-sm">
                Enregistrer mes préférences
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <button onClick={acceptAll} data-testid="cookie-accept-btn" className="btn-primary flex-1 !py-2.5 !text-sm">
            Accepter
          </button>
          <button onClick={refuseAll} data-testid="cookie-refuse-btn" className="btn-outline flex-1 !py-2.5 !text-sm">
            Refuser
          </button>
          <button onClick={() => setCustom(!custom)} data-testid="cookie-customize-btn" className="btn-outline flex-1 !py-2.5 !text-sm">
            Personnaliser
          </button>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-brand-ink/50">
          <ShieldCheck className="h-3.5 w-3.5" /> Modifiable à tout moment depuis la page Cookies.
        </p>
      </motion.div>
    </div>
  );
}

function Toggle({ label, checked, onChange, disabled, testid }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-brand-line bg-brand-ivory px-4 py-3 cursor-pointer">
      <span className="text-sm text-brand-ink/85">{label}</span>
      <input
        type="checkbox"
        data-testid={testid}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-5 w-5 accent-[#155C45] disabled:opacity-50"
      />
    </label>
  );
}
