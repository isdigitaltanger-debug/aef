import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, HelpCircle, Layers, Loader2, MoreHorizontal, ShieldCheck, Sun, Wind } from "lucide-react";
import api, { apiError } from "../lib/api";
import { useWizard } from "./WizardContext";
import { SlotPicker } from "../components/CallbackWidget";

const STEPS = ["Mon projet", "Mon logement", "Ma situation", "Mes coordonnées"];

const PROJETS = [
  { value: "ssc", label: "Solaire thermique (SSC)", icon: Sun },
  { value: "pac", label: "Pompe à chaleur", icon: Wind },
  { value: "isolation", label: "Isolation", icon: Layers },
  { value: "chauffage", label: "Chauffage", icon: Flame },
  { value: "autre", label: "Autre projet", icon: MoreHorizontal },
  { value: "ne_sais_pas", label: "Je ne sais pas", icon: HelpCircle },
];

const PHONE_RE = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.\-]*\d{2}){4}$/;

export default function EligibilityForm({ variant = "hero" }) {
  const wiz = useWizard();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [honey, setHoney] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touchedStep, setTouchedStep] = useState(false);
  const [dir, setDir] = useState(1);
  const [callbackSlot, setCallbackSlot] = useState("");

  useEffect(() => {
    api.get("/meta").then((r) => setMeta(r.data)).catch(() => setMeta(null));
  }, []);

  const { answers, setAnswer, step, setStep, contact, setContactField, contactOk, setContactOk, marketingOk, setMarketingOk, utm } = wiz;

  // Pré-vérification locale (affichage uniquement) : le serveur reste la source de vérité.
  const favorable =
    (answers.projet === "ssc" || answers.projet === "pac_ssc") &&
    (answers.statut === "proprietaire_occupant" || answers.statut === "proprietaire_bailleur") &&
    answers.type_logement === "maison" &&
    answers.plus_de_2_ans !== "non" &&
    answers.toiture_orientation !== "nord" &&
    answers.surface_toiture_16m2 !== "non";

  const card = (active) => `rounded-[4px] border p-4 text-left transition-all duration-200 cursor-pointer select-none ${
    active ? "border-brand-green bg-brand-green/[0.06] ring-1 ring-brand-green shadow-[0_6px_18px_-8px_rgba(21,92,69,0.4)]" : "border-[#C9D1D8] bg-white hover:border-brand-green/60 hover:-translate-y-0.5"
  }`;

  const validateStep = (s) => {
    const e = [];
    if (s === 0 && !answers.projet) e.push("Choisissez un type de projet (ou « Je ne sais pas »).");
    if (s === 1) {
      if (!answers.statut) e.push("Indiquez votre statut d'occupant.");
      if (!answers.type_logement) e.push("Indiquez le type de logement.");
      if (!answers.plus_de_2_ans) e.push("Indiquez si le logement a plus de 2 ans.");
      const surf = Number(answers.surface);
      if (!surf || surf < 9 || surf < 9 || surf > 3000) e.push("Indiquez la surface chauffée en m² (entre 9 et 3000).");
      if (!/^\d{5}$/.test(answers.code_postal)) e.push("Indiquez un code postal à 5 chiffres.");
    }
    if (s === 2) {
      const occ = Number(answers.occupants);
      if (!occ || occ < 1 || occ > 25) e.push("Indiquez le nombre d'occupants (1 à 25).");
      if (!answers.chauffage_actuel) e.push("Indiquez votre chauffage actuel.");
      if (!answers.emetteurs) e.push("Indiquez le matériau de vos émetteurs.");
      if (!answers.toiture_orientation) e.push("Indiquez l'orientation de la toiture.");
      if (!answers.surface_toiture_16m2) e.push("Indiquez si la toiture offre au moins 16 m² exploitables.");
      if (!answers.espace_technique) e.push("Indiquez si l'espace technique est disponible.");
    }
    return e;
  };

  const goto = (target) => {
    setDir(target > step ? 1 : -1);
    setStep(target);
  };

  const next = () => {
    setTouchedStep(true);
    const e = validateStep(step);
    if (e.length) return;
    setTouchedStep(false);
    goto(step + 1);
    if (variant === "hero") {
      setTimeout(() => document.getElementById("test-eligibilite")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  };

  const prev = () => {
    setError("");
    goto(Math.max(0, step - 1));
  };

  const submit = async () => {
    setTouchedStep(true);
    const e = validateStep(0).concat(validateStep(1), validateStep(2));
    if (!contact.prenom.trim() || !contact.nom.trim()) e.push("Indiquez votre prénom et votre nom.");
    if (!PHONE_RE.test(contact.telephone)) e.push("Indiquez un téléphone français valide.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email)) e.push("Indiquez un e-mail valide.");
    if (!contactOk) e.push("Le consentement d'être recontacté est nécessaire pour envoyer la demande.");
    if (e.length) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        answers: { ...answers, surface: Number(answers.surface), occupants: Number(answers.occupants), callback_slot: callbackSlot },
        contact,
        contact_ok: contactOk,
        marketing_ok: marketingOk,
        utm,
        website: honey,
      };
      const { data } = await api.post("/leads", payload);
      wiz.reset();
      navigate(`/merci?ref=${encodeURIComponent(data.reference)}`);
    } catch (err) {
      setError(apiError(err));
      setSubmitting(false);
    }
  };

  const stepValid = validateStep(step).length === 0;

  return (
    <div className="card !border-t-4 !border-t-brand-green p-5 sm:p-7" data-testid={`eligibility-wizard-${variant}`}>
      {/* Barre d'étapes */}
      <ol className="grid grid-cols-4 gap-1 sm:gap-2 mb-7" data-testid="wizard-steps-bar">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => i < step && goto(i)}
              data-testid={`wizard-step-tab-${i + 1}`}
              className={`w-full text-left transition-opacity ${i <= step ? "opacity-100" : "opacity-45"} ${i < step ? "cursor-pointer" : "cursor-default"}`}
              aria-current={i === step ? "step" : undefined}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`h-6 w-6 shrink-0 rounded-[4px] text-[11px] font-bold flex items-center justify-center ${
                  i < step ? "bg-brand-green text-white" : i === step ? "bg-brand-green/10 text-brand-green border border-brand-green" : "bg-brand-ink/5 text-brand-ink/40"
                }`}>
                  {i < step ? "✓" : i + 1}
                </span>
                <span className="hidden sm:block text-xs font-bold text-brand-ink uppercase tracking-wide">{label}</span>
              </div>
              <div className={`h-1 rounded-full ${i <= step ? "bg-brand-green" : "bg-brand-line"}`} />
            </button>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: dir * 48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -48 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
      {/* Étape 1 — Mon projet */}
      {step === 0 && (
        <div data-testid="wizard-panel-project">
          <p className="font-bold text-xl sm:text-2xl text-brand-ink mb-4">Quel est votre projet ?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PROJETS.map((p) => {
              const Icon = p.icon;
              const active = answers.projet === p.value;
              return (
                <button key={p.value} type="button" onClick={() => setAnswer("projet", p.value)} data-testid={`project-card-${p.value}`} className={card(active)} aria-pressed={active}>
                  <Icon className={`h-5 w-5 mb-2 ${active ? "text-brand-green" : "text-brand-soft"}`} />
                  <span className="text-sm font-semibold text-brand-ink leading-tight">{p.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-brand-ink/60">Gratuit et sans engagement. La première étude est offerte.</p>
        </div>
      )}

      {/* Étape 2 — Mon logement */}
      {step === 1 && (
        <div className="space-y-5" data-testid="wizard-panel-home">
          <p className="font-bold text-xl sm:text-2xl text-brand-ink">Parlez-nous de votre logement</p>
          <Choice label="Vous êtes" value={answers.statut} onChange={(v) => setAnswer("statut", v)} testid="statut" options={[["proprietaire_occupant", "Propriétaire occupant"], ["proprietaire_bailleur", "Propriétaire bailleur"], ["locataire", "Locataire"], ["autre", "Autre"]]} />
          <Choice label="Type de logement" value={answers.type_logement} onChange={(v) => setAnswer("type_logement", v)} testid="type-logement" options={[["maison", "Maison individuelle"], ["appartement", "Appartement"], ["autre", "Autre"]]} />
          <Choice label="Logement de plus de 2 ans ?" value={answers.plus_de_2_ans} onChange={(v) => setAnswer("plus_de_2_ans", v)} testid="plus-de-2-ans" options={[["oui", "Oui"], ["non", "Non"], ["incertain", "Je ne sais pas"]]} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Surface chauffée (m²)" hint="Surface exacte, pas une tranche" testid="surface-input">
              <input type="number" min="9" max="3000" className="input-base" value={answers.surface} onChange={(e) => setAnswer("surface", e.target.value)} placeholder="ex. 120" />
            </Field>
            <Field label="Code postal" testid="code-postal-input">
              <input type="text" inputMode="numeric" maxLength={5} className="input-base" value={answers.code_postal} onChange={(e) => setAnswer("code_postal", e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="ex. 44300" />
            </Field>
            <Field label="Commune (optionnel)" testid="commune-input">
              <input type="text" className="input-base" value={answers.commune} onChange={(e) => setAnswer("commune", e.target.value)} placeholder="ex. Nantes" />
            </Field>
          </div>
        </div>
      )}

      {/* Étape 3 — Ma situation */}
      {step === 2 && (
        <div className="space-y-5" data-testid="wizard-panel-situation">
          <p className="font-bold text-xl sm:text-2xl text-brand-ink">Votre installation actuelle</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre d'occupants" testid="occupants-input">
              <input type="number" min="1" max="25" className="input-base" value={answers.occupants} onChange={(e) => setAnswer("occupants", e.target.value)} placeholder="ex. 4" />
            </Field>
          </div>
          <Choice label="Chauffage actuel" value={answers.chauffage_actuel} onChange={(v) => setAnswer("chauffage_actuel", v)} testid="chauffage-actuel" options={[["chaudiere_gaz", "Chaudière gaz"], ["chaudiere_fioul", "Chaudière fioul"], ["pac", "Pompe à chaleur"], ["radiateurs_electriques", "Radiateurs électriques"], ["autre", "Autre"], ["inconnu", "Je ne sais pas"]]} />
          <Choice label="Matériau des émetteurs (radiateurs)" value={answers.emetteurs} onChange={(v) => setAnswer("emetteurs", v)} testid="emetteurs" options={[["acier", "Acier"], ["aluminium", "Aluminium"], ["fonte", "Fonte"], ["autre", "Autre"], ["inconnu", "Je ne sais pas"]]} />
          <Choice label="Orientation de la toiture" value={answers.toiture_orientation} onChange={(v) => setAnswer("toiture_orientation", v)} testid="toiture-orientation" options={[["sud", "Sud"], ["est", "Est"], ["ouest", "Ouest"], ["nord", "Nord"], ["mixte", "Mixte"], ["inconnu", "Je ne sais pas"]]} />
          <Choice label="Surface de toiture utilisable d'au moins 16 m² ?" value={answers.surface_toiture_16m2} onChange={(v) => setAnswer("surface_toiture_16m2", v)} testid="toiture-16m2" options={[["oui", "Oui"], ["non", "Non"], ["inconnu", "Je ne sais pas"]]} help="16 m², c'est environ la place de 8 panneaux solaires thermiques." />
          <Choice label="Espace technique disponible ? (hauteur ≥ 2 m et accès de porte ≥ 70 cm)" value={answers.espace_technique} onChange={(v) => setAnswer("espace_technique", v)} testid="espace-technique" options={[["oui", "Oui"], ["non", "Non"], ["inconnu", "Je ne sais pas"]]} help="Pour accueillir le ballon de stockage : local d'au moins 2 m de hauteur avec une porte d'au moins 70 cm." />
        </div>
      )}

      {/* Étape 4 — Mes coordonnées */}
      {step === 3 && (
        <div className="space-y-5" data-testid="wizard-panel-contact">
          <p className="font-bold text-xl sm:text-2xl text-brand-ink">Où vous joindre ?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Prénom" testid="prenom-input">
              <input type="text" className="input-base" value={contact.prenom} onChange={(e) => setContactField("prenom", e.target.value)} autoComplete="given-name" placeholder="Prénom" />
            </Field>
            <Field label="Nom" testid="nom-input">
              <input type="text" className="input-base" value={contact.nom} onChange={(e) => setContactField("nom", e.target.value)} autoComplete="family-name" placeholder="Nom" />
            </Field>
            <Field label="Téléphone" testid="telephone-input">
              <input type="tel" className="input-base" value={contact.telephone} onChange={(e) => setContactField("telephone", e.target.value)} autoComplete="tel" placeholder="06 12 34 56 78" />
            </Field>
            <Field label="E-mail" testid="email-input">
              <input type="email" className="input-base" value={contact.email} onChange={(e) => setContactField("email", e.target.value)} autoComplete="email" placeholder="vous@exemple.fr" />
            </Field>
          </div>

          {/* Honeypot invisible */}
          <input type="text" name="website" value={honey} onChange={(e) => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute opacity-0 pointer-events-none h-0 w-0" />

          <label className="flex items-start gap-3 rounded-[4px] border border-brand-line bg-brand-ivory p-4 cursor-pointer">
            <input type="checkbox" checked={contactOk} onChange={(e) => setContactOk(e.target.checked)} data-testid="consent-contact-checkbox" className="mt-0.5 h-5 w-5 accent-[#155C45] shrink-0" />
            <span className="text-xs text-brand-ink/80 leading-relaxed">
              <strong className="text-brand-ink">Case obligatoire.</strong> {meta?.consent_contact_text || "Je confirme ma demande d'être recontacté(e) au sujet de l'étude gratuite de mon projet. Mes informations seront transmises au destinataire désigné de ma demande."}{" "}
              Destinataire : <strong>{meta?.recipient || "à configurer"}</strong>.{" "}
              <a href="/confidentialite/" className="underline text-brand-green">Politique de confidentialité</a>.
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer px-1">
            <input type="checkbox" checked={marketingOk} onChange={(e) => setMarketingOk(e.target.checked)} data-testid="consent-marketing-checkbox" className="mt-0.5 h-5 w-5 accent-[#155C45] shrink-0" />
            <span className="text-xs text-brand-ink/70 leading-relaxed">
              Facultatif — {meta?.consent_marketing_text || "J'accepte de recevoir des communications commerciales de Aides Énergie France (facultatif)."}
            </span>
          </label>

          {favorable && (
            <div className="rounded-[4px] border border-brand-green/30 bg-brand-green/[0.04] p-4" data-testid="slot-picker-zone">
              <p className="flex items-center gap-2 text-sm font-bold text-brand-ink mb-1">
                <CheckCircle2 className="h-4 w-4 text-brand-green" /> Votre projet semble correspondre aux premiers critères
              </p>
              <p className="text-xs text-brand-ink/65 mb-3">
                Choisissez dès maintenant le créneau de votre rappel pour votre étude gratuite
                (optionnel — sinon, nous vous rappelons dès que possible).
              </p>
              <SlotPicker value={callbackSlot} onChange={setCallbackSlot} testPrefix="wizard" />
            </div>
          )}

          <p className="flex items-center gap-2 text-xs text-brand-ink/60">
            <ShieldCheck className="h-4 w-4 text-brand-green" />
            Gratuit et sans engagement · Aucun justificatif demandé à ce stade · Vos données ne sont jamais revendues.
          </p>
        </div>
      )}
        </motion.div>
      </AnimatePresence>

      {/* Erreurs */}
      {touchedStep && !stepValid && step < 3 && (
        <p className="mt-4 rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3" data-testid="wizard-error" role="alert">
          {validateStep(step)[0]}
        </p>
      )}
      {touchedStep && step === 3 && error && (
        <p className="mt-4 rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3" data-testid="wizard-submit-error" role="alert">
          {error || "Merci de compléter les champs signalés."}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={prev} data-testid="wizard-back-btn" className="btn-outline !px-5 !py-3 !text-sm">
            <ArrowLeft className="h-4 w-4" /> Précédent
          </button>
        ) : (
          <span className="text-xs text-brand-ink/50 hidden sm:block">Réponse en 2 minutes, sans création de compte</span>
        )}
        {step < 3 ? (
          <button type="button" onClick={next} data-testid="wizard-next-btn" className="btn-primary !px-8 !py-3">
            Suivant <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting} data-testid="wizard-submit-btn" className="btn-primary !px-8 !py-3 disabled:opacity-60 disabled:hover:translate-y-0">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</> : <>Envoyer ma demande <ArrowRight className="h-4 w-4" /></>}
          </button>
        )}
      </div>
    </div>
  );
}

function Choice({ label, value, onChange, options, testid, help }) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-brand-ink mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2" data-testid={`choice-group-${testid}`}>
        {options.map(([v, l]) => (
          <button key={v} type="button" onClick={() => onChange(v)} data-testid={`${testid}-option-${v}`} className={`chip ${value === v ? "chip-active" : ""}`} aria-pressed={value === v}>
            {l}
          </button>
        ))}
      </div>
      {help && <p className="mt-2 text-xs text-brand-ink/55">{help}</p>}
    </fieldset>
  );
}

function Field({ label, children, hint, testid }) {
  return (
    <label className="block" data-testid={testid}>
      <span className="text-sm font-semibold text-brand-ink block mb-2">
        {label}
        {hint && <span className="block text-xs font-normal text-brand-ink/55 mt-0.5">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
