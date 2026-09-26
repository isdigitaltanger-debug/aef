import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";

export default function Regles() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-rules"],
    queryFn: () => api.get("/admin/rules").then((r) => r.data),
  });
  const [json, setJson] = useState("");
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data?.latest) {
      const { updated_at, updated_by, ...cfg } = data.latest;
      setJson(JSON.stringify(cfg, null, 2));
      setVerified(!!data.latest.verified);
    }
  }, [data]);

  const save = async () => {
    setBusy(true);
    try {
      const cfg = JSON.parse(json);
      cfg.verified = verified;
      await api.put("/admin/rules", cfg);
      toast.success(`Règles enregistrées (version ${cfg.version + 1}).`);
      qc.invalidateQueries({ queryKey: ["admin-rules"] });
    } catch (e) {
      if (e instanceof SyntaxError) toast.error("JSON invalide : " + e.message);
      else toast.error(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <div className="flex items-center gap-2 text-brand-ink/60"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  return (
    <div className="max-w-4xl" data-testid="admin-rules-page">
      <h1 className="h-serif text-2xl sm:text-3xl font-semibold mb-2">Règles de qualification</h1>
      <p className="text-sm text-brand-ink/60 mb-6">
        Chaque enregistrement crée une nouvelle version. Le résultat affiché au public reste une
        préqualification commerciale — jamais une décision d'éligibilité.
      </p>

      <label className="flex items-center gap-3 mb-4 cursor-pointer">
        <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} data-testid="rules-verified-toggle" className="h-5 w-5 accent-[#155C45]" />
        <span className="text-sm font-semibold text-brand-ink">Règles recoupées avec la source officielle (table des zones vérifiée)</span>
      </label>

      <textarea
        rows={24}
        className="input-base font-mono !text-xs mb-4"
        value={json}
        onChange={(e) => setJson(e.target.value)}
        data-testid="rules-json-editor"
        spellCheck="false"
      />
      <button onClick={save} disabled={busy} data-testid="rules-save-btn" className="btn-primary !py-2.5 !text-sm disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Créer une nouvelle version</>}
      </button>

      <div className="card p-6 mt-8" data-testid="rules-history">
        <p className="eyebrow mb-4">Historique des versions</p>
        {data.history.map((h) => (
          <div key={h.version} className="text-sm border-b border-brand-line last:border-0 py-2 flex justify-between">
            <span className="font-semibold text-brand-ink">v{h.version}</span>
            <span className="text-xs text-brand-ink/55">{h.updated_at ? new Date(h.updated_at).toLocaleString("fr-FR") : "—"} · {h.updated_by || "système"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
