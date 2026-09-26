import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";

export default function Partners() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: () => api.get("/admin/partners").then((r) => r.data),
  });
  const { data: consents } = useQuery({
    queryKey: ["admin-consents"],
    queryFn: () => api.get("/admin/consent-versions").then((r) => r.data),
  });

  const [form, setForm] = useState({ raison_sociale: "", contact_email: "", note: "", active: true });

  const add = async () => {
    try {
      await api.post("/admin/partners", form);
      toast.success("Partenaire ajouté.");
      qc.invalidateQueries({ queryKey: ["admin-partners"] });
      setForm({ raison_sociale: "", contact_email: "", note: "", active: true });
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (isLoading) return <div className="flex items-center gap-2 text-brand-ink/60"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  return (
    <div data-testid="admin-partners-page">
      <h1 className="h-serif text-2xl sm:text-3xl font-semibold mb-6">Partenaires destinataires</h1>
      <div className="grid gap-5 lg:grid-cols-2 mb-10">
        <div className="card p-6" data-testid="partners-list">
          <p className="eyebrow mb-4">Destinataires actifs</p>
          {data.items.map((p) => (
            <div key={p.id} className="border-b border-brand-line last:border-0 py-3 text-sm">
              <p className="font-semibold text-brand-ink">{p.raison_sociale} {p.active && <span className="text-xs text-brand-green font-semibold">· actif</span>}</p>
              <p className="text-xs text-brand-ink/55">{p.contact_email || "—"} — {p.note}</p>
            </div>
          ))}
          {data.items.length === 0 && <p className="text-sm text-brand-ink/55">Aucun partenaire — le formulaire affichera « à configurer ».</p>}
        </div>
        <div className="card p-6" data-testid="partner-add-form">
          <p className="eyebrow mb-4">Ajouter / remplacer</p>
          <div className="space-y-3">
            <input className="input-base" placeholder="Raison sociale exacte" value={form.raison_sociale} onChange={(e) => setForm({ ...form, raison_sociale: e.target.value })} data-testid="partner-name-input" />
            <input className="input-base" placeholder="E-mail de contact" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} data-testid="partner-email-input" />
            <input className="input-base" placeholder="Note interne" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} data-testid="partner-note-input" />
            <button onClick={add} className="btn-primary !py-2.5 !text-sm" data-testid="partner-add-btn">Ajouter le partenaire</button>
          </div>
        </div>
      </div>

      <h2 className="h-serif text-xl font-semibold mb-4">Textes de consentement versionnés</h2>
      <div className="card p-6" data-testid="consent-versions">
        {(consents?.items || []).map((c) => (
          <div key={c.version} className="border-b border-brand-line last:border-0 py-3 text-sm">
            <p className="font-semibold text-brand-ink">Version v{c.version} — destinataire : {c.recipient}</p>
            <p className="text-xs text-brand-ink/60 mt-1">{c.contact_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
