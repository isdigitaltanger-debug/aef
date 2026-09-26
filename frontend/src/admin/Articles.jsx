import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../lib/api";

export function Articles() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () => api.get("/admin/articles").then((r) => r.data),
  });

  if (isLoading) return <div className="flex items-center gap-2 text-brand-ink/60"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  return (
    <div data-testid="admin-articles-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="h-serif text-2xl sm:text-3xl font-semibold">Articles</h1>
        <Link to="/administration/articles/nouveau" data-testid="admin-article-new" className="btn-primary !py-2.5 !text-sm">
          <Plus className="h-4 w-4" /> Nouvel article
        </Link>
      </div>
      <div className="card overflow-x-auto" data-testid="admin-articles-table">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-brand-ink/50 border-b border-brand-line">
              <th className="p-4">Titre</th><th className="p-4">Catégorie</th><th className="p-4">Statut</th><th className="p-4">Publié le</th><th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((a) => (
              <tr key={a.id} className="border-b border-brand-line last:border-0 hover:bg-brand-ivory/60">
                <td className="p-4 font-medium text-brand-ink">{a.title}</td>
                <td className="p-4 text-xs text-brand-ink/60">{a.category}</td>
                <td className="p-4">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${a.status === "published" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    {a.status === "published" ? "publié" : "brouillon"}
                  </span>
                </td>
                <td className="p-4 text-xs text-brand-ink/55">{a.published_at ? new Date(a.published_at).toLocaleDateString("fr-FR") : "—"}</td>
                <td className="p-4">
                  <Link to={`/administration/articles/${a.id}`} data-testid={`admin-article-edit-${a.slug}`} className="text-brand-green hover:underline text-xs font-semibold inline-flex items-center gap-1">
                    <Pencil className="h-3.5 w-3.5" /> Éditer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const EMPTY = {
  title: "", slug: "", category: "guide", status: "draft", excerpt: "", content: "",
  image_url: "", author: "", source_urls: "", seo_title: "", seo_description: "",
};

export function ArticleEdit() {
  const { id } = useParams();
  const isNew = id === "nouveau";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api.get("/admin/articles").then(({ data }) => {
      const found = data.items.find((a) => a.id === id);
      if (found) {
        setForm({ ...found, source_urls: (found.source_urls || []).join("\n") });
      }
      setLoading(false);
    });
  }, [id, isNew]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        ...form,
        source_urls: form.source_urls.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      if (isNew) {
        await api.post("/admin/articles", payload);
      } else {
        await api.patch(`/admin/articles/${id}`, payload);
      }
      toast.success("Article enregistré.");
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      navigate("/administration/articles");
    } catch (e) {
      toast.error(apiError(e));
      setBusy(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-brand-ink/60"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;

  return (
    <div className="max-w-3xl" data-testid="admin-article-editor">
      <h1 className="h-serif text-2xl sm:text-3xl font-semibold mb-6">{isNew ? "Nouvel article" : "Éditer l'article"}</h1>
      <div className="card p-6 space-y-4">
        <Input label="Titre" value={form.title} onChange={set("title")} testid="article-title-input" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Slug (ex. mon-article)" value={form.slug} onChange={set("slug")} testid="article-slug-input" />
          <label className="block">
            <span className="text-sm font-semibold text-brand-ink block mb-2">Catégorie</span>
            <select className="input-base" value={form.category} onChange={set("category")} data-testid="article-category-select">
              {["aides", "solutions", "travaux", "guide"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-semibold text-brand-ink block mb-2">Statut</span>
            <select className="input-base" value={form.status} onChange={set("status")} data-testid="article-status-select">
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </label>
          <Input label="Auteur" value={form.author} onChange={set("author")} testid="article-author-input" />
        </div>
        <Input label="Image (URL)" value={form.image_url} onChange={set("image_url")} testid="article-image-input" />
        <label className="block">
          <span className="text-sm font-semibold text-brand-ink block mb-2">Accroche (extrait)</span>
          <textarea rows={2} className="input-base" value={form.excerpt} onChange={set("excerpt")} data-testid="article-excerpt-input" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-brand-ink block mb-2">Contenu (## pour les sous-titres, sauts de ligne = paragraphes)</span>
          <textarea rows={14} className="input-base font-mono !text-xs" value={form.content} onChange={set("content")} data-testid="article-content-input" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-brand-ink block mb-2">Sources (une URL par ligne)</span>
          <textarea rows={3} className="input-base font-mono !text-xs" value={form.source_urls} onChange={set("source_urls")} data-testid="article-sources-input" />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="SEO titre" value={form.seo_title} onChange={set("seo_title")} testid="article-seo-title-input" />
          <Input label="SEO description" value={form.seo_description} onChange={set("seo_description")} testid="article-seo-desc-input" />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={busy} data-testid="article-save-btn" className="btn-primary !py-2.5 !text-sm disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
          </button>
          <button onClick={() => navigate("/administration/articles")} className="btn-outline !py-2.5 !text-sm" data-testid="article-cancel-btn">Annuler</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-brand-ink block mb-2">{label}</span>
      <input className="input-base" {...props} />
    </label>
  );
}
