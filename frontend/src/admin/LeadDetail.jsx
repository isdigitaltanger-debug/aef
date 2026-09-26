import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";
import { useAuth } from "./AdminApp";

const LABELS = {
  projet: "Type de projet", statut: "Statut", type_logement: "Type de logement",
  plus_de_2_ans: "Logement > 2 ans", surface: "Surface chauffée", code_postal: "Code postal",
  commune: "Commune", occupants: "Occupants", chauffage_actuel: "Chauffage actuel",
  emetteurs: "Émetteurs", toiture_orientation: "Orientation toiture",
  surface_toiture_16m2: "Toiture ≥ 16 m²", espace_technique: "Espace technique",
  normalized_phone: "Téléphone normalisé", callback_slot: "Créneau de rappel souhaité",
};

const VALUE_LABELS = { rappel_telephonique: "Demande de rappel téléphonique" };

export default function LeadDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [com, setCom] = useState({});

  const { data: lead, isLoading } = useQuery({
    queryKey: ["admin-lead", id],
    queryFn: () => api.get(`/admin/leads/${id}`).then((r) => r.data),
  });

  useEffect(() => {
    if (lead) {
      setStatus(lead.status_admin);
      setNotes(lead.notes || "");
      setCom(lead.commission || {});
    }
  }, [lead]);

  const save = async () => {
    try {
      await api.patch(`/admin/leads/${id}`, {
        status_admin: status, notes,
        commission: user?.role === "admin" ? com : undefined,
      });
      toast.success("Lead mis à jour.");
      qc.invalidateQueries({ queryKey: ["admin-lead", id] });
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (isLoading || !lead) return <div className="flex items-center gap-2 text-brand-ink/60"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  const p = lead.prequal || {};

  return (
    <div data-testid="admin-lead-detail">
      <Link to="/administration/leads" className="text-sm text-brand-green hover:underline flex items-center gap-1 mb-5" data-testid="lead-back-link">
        <ArrowLeft className="h-4 w-4" /> Tous les leads
      </Link>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h1 className="h-serif text-2xl sm:text-3xl font-semibold font-mono">{lead.reference}</h1>
        <span className="chip !cursor-default">{lead.source}</span>
        <span className={`chip !cursor-default ${lead.transmitted ? "!bg-brand-green !text-white !border-brand-green" : ""}`}>
          {lead.transmitted ? "transmis" : "non transmis"}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <p className="eyebrow mb-4">Contact</p>
          <dl className="text-sm space-y-2" data-testid="lead-contact">
            <Row k="Nom" v={`${lead.contact?.prenom} ${lead.contact?.nom}`} />
            <Row k="Téléphone" v={lead.contact?.telephone} />
            <Row k="E-mail" v={lead.contact?.email} />
            <Row k="Contact demandé" v={lead.contact_ok ? "oui" : "non"} />
            <Row k="Marketing accepté" v={lead.marketing_ok ? "oui" : "non"} />
            <Row k="UTM" v={Object.keys(lead.utm || {}).length ? JSON.stringify(lead.utm) : "aucun"} />
          </dl>
        </div>

        <div className="card p-6">
          <p className="eyebrow mb-4">Réponses du formulaire</p>
          <dl className="text-sm space-y-2" data-testid="lead-answers">
            {Object.entries(LABELS).map(([k, label]) => lead.answers?.[k] !== undefined && lead.answers[k] !== "" && (
              <Row key={k} k={label} v={VALUE_LABELS[lead.answers[k]] || String(lead.answers[k])} />
            ))}
          </dl>
        </div>

        <div className="card p-6">
          <p className="eyebrow mb-4">Préqualification ({p.status_label})</p>
          <p className="text-sm text-brand-ink/80 mb-3" data-testid="lead-prequal-headline">{p.headline}</p>
          <ul className="text-sm space-y-1.5 text-brand-ink/70">
            {(p.messages || []).map((m, i) => <li key={i}>· {m}</li>)}
            {(p.orientations || []).map((m, i) => <li key={`o${i}`}>· {m}</li>)}
          </ul>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="chip !cursor-default">Zone : {p.zone}</span>
            <span className="chip !cursor-default">Pack : {p.pack_kw ? `${p.pack_kw} kW${p.pack_confirmed ? "" : " (à confirmer)"}` : "à définir"}</span>
          </div>
          <p className="mt-3 text-[11px] text-brand-ink/50">{p.disclaimer}</p>
        </div>

        <div className="card p-6">
          <p className="eyebrow mb-4">Consentement & transmission</p>
          <dl className="text-sm space-y-2" data-testid="lead-consent">
            <Row k="Version de consentement" v={`v${lead.consent?.version ?? "?"}`} />
            <Row k="Destinataire" v={lead.consent?.recipient || "—"} />
            <Row k="Horodatage" v={lead.consent?.timestamp ? new Date(lead.consent.timestamp).toLocaleString("fr-FR") : "—"} />
            <Row k="Transmission" v={`${lead.transmission?.state} — ${lead.transmission?.detail || ""}`} />
          </dl>
        </div>

        <div className="card p-6 lg:col-span-2">
          <p className="eyebrow mb-4">Traitement du dossier</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-brand-ink block mb-2">Statut de travail</span>
                <select className="input-base" value={status} onChange={(e) => setStatus(e.target.value)} data-testid="lead-status-select">
                  {["nouveau", "a_verifier", "prequalifie", "transmis", "contacte", "audit", "valide", "refuse", "installe", "commission_facturee", "encaissee"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-brand-ink block mb-2">Notes internes</span>
                <textarea rows={4} className="input-base" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="lead-notes-input" />
              </label>
            </div>
            {user?.role === "admin" && (
              <div className="space-y-4" data-testid="lead-commissions">
                <p className="text-sm font-semibold text-brand-ink">Commissions (usage interne — jamais affiché publiquement)</p>
                {["montant_prevu", "montant_facture", "montant_encaisse"].map((k) => (
                  <label key={k} className="block">
                    <span className="text-xs text-brand-ink/60 block mb-1.5">{k}</span>
                    <input type="number" step="0.01" className="input-base" value={com[k] ?? ""} onChange={(e) => setCom({ ...com, [k]: e.target.value === "" ? null : Number(e.target.value) })} data-testid={`lead-commission-${k}`} />
                  </label>
                ))}
              </div>
            )}
          </div>
          <button onClick={save} className="btn-primary mt-5 !py-2.5 !text-sm" data-testid="lead-save-btn">
            <Save className="h-4 w-4" /> Enregistrer
          </button>
        </div>

        <div className="card p-6 lg:col-span-2">
          <p className="eyebrow mb-4">Historique</p>
          <ul className="space-y-3" data-testid="lead-events">
            {(lead.events || []).slice().reverse().map((ev) => (
              <li key={ev._id || ev.ts} className="text-sm border-l-2 border-brand-gold/50 pl-4">
                <p className="text-brand-ink/80">{ev.detail || ev.type}</p>
                <p className="text-xs text-brand-ink/50">{new Date(ev.ts).toLocaleString("fr-FR")} · {ev.actor}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-6 border-b border-brand-line/60 last:border-0 pb-1.5">
      <dt className="text-brand-ink/55 shrink-0">{k}</dt>
      <dd className="text-brand-ink font-medium text-right break-all">{v || "—"}</dd>
    </div>
  );
}
