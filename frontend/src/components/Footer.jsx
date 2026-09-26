import { Link } from "react-router-dom";

const COLS = [
  {
    title: "Les aides",
    links: [
      { to: "/aides/", label: "Toutes les aides" },
      { to: "/aides/maprimerenov/", label: "MaPrimeRénov'" },
      { to: "/aides/cee/", label: "Primes CEE" },
      { to: "/aides/solaire-thermique/", label: "Solaire thermique" },
      { to: "/aides/pompe-a-chaleur/", label: "Pompe à chaleur" },
      { to: "/aides/locales/", label: "Aides locales" },
      { to: "/aides/cheque-energie/", label: "Chèque énergie" },
    ],
  },
  {
    title: "Nos solutions",
    links: [
      { to: "/solutions/", label: "Toutes les solutions" },
      { to: "/solutions/systeme-solaire-combine/", label: "Système solaire combiné" },
      { to: "/solutions/pompe-a-chaleur/", label: "Pompe à chaleur" },
      { to: "/solutions/pac-solaire-thermique/", label: "PAC + solaire thermique" },
      { to: "/solutions/isolation/", label: "Isolation" },
      { to: "/solutions/chauffage/", label: "Chauffage" },
    ],
  },
  {
    title: "Informations",
    links: [
      { to: "/actualites/", label: "Actualités & guides" },
      { to: "/a-propos/", label: "À propos" },
      { to: "/contact/", label: "Contact" },
      { to: "/simulation/", label: "Tester mon éligibilité" },
    ],
  },
  {
    title: "Légal",
    links: [
      { to: "/mentions-legales/", label: "Mentions légales" },
      { to: "/confidentialite/", label: "Politique de confidentialité" },
      { to: "/cookies/", label: "Cookies" },
      { to: "/conditions-utilisation/", label: "Conditions d'utilisation" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-white" data-testid="site-footer">
      <div className="h-1.5 bg-brand-green" aria-hidden="true" />
      <div className="h-[3px] bg-brand-gold/80" aria-hidden="true" />
      <div className="container-x py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <img src="/brand/logo.png" alt="Aides Énergie France" className="h-14 w-auto" />
            <p className="mt-5 text-sm text-brand-ink/70 leading-relaxed">
              Portail privé d'information et de mise en relation sur les aides énergétiques et les
              solutions de chauffage solaire.
            </p>
            <p className="mt-4 text-xs text-brand-ink/60 leading-relaxed border-l-2 border-brand-gold pl-3">
              Plateforme privée d'information et de mise en relation, non affiliée à
              l'administration. Nous ne délivrons aucune aide : nous vous aidons à préparer votre
              projet.
            </p>
          </div>
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="eyebrow mb-4">{c.title}</p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} data-testid={`footer-link-${l.to.replace(/\//g, "-")}`} className="text-sm text-brand-ink/70 hover:text-brand-green transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-brand-line flex flex-col sm:flex-row justify-between gap-3 text-xs text-brand-ink/55">
          <p>© {new Date().getFullYear()} Aides Énergie France — Tous droits réservés.</p>
          <p>
            Le chèque énergie est un service public :{" "}
            <a href="https://www.chequeenergie.gouv.fr/" target="_blank" rel="noopener noreferrer" data-testid="footer-official-cheque-energie" className="underline hover:text-brand-green">
              chequeenergie.gouv.fr
            </a>{" "}
            · France Rénov' :{" "}
            <a href="https://www.france-renov.gouv.fr/" target="_blank" rel="noopener noreferrer" data-testid="footer-official-france-renov" className="underline hover:text-brand-green">
              france-renov.gouv.fr
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
