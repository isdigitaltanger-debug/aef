import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { BarChart3, Building2, FileText, ExternalLink, LayoutDashboard, Loader2, LogOut, Mail, Plug, ShieldCheck, TestTube } from "lucide-react";
import api, { apiError } from "../lib/api";
import Dashboard from "./Dashboard";
import Leads from "./Leads";
import LeadDetail from "./LeadDetail";
import { Articles, ArticleEdit } from "./Articles";
import Partners from "./Partners";
import Regles from "./Regles";
import Messages from "./Messages";
import Integrations from "./Integrations";
import TestLead from "./TestLead";

const AuthCtx = { user: null, setUser: null };
export const useAuth = () => AuthCtx;

const NAV = [
  { to: "/administration", end: true, label: "Tableau de bord", icon: LayoutDashboard, roles: ["agent", "editor", "admin"], id: "admin-nav-dashboard" },
  { to: "/administration/leads", label: "Leads", icon: BarChart3, roles: ["agent", "editor", "admin"], id: "admin-nav-leads" },
  { to: "/administration/articles", label: "Articles", icon: FileText, roles: ["editor", "admin"], id: "admin-nav-articles" },
  { to: "/administration/partenaires", label: "Partenaires", icon: Building2, roles: ["admin"], id: "admin-nav-partners" },
  { to: "/administration/regles", label: "Règles de qualification", icon: ShieldCheck, roles: ["admin"], id: "admin-nav-rules" },
  { to: "/administration/messages", label: "Messages", icon: Mail, roles: ["agent", "editor", "admin"], id: "admin-nav-messages" },
  { to: "/administration/integrations", label: "Intégrations", icon: Plug, roles: ["editor", "admin"], id: "admin-nav-integrations" },
  { to: "/administration/test", label: "Lead de test", icon: TestTube, roles: ["editor", "admin"], id: "admin-nav-test" },
];

export default function AdminApp() {
  const [user, setUser] = useState(null); // null = vérification, false = non connecté
  AuthCtx.user = user;
  AuthCtx.setUser = setUser;

  useEffect(() => {
    // CRITICAL : retour OAuth Google — GoogleCallback échange le session_id avant toute
    // vérification de session existante (sinon 401 prématuré sur /admin/me).
    if (window.location.hash?.includes("session_id=")) return;
    api.get("/admin/me").then((r) => setUser(r.data)).catch(() => setUser(false));
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(undefined, async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original?._retry && !String(original?.url).includes("/admin/login")) {
        original._retry = true;
        try {
          await api.post("/admin/refresh");
          return api(original);
        } catch {
          setUser(false);
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    });
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  return (
    <Routes>
      <Route path="login" element={user ? <Navigate to="/administration" replace /> : <Login />} />
      <Route path="callback" element={<GoogleCallback />} />
      <Route element={user ? <AdminLayout /> : user === false ? <Navigate to="/administration/login" replace /> : <Loading />} >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticleEdit />} />
        <Route path="partenaires" element={<Partners />} />
        <Route path="regles" element={<Regles />} />
        <Route path="messages" element={<Messages />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="test" element={<TestLead />} />
      </Route>
      <Route path="*" element={<Navigate to="/administration" replace />} />
    </Routes>
  );
}

function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/admin/login", { email, password });
      AuthCtx.setUser(data);
    } catch (err) {
      setError(apiError(err));
      setBusy(false);
    }
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    // Le retour se fait sur /administration/callback qui échange le session_id côté serveur.
    const redirectUrl = window.location.origin + "/administration/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4" data-testid="admin-login-page">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <img src="/brand/logo.png" alt="Aides Énergie France" className="h-12 w-auto mb-6" />
        <h1 className="h-serif text-2xl font-semibold mb-1">Espace administration</h1>
        <p className="text-sm text-brand-ink/60 mb-6">Accès réservé — connexion sécurisée.</p>
        <button
          type="button"
          onClick={googleLogin}
          data-testid="admin-google-btn"
          className="w-full inline-flex items-center justify-center gap-3 border border-[#C9D1D8] bg-white hover:bg-brand-ivory text-brand-ink text-sm font-semibold px-6 py-3.5 rounded-md transition-all cursor-pointer mb-5"
        >
          <GoogleIcon /> Continuer avec Google
        </button>
        <div className="flex items-center gap-3 mb-5" aria-hidden="true">
          <span className="h-px flex-1 bg-brand-line" />
          <span className="text-xs text-brand-ink/45 uppercase tracking-wider">ou par e-mail</span>
          <span className="h-px flex-1 bg-brand-line" />
        </div>
        <label className="block mb-4">
          <span className="text-sm font-semibold text-brand-ink block mb-2">E-mail</span>
          <input type="email" required className="input-base" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-login-email" placeholder="admin@…" />
        </label>
        <label className="block mb-5">
          <span className="text-sm font-semibold text-brand-ink block mb-2">Mot de passe</span>
          <input type="password" required className="input-base" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="admin-login-password" placeholder="••••••••" />
        </label>
        {error && <p className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-4" data-testid="admin-login-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60" data-testid="admin-login-submit">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}
        </button>
        <Link to="/" className="block text-center text-xs text-brand-ink/50 hover:text-brand-green mt-5">← Retour au site</Link>
      </form>
    </div>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.32z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z" />
  </svg>
);

function GoogleCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const sessionId = new URLSearchParams((location.hash || "").replace(/^#/, "")).get("session_id");
    if (!sessionId) {
      setError("Lien de connexion invalide : aucune session Google trouvée.");
      return;
    }
    api.post("/admin/google-session", { session_id: sessionId })
      .then(({ data }) => {
        AuthCtx.setUser(data);
        navigate("/administration", { replace: true });
      })
      .catch((e) => setError(apiError(e)));
  }, [location.hash, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-8 text-center" data-testid="google-callback-error">
          <p className="font-bold text-brand-ink text-lg mb-2">Connexion refusée</p>
          <p className="text-sm text-brand-ink/70 mb-5">{error}</p>
          <Link to="/administration/login" className="btn-primary w-full" data-testid="google-error-back">Retour à la connexion</Link>
        </div>
      </div>
    );
  }
  return <Loading />;
}

