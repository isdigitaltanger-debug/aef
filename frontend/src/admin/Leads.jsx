import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2, Search } from "lucide-react";
import api, { API_BASE } from "../lib/api";

const STATUS_COLORS = {
  nouveau: "bg-blue-50 text-blue-700 border-blue-200",
  a_verifier: "bg-amber-50 text-amber-700 border-amber-200",
  prequalifie: "bg-emerald-50 text-emerald-700 border-emerald-200",
  transmis: "bg-violet-50 text-violet-700 border-violet-200",
  contacte: "bg-cyan-50 text-cyan-700 border-cyan-200",
  audit: "bg-teal-50 text-teal-700 border-teal-200",
  valide: "bg-green-50 text-green-700 border-green-200",
  refuse: "bg-red-50 text-red-700 border-red-200",
  installe: "bg-green-50 text-green-700 border-green-200",
  commission_facturee: "bg-orange-50 text-orange-700 border-orange-200",
  encaissee: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

export default function Leads() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const status = params.get("status") || "";
  const q = params.get("q") || "";
  const [search, setSearch] = useState(q);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-leads", { page, status, q }],
    queryFn: () => api.get("/admin/leads", { params: { page, status, q } }).then((r) => r.data),
  });

  const update = (patch) => {
    const next = { page: 1, status, q };
    Object.entries(patch).forEach(([k, v]) => (v ? (next[k] = v) : delete next[k]));
    setParams(next);
  };

  return (
    <div data-testid="admin-leads-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="h-serif text-2xl sm:text-3xl font-semibold">Leads ({data?.total ?? "…"})</h1>
        <a href={`${API_BASE}/api/admin/leads/export`} data-testid="leads-export-csv" className="btn-outline !py-2.5 !px-4 !text-sm">
          <Download className="h-4 w-4" /> Export CSV sécurisé
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6" data-testid="leads-filters">
        <select className="input-base sm:w-56" value={status} onChange={(e) => update({ status: e.target.value })} data-testid="leads-status-filter">
          <option value="">Tous les statuts</option>
          {(data?.statuts || []).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <form className="relative flex-1 max-w-sm" onSubmit={(e) => { e.preventDefault(); update({ q: search }); }}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-ink/40" />
          <input className="input-base !pl-10" placeholder="Nom, e-mail, téléphone, référence…" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="leads-search-input" />
        </form>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-brand-ink/60"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
      ) : data.items.length === 0 ? (
        <div className="card p-10 text-center" data-testid="leads-empty">
          <p className="font-serif text-xl text-brand-ink mb-2">Aucun lead trouvé</p>
          <p className="text-sm text-brand-ink/60">Les demandes soumises depuis le site apparaîtront ici.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto" data-testid="leads-table">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-brand-ink/50 border-b border-brand-line">
                <th className="p-4">Référence</th><th className="p-4">Contact</th><th className="p-4">Projet</th><th className="p-4">Préqualif.</th><th className="p-4">Statut</th><th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((l) => (
                <tr key={l.id} className="border-b border-brand-line last:border-0 hover:bg-brand-ivory/60">
                  <td className="p-4"><Link to={`/administration/leads/${l.id}`} className="font-mono text-xs text-brand-green hover:underline" data-testid={`leads-row-${l.reference}`}>{l.reference}</Link></td>
                  <td className="p-4">
                    <p className="font-medium text-brand-ink">{l.contact?.prenom} {l.contact?.nom}</p>
                    <p className="text-xs text-brand-ink/55">{l.contact?.email}</p>
                  </td>
                  <td className="p-4 text-xs text-brand-ink/70">{l.answers?.projet}<br /><span className="text-brand-ink/50">{l.answers?.code_postal} · {l.answers?.surface} m²</span></td>
                  <td className="p-4"><span className="text-xs font-semibold text-brand-ink/80">{l.prequal?.status_label}</span></td>
                  <td className="p-4"><span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[l.status_admin] || "bg-gray-50 text-gray-600 border-gray-200"}`}>{l.status_admin}</span></td>
                  <td className="p-4 text-xs text-brand-ink/55">{new Date(l.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="btn-outline !py-2 !px-4 !text-sm" disabled={page <= 1} onClick={() => setParams({ page: page - 1, status, q })} data-testid="leads-prev-page">Précédent</button>
          <span className="text-sm text-brand-ink/60">Page {page} / {data.pages}</span>
          <button className="btn-outline !py-2 !px-4 !text-sm" disabled={page >= data.pages} onClick={() => setParams({ page: page + 1, status, q })} data-testid="leads-next-page">Suivant</button>
        </div>
      )}
    </div>
  );
}
