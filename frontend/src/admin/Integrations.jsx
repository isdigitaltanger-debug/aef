import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";

export default function Integrations() {
  const qc = useQueryClient();
  const [testTo, setTestTo] = useState("");
  const [sending, setSending] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-integrations"],
    queryFn: () => api.get("/admin/integrations").then((r) => r.data),
  });

  const sendTest = async () => {
    setSending(true);
    try {
      const { data: r } = await api.post("/admin/email/test", { to: testTo || null, with_client_copy: true });
      toast.success(`E-mail test envoyé à ${r.to} (${r.reference}) — vérifiez la boîte de réception et les spams.`);
      qc.invalidateQueries({ queryKey: ["admin-integrations"] });
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSending(false);
    }
  };

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

      <div className="card p-6 mb-10" data-testid="integration-email-test">
        <p className="eyebrow mb-2">E-mail test — dossier fictif complet</p>
        <p className="text-sm text-brand-ink/70 mb-4">
          Envoie un dossier de démonstration (fiche équipe + PDF, puis accusé de réception « client » + PDF récapitulatif).
          Destinataire interne : <strong>{data.email.internal_email || "—"}</strong>. Laissez vide pour l'utiliser, ou indiquez une autre adresse.
        </p>
        <div className="flex flex-wrap gap-3">
          <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder={data.email.internal_email} className="input-base !w-auto flex-1 min-w-[240px]" data-testid="email-test-to" />
          <button onClick={sendTest} disabled={sending || !data.email.configured} className="btn-primary !py-2.5 !text-sm disabled:opacity-60" data-testid="email-test-send">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer le mail test
          </button>
        </div>
        {!data.email.configured && <p className="text-xs text-amber-700 mt-3" data-testid="email-test-disabled">Gmail SMTP non configuré : renseignez le mot de passe d'application dans le fichier .env du serveur.</p>}
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