function AdminLayout() {
  const role = AuthCtx.user?.role || "agent";
  const logout = async () => {
    try {
      await api.post("/admin/logout");
    } finally {
      AuthCtx.setUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex" data-testid="admin-layout">
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-brand-line p-5 sticky top-0 h-screen">
        <Link to="/" className="mb-8 block">
          <img src="/brand/logo.png" alt="Aides Énergie France" className="h-10 w-auto" />
        </Link>
        <nav className="space-y-1 flex-1" aria-label="Navigation administration">
          {NAV.filter((n) => n.roles.includes(role)).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={n.id}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive ? "bg-brand-green text-white" : "text-brand-ink/70 hover:bg-brand-ivory hover:text-brand-green"
                }`
              }
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-brand-line pt-4 space-y-2">
          <a href="/" target="_self" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-brand-ink/70 hover:bg-brand-ivory" data-testid="admin-nav-site">
            <ExternalLink className="h-4 w-4" /> Voir le site
          </a>
          <button onClick={logout} data-testid="admin-logout-btn" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-brand-line px-5 sm:px-8 h-16 flex items-center justify-between" data-testid="admin-topbar">
          <div className="flex items-center gap-3 lg:hidden">
            <img src="/brand/logo.png" alt="AEF" className="h-8 w-auto" />
          </div>
          <div className="hidden lg:block text-sm text-brand-ink/60">
            Connecté en tant que <strong className="text-brand-ink">{AuthCtx.user?.email}</strong> ({role})
          </div>
          <div className="flex items-center gap-3 lg:hidden text-xs text-brand-ink/60">
            {role}
          </div>
          <nav className="lg:hidden flex gap-2 overflow-x-auto" aria-label="Navigation admin mobile">
            {NAV.filter((n) => n.roles.includes(role)).map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} data-testid={n.id} className={({ isActive }) => `chip !px-3 whitespace-nowrap ${isActive ? "chip-active" : ""}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="p-5 sm:p-8" data-testid="admin-main">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/:id" element={<ArticleEdit />} />
            <Route path="partenaires" element={<Partners />} />
            <Route path="regles" element={<Regles />} />
            <Route path="messages" element={<Messages />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="test" element={<TestLead />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
