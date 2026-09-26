import { useState } from "react";
import { Mail, Loader2, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Seo from "../lib/seo";
import Breadcrumb from "../components/Breadcrumb";
import api, { apiError } from "../lib/api";

export default function Contact() {
  const [form, setForm] = useState({ nom: "", email: "", sujet: "", message: "", website: "" });
  const [ok, setOk] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!consent) {
      setError("Merci de cocher la case de consentement pour envoyer votre message.");
      return;
    }
    setSending(true);
    try {
      await api.post("/contact", { ...form, contact_ok: consent });
      setOk(true);
      toast.success("Votre message a bien été envoyé.");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo
        title="Contact — Aides Énergie France"
        description="Une question sur les aides énergétiques ou votre projet ? Écrivez-nous : réponse personnalisée, sans démarchage abusif."
        path="/contact/"
      />
      <div className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: "Contact", to: "" }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-4">Contact</p>
            <h1 className="h-serif text-3xl sm:text-5xl font-semibold leading-tight mb-5">Une question ? Écrivez-nous</h1>
            <p className="text-brand-ink/75 leading-relaxed mb-8">
              Pour toute question sur les aides, les solutions ou votre dossier : notre équipe vous
              répond. Pour les démarches officielles, consultez France Rénov' ou le service public
              concerné.
            </p>
            <div className="card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-brand-green" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-brand-ink/50">Par e-mail</p>
                  <a href="mailto:demandes@aidesenergiefrance.fr" data-testid="contact-email-link" className="text-sm font-semibold text-brand-green hover:underline">
                    demandes@aidesenergiefrance.fr
                  </a>
                </div>
              </div>
              <p className="text-xs text-brand-ink/60 border-t border-brand-line pt-4 leading-relaxed">
                Plateforme privée d'information et de mise en relation. Vos messages sont
                transmis uniquement à notre équipe.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {ok ? (
              <div className="card p-8 text-center" data-testid="contact-success">
                <span className="h-12 w-12 rounded-full bg-brand-green text-white flex items-center justify-center mx-auto mb-4">
                  <Send className="h-5 w-5" />
                </span>
                <p className="font-serif text-2xl text-brand-ink mb-2">Message envoyé</p>
                <p className="text-sm text-brand-ink/70">Nous revenons vers vous dès que possible. Merci de votre confiance.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="card p-6 sm:p-8 space-y-5" data-testid="contact-form">
                <div className="grid sm:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="text-sm font-semibold text-brand-ink block mb-2">Nom</span>
                    <input required className="input-base" value={form.nom} onChange={set("nom")} data-testid="contact-nom-input" placeholder="Votre nom" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-brand-ink block mb-2">E-mail</span>
                    <input required type="email" className="input-base" value={form.email} onChange={set("email")} data-testid="contact-email-input" placeholder="vous@exemple.fr" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-semibold text-brand-ink block mb-2">Sujet (optionnel)</span>
                  <input className="input-base" value={form.sujet} onChange={set("sujet")} data-testid="contact-sujet-input" placeholder="Ex. question sur le SSC" />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-brand-ink block mb-2">Votre message</span>
                  <textarea required minLength={10} maxLength={4000} rows={6} className="input-base resize-y" value={form.message} onChange={set("message")} data-testid="contact-message-input" placeholder="Décrivez votre question…" />
                </label>

                <input type="text" name="website" value={form.website} onChange={set("website")} tabIndex={-1} aria-hidden="true" className="absolute opacity-0 pointer-events-none h-0 w-0" autoComplete="off" />

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} data-testid="contact-consent-checkbox" className="mt-0.5 h-5 w-5 accent-[#155C45] shrink-0" />
                  <span className="text-xs text-brand-ink/75 leading-relaxed">
                    J'accepte que mes données (nom, e-mail, message) soient utilisées uniquement pour
                    répondre à ma demande. Elles ne sont jamais revendues.{" "}
                    <a href="/confidentialite/" className="underline text-brand-green">Politique de confidentialité</a>.
                  </span>
                </label>

                {error && (
                  <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3" data-testid="contact-error" role="alert">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={sending} data-testid="contact-submit-btn" className="btn-primary disabled:opacity-60">
                  {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</> : <>Envoyer le message <Send className="h-4 w-4" /></>}
                </button>
                <p className="flex items-center gap-2 text-[11px] text-brand-ink/50">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-green" /> Transmission sécurisée · Aucune donnée dans les URL
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
