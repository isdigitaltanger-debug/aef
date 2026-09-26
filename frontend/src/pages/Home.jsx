import { useLocation } from "react-router-dom";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck, ClipboardList, FileSearch, Handshake, HomeIcon, Landmark, Newspaper, PiggyBank, Sun, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Seo from "../lib/seo";
import KineticTitle from "../components/KineticTitle";
import Marquee from "../components/Marquee";
import Reveal from "../components/Reveal";
import EligibilityForm from "../wizard/EligibilityForm";
import api from "../lib/api";
import { AIDS } from "../content/aides";
import { SOLUTIONS } from "../content/solutions";

const AIDE_ICON = {
  maprimerenov: Landmark,
  cee: Zap,
  "solaire-thermique": Sun,
  "pompe-a-chaleur": BadgeCheck,
  locales: HomeIcon,
  "cheque-energie": PiggyBank,
};

const AIDE_SHORT = {
  maprimerenov: "MaPrimeRénov'",
  cee: "Primes CEE",
  "solaire-thermique": "Solaire thermique",
  "pompe-a-chaleur": "Pompe à chaleur",
  locales: "Aides locales",
  "cheque-energie": "Chèque énergie",
};

const STEPS_HOW = [
  { icon: FileSearch, title: "1. Vous décrivez votre projet", text: "Quelques questions sur votre logement et votre installation : 2 minutes suffisent." },
  { icon: ClipboardList, title: "2. Nous analysons votre situation", text: "Notre équipe étudie votre demande au regard des solutions et aides existantes." },
  { icon: Handshake, title: "3. Une étude gratuite est proposée", text: "Si votre projet correspond, un technicien valide les éléments sur place ou en ligne." },
  { icon: Sun, title: "4. Vous avancez sereinement", text: "Vous recevez une préconisation claire, sans engagement et sans démarchage abusif." },
];

