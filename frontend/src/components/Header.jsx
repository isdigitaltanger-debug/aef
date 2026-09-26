import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

const NAV = [
  { to: "/aides/", label: "Aides", id: "nav-aides" },
  { to: "/solutions/", label: "Solutions", id: "nav-solutions" },
  { to: "/actualites/", label: "Actualités", id: "nav-actualites" },
  { to: "/a-propos/", label: "À propos", id: "nav-a-propos" },
  { to: "/contact/", label: "Contact", id: "nav-contact" },
];

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const goSimulation = () => {
    if (pathname === "/") {
      document.getElementById("test-eligibilite")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/simulation/");
    }
  };

  return (
    <>
      <div
        className="bg-brand-green text-white text-[11px] sm:text-xs text-center py-1.5 px-4 font-medium tracking-wide"
        data-testid="top-bandeau"
      >
        Plateforme privée d'information et de mise en relation — non affiliée à l'administration
      </div>
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${
          scrolled ? "border-brand-line shadow-[0_2px_16px_-8px_rgba(21,92,69,0.25)]" : "border-transparent"
        }`}
        data-testid="site-header"
      >
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Link to="/" data-testid="nav-logo-link" className="flex items-center shrink-0" aria-label="Aides Énergie France — accueil">
          <img src="/brand/logo.png" alt="Aides Énergie France — Votre allié pour les aides énergétiques" className="h-12 sm:h-14 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              data-testid={n.id}
              className={`text-sm font-semibold transition-colors hover:text-brand-green ${
                pathname.startsWith(n.to.slice(0, -1)) && n.to !== "/" ? "text-brand-green" : "text-brand-ink/80"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <button onClick={goSimulation} data-testid="header-cta-btn" className="btn-primary !px-5 !py-2.5 text-sm">
            Je teste mon éligibilité en 2 minutes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <button onClick={goSimulation} data-testid="header-cta-mobile" className="btn-primary !px-4 !py-2.5 !text-xs">
            Test 2 min
          </button>
          <button
            onClick={() => setOpen(!open)}
            data-testid="nav-burger"
            aria-expanded={open}
            aria-label="Ouvrir le menu"
            className="p-2 rounded-lg border border-brand-line text-brand-ink"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-brand-line bg-white"
            aria-label="Navigation mobile"
          >
            <div className="container-x py-4 flex flex-col gap-1">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} data-testid={n.id} className="px-3 py-3 rounded-lg text-base font-semibold text-brand-ink hover:bg-brand-ivory">
                  {n.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <div className="h-[3px] bg-brand-green" aria-hidden="true" />
      <div className="h-px bg-brand-gold" aria-hidden="true" />
      </header>
    </>
  );
}
