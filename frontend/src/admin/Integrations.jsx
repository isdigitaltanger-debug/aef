import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import api from "../lib/api";

export default function Integrations() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-integrations"],
    queryFn: () => api.get("/admin/integrations").then((r) => r.data),
  });

  if (isLoading || !data) return <div className="flex items-center gap-2 text-brand-ink/60"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  const cards = [
    { title: "Webhook n8n / CRM", state: data.webhook_n8n.configured, detail: data.webhook_n8n.configured ? `Variable ${data.webhook_n8n.env} configurée.` : `Variable ${data.webhook_n8n.env} absente : les leads sont conservés en base, aucun envoi externe.` , id: "integration-webhook" },
    { title: "Notifications e-mail", state: data.email.configured, detail: data.email.detail, id: "integration-email" },
    { title: "Google Analytics 4", state: data.ga4.configured, detail: data.ga4.detail, id: "integration-ga4" },
    { title: "Search Console", state: data.search_console.configured, detail: data.search_console.detail, id: "integration-sc" },
  ];

  return (
    <div data-testid="admin-integrations-page">
      <h1 className="h-serif text-2xl sm:text-3xl font-semibold mb-2">Intégrations & automatisations</h1>
      <p className="text-sm text-brand-ink/60 mb-6">
        État réel des branchements externes. Aucun état « configuré » n'est simulé : ce qui est
        éteint est indiqué comme tel, et les leads restent en base quoi qu'il arrive.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {cards.map((c) => (
          <div key={c.id} className="card p-6" data-testid={c.id}>
            <div className="flex items-center gap-2 mb-2">
              {c.state ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-amber-500" />}
              <p className="font-semibold text-brand-ink">{c.title}</p>
              <span className="chip !cursor-default !text-[10px] ml-auto">{c.state ? "configuré" : "non configuré"}</span>
            </div>
            <p className="text-sm text-brand-ink/70 leading-relaxed">{c.detail}</p>
          </div>
        ))}
      </div>

      <div className="card p-6" data-testid="integration-journal">
        <p className="eyebrow mb-4">Journal des exécutions (derniers événements)</p>
        {data.journal.length === 0 ? (
          <p className="text-sm text-brand-ink/55">Aucun événement pour l'instant.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-brand-ink/50 border-b border-brand-line">
                <th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">État</th><th className="py-2">Détail</th>
              </tr>
            </thead>
            <tbody>
              {data.journal.map((e, i) => (
                <tr key={i} className="border-b border-brand-line last:border-0">
                  <td className="py-2 pr-4 text-xs text-brand-ink/55 whitespace-nowrap">{new Date(e.created_at).toLocaleString("fr-FR")}</td>
                  <td className="py-2 pr-4 font-medium text-brand-ink/80">{e.type}</td>
                  <td className="py-2 pr-4"><span className={`text-xs font-semibold ${e.state === "succes" ? "text-green-600" : e.state === "echec" ? "text-red-600" : "text-amber-600"}`}>{e.state}</span></td>
                  <td className="py-2 text-xs text-brand-ink/65">{e.detail}{e.reference ? ` (${e.reference})` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