export default function Home() {
  const { pathname } = useLocation();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const isHome = pathname === "/";

  const { data: articlesData } = useQuery({
    queryKey: ["articles", "home"],
    queryFn: () => api.get("/articles", { params: { limit: 3 } }).then((r) => r.data),
  });

  const aidsOrder = ["maprimerenov", "cee", "locales", "cheque-energie"];

  return (
    <>
      <Seo
        title="Aides Énergie France — Je teste mon éligibilité en 2 minutes"
        description="Portail privé d'information sur les aides énergétiques : solaire thermique, pompe à chaleur, isolation. Première étude gratuite et sans engagement."
        path="/"
      />

      {/* ================= HERO ================= */}
      <section ref={heroRef} className="relative overflow-hidden" data-testid="hero-section">
        <motion.div className="absolute inset-0" style={{ y }} aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1655300283246-1ef0317a565d?crop=entropy&cs=srgb&fm=jpg&q=85"
            alt=""
            className="h-[115%] w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAF7] via-[#FAFAF7]/88 to-[#FAFAF7]/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF7]/40 via-transparent to-[#FAFAF7]" />
        </motion.div>

        <div className="container-x relative pt-12 sm:pt-16 pb-16 sm:pb-24">
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-white/70 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold animate-pulse" />
                Plateforme privée d'information
              </p>
              <KineticTitle
                lines={["Je teste mon", "éligibilité", "en 2 minutes."]}
                className="h-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-semibold"
              />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 text-base sm:text-lg text-brand-ink/80 leading-relaxed max-w-md"
                data-testid="hero-subtitle"
              >
                Découvrez les aides et solutions énergétiques adaptées à votre logement. Première
                étude gratuite et sans engagement.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.7 }}
                className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-brand-ink/70"
              >
                <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand-green" /> Gratuit et sans engagement</span>
                <span className="flex items-center gap-2"><ShieldIcon /> Non affilié à l'administration</span>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85, duration: 0.7 }} className="mt-8 hidden lg:flex items-center gap-6">
                <div className="border-l-2 border-brand-gold pl-4">
                  <p className="font-serif text-3xl text-brand-ink leading-none">Solaire thermique</p>
                  <p className="text-xs text-brand-ink/60 mt-1">SSC & PAC + SSC — le cœur de notre expertise</p>
                </div>
              </motion.div>
            </div>

            <motion.div
              id="test-eligibilite"
              className="lg:col-span-7 scroll-mt-28"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              data-testid="hero-form-zone"
            >
              <EligibilityForm variant="hero" />
            </motion.div>
          </div>

          {/* Les aides du moment */}
          <div className="mt-10" data-testid="aides-du-moment">
            <div className="flex items-center gap-4 mb-4">
              <span className="eyebrow whitespace-nowrap">Les aides du moment</span>
              <span className="h-px flex-1 bg-brand-line" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {AIDS.map((a) => {
                const Icon = AIDE_ICON[a.slug] || Landmark;
                return (
                  <Link key={a.slug} to={`/aides/${a.slug}/`} data-testid={`moment-aid-${a.slug}`} className="card card-hover group flex items-center gap-3 px-4 py-3.5">
                    <span className="h-9 w-9 shrink-0 rounded-[4px] bg-brand-green/[0.07] flex items-center justify-center">
                      <Icon className="h-5 w-5 text-brand-green" />
                    </span>
                    <span className="text-xs font-bold text-brand-ink leading-tight">{AIDE_SHORT[a.slug] || a.title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-brand-green ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= AIDES ================= */}
      <section className="section" data-testid="aides-section">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <p className="eyebrow mb-3">Les aides à connaître</p>
                <h2 className="h-serif text-2xl sm:text-3xl lg:text-4xl font-semibold">Panorama des dispositifs</h2>
              </div>
              <Link to="/aides/" data-testid="aides-see-all" className="text-sm font-semibold text-brand-green hover:underline flex items-center gap-1">
                Toutes les aides <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aidsOrder.map((slug, i) => {
              const aide = AIDS.find((a) => a.slug === slug);
              const Icon = AIDE_ICON[aide.slug] || Landmark;
              return (
                <Reveal key={slug} delay={i * 0.08}>
                  <Link to={`/aides/${aide.slug}/`} data-testid={`aid-card-${aide.slug}`} className="card card-hover group block h-full p-6">
                    <div className="h-10 w-10 rounded-xl bg-brand-green/[0.07] flex items-center justify-center mb-4 group-hover:bg-brand-green/[0.12] transition-colors">
                      <Icon className="h-5 w-5 text-brand-green" />
                    </div>
                    <p className="font-serif text-xl text-brand-ink mb-2">{aide.title}</p>
                    <p className="text-sm text-brand-ink/70 leading-relaxed">{aide.tagline}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-green opacity-0 group-hover:opacity-100 transition-opacity">
                      En savoir plus <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={0.1}>
            <p className="mt-6 text-xs text-brand-ink/55 flex items-center gap-2">
              <Newspaper className="h-3.5 w-3.5" />
              Montants et barèmes non affichés volontairement : ils évoluent régulièrement. Consultez toujours les sources officielles.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <Marquee items={["Système solaire combiné", "Pompe à chaleur", "PAC + solaire thermique", "Isolation", "Étude gratuite", "Sans engagement", "Plateforme privée", "Conseils indépendants"]} />

      {/* ================= COMMENT ÇA MARCHE ================= */}
      <section className="section !pt-20" data-testid="how-it-works">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow mb-3">Comment ça marche</p>
            <h2 className="h-serif text-2xl sm:text-3xl lg:text-4xl font-semibold mb-12 max-w-2xl">
              Quatre étapes, du questionnaire à l'étude technique
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS_HOW.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 0.1}>
                  <div className="relative h-full">
                    <div className="card h-full p-6 border-t-2 border-t-brand-gold/60">
                      <Icon className="h-6 w-6 text-brand-green mb-4" />
                      <p className="font-semibold text-brand-ink mb-2 text-[15px]">{s.title}</p>
                      <p className="text-sm text-brand-ink/70 leading-relaxed">{s.text}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SOLUTIONS ================= */}
      <section className="section bg-white border-y border-brand-line" data-testid="solutions-section">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <p className="eyebrow mb-3">Nos solutions</p>
                <h2 className="h-serif text-2xl sm:text-3xl lg:text-4xl font-semibold">Des équipements, une méthode</h2>
              </div>
              <Link to="/solutions/" data-testid="solutions-see-all" className="text-sm font-semibold text-brand-green hover:underline flex items-center gap-1">
                Toutes les solutions <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 3) * 0.08}>
                <Link to={`/solutions/${s.slug}/`} data-testid={`solution-card-${s.slug}`} className="card card-hover group block h-full overflow-hidden">
                  <div className="h-44 overflow-hidden">
                    <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="font-serif text-xl text-brand-ink mb-2">{s.title}</p>
                    <p className="text-sm text-brand-ink/70">{s.tagline}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ARTICLES ================= */}
      <section className="section" data-testid="articles-section">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <p className="eyebrow mb-3">Le journal</p>
                <h2 className="h-serif text-2xl sm:text-3xl lg:text-4xl font-semibold">Derniers guides publiés</h2>
              </div>
              <Link to="/actualites/" data-testid="articles-see-all" className="text-sm font-semibold text-brand-green hover:underline flex items-center gap-1">
                Tous les articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {(articlesData?.items || []).map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.08}>
                <Link to={`/actualites/${a.slug}/`} data-testid={`article-card-${a.slug}`} className="card card-hover group block h-full overflow-hidden">
                  <div className="h-40 overflow-hidden">
                    <img src={a.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-green mb-2">{a.category}</p>
                    <p className="font-serif text-lg text-brand-ink leading-snug">{a.title}</p>
                    <p className="mt-2 text-xs text-brand-ink/55">
                      {new Date(a.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
            {!articlesData && <div className="md:col-span-3 text-sm text-brand-ink/50">Chargement des articles…</div>}
          </div>
        </div>
      </section>

      {/* ================= RÉASSURANCE + CTA ================= */}
      <section className="pb-20 sm:pb-28" data-testid="reassurance-section">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-brand-green text-white p-8 sm:p-12 lg:p-16">
              <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-gold/20 blur-3xl" aria-hidden="true" />
              <div className="relative max-w-2xl">
                <p className="text-xs uppercase tracking-[0.22em] font-semibold text-white/70 mb-4">Notre rôle, en toute transparence</p>
                <h2 className="font-serif text-2xl sm:text-4xl font-semibold leading-tight mb-5">
                  Une plateforme privée, indépendante de l'administration
                </h2>
                <p className="text-white/80 leading-relaxed mb-8">
                  Aides Énergie France n'est ni un site de l'État, ni France Rénov'. Nous sommes une
                  plateforme privée d'information et de mise en relation : nous vous aidons à
                  comprendre les aides, à préparer votre dossier et, si votre projet correspond, à
                  être mis en relation avec un professionnel pour une étude gratuite. Nous ne
                  délivrons aucune aide et ne promettons aucun montant : les barèmes officiels
                  font foi.
                </p>
                <div className="flex flex-wrap gap-3">
                  {isHome ? (
                    <button onClick={() => document.getElementById("test-eligibilite")?.scrollIntoView({ behavior: "smooth" })} data-testid="cta-bottom-home" className="btn-gold">
                      Je teste mon éligibilité en 2 minutes <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link to="/simulation/" data-testid="cta-bottom" className="btn-gold">
                      Je teste mon éligibilité en 2 minutes <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link to="/a-propos/" data-testid="cta-about" className="btn-outline !border-white/40 !text-white hover:!bg-white/10">
                    Découvrir notre rôle
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-4 w-4 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
