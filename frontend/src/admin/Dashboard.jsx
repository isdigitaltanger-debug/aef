import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../lib/api";

const STATUS_COLORS = {
  nouveau: "bg-blue-50 text-blue-700 border-blue-200",
  a_verifier: "bg-amber-50 text-amber-700 border-amber-200",
  prequalifie: "bg-emerald-50 text-emerald-700 border-emerald-200",
  transmis: "bg-violet-50 text-violet-700 border-violet-200",
  contacte: "bg-cyan-50 text-cyan-700 border-cyan-200",
  valide: "bg-green-50 text-green-700 border-green-200",
  refuse: "bg-red-50 text-red-700 border-red-200",
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get("/admin/dashboard").then((r) => r.data),
    refetchInterval: 30000,
  });

  if (isLoading || !data) return <div className="flex items-center gap-2 text-brand-ink/60"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  const stats = [
    { label: "Leads total", value: data.total_leads, testid: "dashboard-total-leads" },
    { label: "Aujourd'hui", value: data.today_leads, testid: "dashboard-today-leads" },
    { label: "Messages non traités", value: data.new_messages, testid: "dashboard-new-messages" },
  ];

  return (
    <div data-testid="admin-dashboard">
      <h1 className="h-serif text-2xl sm:text-3xl font-semibold mb-6">Tableau de bord</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-6" data-testid={s.testid}>
            <p className="text-xs uppercase tracking-wider text-brand-ink/50 mb-1">{s.label}</p>
            <p className="font-serif text-4xl text-brand-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2 mb-8">
        <div className="card p-6">
          <p className="eyebrow mb-4">Leads par statut de travail</p>
          <table className="w-full text-sm" data-testid="dashboard-by-status">
            <tbody>
              {Object.entries(data.by_admin_status).length === 0 && <tr><td className="text-brand-ink/50 py-2">Aucun lead pour l'instant</td></tr>}
              {Object.entries(data.by_admin_status).map(([k, v]) => (
                <tr key={k} className="border-t border-brand-line first:border-0">
                  <td className="py-2 font-medium text-brand-ink/80">{k}</td>
                  <td className="py-2 text-right font-bold text-brand-ink">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-6">
          <p className="eyebrow mb-4">Par préqualification & source</p>
          <table className="w-full text-sm" data-testid="dashboard-by-prequal">
            <tbody>
              {Object.entries(data.by_prequal).map(([k, v]) => (
                <tr key={k} className="border-t border-brand-line first:border-0">
                  <td className="py-2 font-medium text-brand-ink/80">{k}</td>
                  <td className="py-2 text-right font-bold text-brand-ink">{v}</td>
                </tr>
              ))}
              {Object.entries(data.by_source).map(([k, v]) => (
                <tr key={k} className="border-t border-brand-line">
                  <td className="py-2 font-medium text-brand-ink/60">source : {k}</td>
                  <td className="py-2 text-right text-brand-ink/70">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="eyebrow">Derniers leads</p>
          <Link to="/administration/leads" data-testid="dashboard-all-leads" className="text-xs font-semibold text-brand-green hover:underline">Tout voir →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="dashboard-recent-leads">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-brand-ink/50 border-b border-brand-line">
                <th className="py-2 pr-4">Référence</th><th className="py-2 pr-4">Contact</th><th className="py-2 pr-4">Statut</th><th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_leads.map((l) => (
                <tr key={l.reference} className="border-b border-brand-line last:border-0">
                  <td className="py-2.5 pr-4"><Link to={`/administration/leads/${l.id || l.reference}`} className="font-mono text-xs text-brand-green hover:underline" data-testid={`dashboard-lead-${l.reference}`}>{l.reference}</Link></td>
                  <td className="py-2.5 pr-4">{l.contact?.prenom} {l.contact?.nom}</td>
                  <td className="py-2.5 pr-4"><span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[l.status_admin] || "bg-gray-50 text-gray-600 border-gray-200"}`}>{l.status_admin}</span></td>
                  <td className="py-2.5 text-xs text-brand-ink/55">{new Date(l.created_at).toLocaleString("fr-FR")}</td>
                </tr>
              ))}
              {data.recent_leads.length === 0 && <tr><td colSpan={4} className="py-4 text-brand-ink/50">Aucun lead pour l'instant — créez un lead de test pour vérifier la chaîne.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
