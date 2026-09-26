import { useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import "@/index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import CallbackWidget from "./components/CallbackWidget";
import { WizardProvider } from "./wizard/WizardContext";
import Home from "./pages/Home";
import Simulation from "./pages/Simulation";
import Merci from "./pages/Merci";
import AidesIndex from "./pages/aides/AidesIndex";
import AideDetail from "./pages/aides/AideDetail";
import SolutionsIndex from "./pages/solutions/SolutionsIndex";
import SolutionDetail from "./pages/solutions/SolutionDetail";
import Actualites from "./pages/Actualites";
import ArticleDetail from "./pages/ArticleDetail";
import APropos from "./pages/APropos";
import Contact from "./pages/Contact";
import { MentionsLegales, Confidentialite, ConditionsUtilisation } from "./pages/Legal";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";
import AdminApp from "./admin/AdminApp";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    let rafId;
    const raf = (t) => {
      lenis.raf(t);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
  return null;
}

function PublicLayout() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <CallbackWidget />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <WizardProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster position="top-center" richColors />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/simulation" element={<Simulation />} />
                <Route path="/merci" element={<Merci />} />
                <Route path="/aides" element={<AidesIndex />} />
                <Route path="/aides/:slug" element={<AideDetail />} />
                <Route path="/solutions" element={<SolutionsIndex />} />
                <Route path="/solutions/:slug" element={<SolutionDetail />} />
                <Route path="/actualites" element={<Actualites />} />
                <Route path="/actualites/:slug" element={<ArticleDetail />} />
                <Route path="/a-propos" element={<APropos />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/confidentialite" element={<Confidentialite />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/administration/*" element={<AdminApp />} />
            </Routes>
          </BrowserRouter>
        </WizardProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
