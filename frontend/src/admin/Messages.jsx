import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";

export default function Messages() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => api.get("/admin/messages").then((r) => r.data),
  });

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/admin/messages/${id}`, { status });
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Statut mis à jour.");
    } catch (e) {
      toast.error(apiError(e));
    }
  };

  if (isLoading) return <div className="flex items-center gap-2 text-brand-ink/60"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  return (
    <div data-testid="admin-messages-page">
      <h1 className="h-serif text-2xl sm:text-3xl font-semibold mb-6">Messages de contact</h1>
      {data.items.length === 0 ? (
        <div className="card p-10 text-center" data-testid="messages-empty">
          <p className="font-serif text-xl text-brand-ink mb-2">Aucun message</p>
          <p className="text-sm text-brand-ink/60">Les messages envoyés depuis la page Contact apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((m) => (
            <div key={m.id} className="card p-6" data-testid={`message-card-${m.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-brand-ink">{m.nom} <span className="text-xs font-normal text-brand-ink/55">· {m.email}</span></p>
                  <p className="text-xs text-brand-ink/50">{new Date(m.created_at).toLocaleString("fr-FR")}{m.sujet ? ` — ${m.sujet}` : ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStatus(m.id, "traite")} data-testid={`message-mark-traite-${m.id}`} className={`chip ${m.status === "traite" ? "chip-active" : ""}`}>traité</button>
                  <button onClick={() => setStatus(m.id, "archive")} data-testid={`message-mark-archive-${m.id}`} className={`chip ${m.status === "archive" ? "chip-active" : ""}`}>archivé</button>
                </div>
              </div>
              <p className="text-sm text-brand-ink/80 leading-relaxed">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
