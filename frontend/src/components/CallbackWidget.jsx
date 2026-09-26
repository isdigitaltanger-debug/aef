import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CheckCircle2, Loader2, Phone, X } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";

export function SlotPicker({ value, onChange, testPrefix }) {
  const [planning, setPlanning] = useState(null);
  const [dayIdx, setDayIdx] = useState(0);

  useEffect(() => {
    let live = true;
    api.get("/slots", { params: { days: 4 } })
      .then((r) => { if (live) setPlanning(r.data.days || []); })
      .catch(() => { if (live) setPlanning([]); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (planning && value) {
      const day = planning[dayIdx];
      const t = value.split(" · ").pop();
      const slot = day?.slots?.find((x) => x.time === t);
      if (slot && !slot.available) onChange("");
    }
  }, [planning, dayIdx, value, onChange]);

  if (!planning) return <p className="text-xs text-brand-ink/50">Chargement des créneaux…</p>;
  if (!planning.length) {
    return <p className="text-xs text-brand-ink/50">Planning momentanément indisponible : vous serez rappelé(e) dès que possible.</p>;
  }

  const day = planning[Math.min(dayIdx, planning.length - 1)];
  return (
    <div data-testid={`${testPrefix}-slot-picker`} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {planning.map((d, i) => (
          <button
            key={d.date}
            type="button"
            onClick={() => setDayIdx(i)}
            data-testid={`${testPrefix}-day-${i}`}
            className={`chip ${i === dayIdx ? "chip-active" : ""}`}
            aria-pressed={i === dayIdx}
          >
            {d.day_label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {day.slots.map((s, i) => {
          const label = `${day.day_label} · ${s.time}`;
          const active = value === label;
          if (!s.available) {
            return (
              <span
                key={s.time}
                data-testid={`${testPrefix}-slot-${i}-complet`}
                className="rounded-[4px] border border-brand-line bg-brand-ivory px-3 py-2.5 text-xs font-semibold text-brand-ink/35 text-center cursor-not-allowed select-none"
              >
                {s.time} · complet
              </span>
            );
          }
          return (
            <button
              key={s.time}
              type="button"
              onClick={() => onChange(label)}
              data-testid={`${testPrefix}-slot-${i}`}
              className={`rounded-[4px] border px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                active ? "border-brand-green bg-brand-green text-white" : "border-[#C9D1D8] bg-white text-brand-ink/75 hover:border-brand-green hover:text-brand-green"
              }`}
              aria-pressed={active}
            >
              {s.time}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-brand-ink/50">
        Environ 65 % des créneaux restent ouverts à la réservation ; un créneau réservé est retiré du planning.
      </p>
    </div>
  );
}

export default function CallbackWidget() {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [phone, setPhone] = useState("");
  const [slot, setSlot] = useState("");
  const [dayIdx, setDayIdx] = useState(0);
  const [consent, setConsent] = useState(false);
  const [honey, setHoney] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) setError("");
  }, [open]);

  const submit = async () => {
    setError("");
    if (!nom.trim()) return setError("Indiquez votre nom.");
    if (!/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.\-]*\d{2}){4}$/.test(phone)) return setError("Indiquez un téléphone français valide.");
    if (!consent) return setError("Merci de cocher la case de consentement.");
    setBusy(true);
    try {
      const { data } = await api.post("/callback", { nom, telephone: phone, slot, contact_ok: consent, website: honey });
      setDone(data.reference);
      toast.success("Votre demande de rappel est enregistrée.");
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setOpen(false);
    setDone(null);
    setNom("");
    setPhone("");
    setSlot("");
    setConsent(false);
    setDayIdx(0);
  };

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-[80] flex flex-col items-end gap-3" data-testid="callback-widget">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="card w-[calc(100vw-2rem)] sm:w-96 border-t-4 border-t-brand-green shadow-2xl"
            data-testid="callback-panel"
          >
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <p className="flex items-center gap-2 font-bold text-brand-ink">
                <Phone className="h-4 w-4 text-brand-green" /> Me faire rappeler
              </p>
              <button onClick={reset} data-testid="callback-close-btn" aria-label="Fermer" className="text-brand-ink/50 hover:text-brand-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            {done ? (
              <div className="p-5 text-center" data-testid="callback-success">
                <CheckCircle2 className="h-10 w-10 text-brand-green mx-auto mb-3" />
                <p className="font-bold text-brand-ink mb-1">Demande enregistrée</p>
                <p className="text-sm text-brand-ink/70 mb-3">
                  {slot ? `Nous vous rappellerons le ${slot.replace(" · ", " entre ")}.` : "Nous vous rappellerons dès que possible."}
                </p>
                <p className="font-mono text-xs text-brand-green">{done}</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <p className="text-sm text-brand-ink/70 leading-relaxed">
                  Laissez votre numéro : nous vous rappelons pour échanger sur votre projet, même
                  sans avoir rempli la simulation. Gratuit et sans engagement.
                </p>
                <input className="input-base" placeholder="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)} data-testid="callback-nom-input" />
                <input className="input-base" type="tel" placeholder="Votre téléphone (ex. 06 12 34 56 78)" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="callback-phone-input" />

                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-brand-ink mb-2">
                    <CalendarCheck className="h-4 w-4 text-brand-green" /> Choisir un créneau (optionnel)
                  </p>
                  <SlotPicker value={slot} onChange={setSlot} testPrefix="callback" />
                  {slot && (
                    <button type="button" onClick={() => setSlot("")} className="mt-2 text-xs font-semibold text-brand-green hover:underline" data-testid="callback-slot-reset">
                      Pas de créneau particulier — être rappelé(e) dès que possible
                    </button>
                  )}
                </div>

                <input type="text" name="website" value={honey} onChange={(e) => setHoney(e.target.value)} tabIndex={-1} aria-hidden="true" className="absolute opacity-0 pointer-events-none h-0 w-0" autoComplete="off" />

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} data-testid="callback-consent-checkbox" className="mt-0.5 h-5 w-5 accent-[#155C45] shrink-0" />
                  <span className="text-xs text-brand-ink/75 leading-relaxed">
                    J'accepte d'être rappelé(e) au sujet de mon projet. Mes données ne servent qu'à
                    ce rappel. <a href="/confidentialite/" className="underline text-brand-green">Politique de confidentialité</a>.
                  </span>
                </label>

                {error && (
                  <p className="rounded-[4px] bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3" data-testid="callback-error" role="alert">
                    {error}
                  </p>
                )}

                <button onClick={submit} disabled={busy} data-testid="callback-submit-btn" className="btn-primary w-full disabled:opacity-60">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Être rappelé(e) <Phone className="h-4 w-4" /></>}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => (done ? reset() : setOpen(!open))}
        data-testid="callback-fab-btn"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-brand-green hover:bg-brand-green-dark text-white text-sm font-semibold px-5 py-3.5 shadow-[0_8px_24px_-6px_rgba(21,92,69,0.5)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
      >
        <Phone className="h-4 w-4" /> Me faire rappeler
      </button>
    </div>
  );
}
