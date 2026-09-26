import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, TestTube } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";

export default function TestLead() {
  const qc = useQueryClient();
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/admin/test-lead");
      setResult(data);
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast.success("Lead de test créé — il n'est jamais transmis au partenaire.");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl" data-testid="admin-test-lead-page">
      <h1 className="h-serif text-2xl sm:text-3xl font-semibold mb-2">Lead de test</h1>
      <p className="text-sm text-brand-ink/60 mb-6">
        Crée un lead clairement identifié comme fictif (nom « TEST — NE PAS TRANSMETTRE »). Il
        sert à vérifier la chaîne complète (création, préqualification, affichage dans la liste)
        sans jamais être envoyé au partenaire réel ni notifier qui que ce soit.
      </p>
      <button onClick={create} disabled={busy} data-testid="test-lead-create-btn" className="btn-primary disabled:opacity-60">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><TestTube className="h-4 w-4" /> Créer un lead de test</>}
      </button>

      {result && (
        <div className="card p-6 mt-6" data-testid="test-lead-result">
          <p className="text-xs uppercase tracking-wider text-brand-ink/50 mb-1">Référence créée</p>
          <p className="font-mono text-xl text-brand-green mb-4">{result.reference}</p>
          <p className="font-serif text-lg text-brand-ink mb-2">{result.prequal?.headline}</p>
          <p className="text-sm text-brand-ink/65">Statut : <strong>{result.prequal?.status_label}</strong> · Zone : {result.prequal?.zone} · Pack : {result.prequal?.pack_kw ? `${result.prequal.pack_kw} kW` : "à définir"}</p>
        </div>
      )}
    </div>
  );
}
