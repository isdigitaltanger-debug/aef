import { Link } from "react-router-dom";
import { ArrowRight, Compass, FileText, ShieldCheck } from "lucide-react";
import Seo from "../lib/seo";
import Breadcrumb from "../components/Breadcrumb";
import Reveal from "../components/Reveal";

export default function APropos() {
  return (
    <>
      <Seo
        title="À propos — Aides Énergie France"
        description="Une plateforme privée d'information et de mise en relation sur les aides énergétiques : notre rôle, notre méthode, nos limites."
        path="/a-propos/"
      />
      <div className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: "À propos", to: "" }]} />

        <div className="mt-8 grid gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-4">À propos</p>
            <h1 className="h-serif text-3xl sm:text-5xl font-semibold leading-tight mb-6">
              Votre allié pour les aides énergétiques — en toute transparence
            </h1>
            <p className="text-brand-ink/80 text-base sm:text-lg leading-relaxed mb-6">
              Aides Énergie France est une plateforme privée d'information et de mise en relation.
              Notre conviction : les aides à la rénovation énergétique sont puissantes mais peu
              lisibles. Nous aidons les propriétaires à comprendre les dispositifs, à tester la
              compatibilité de leur logement et à être orientés vers une étude sérieuse — gratuite
              et sans engagement.
            </p>
            <p className="text-brand-ink/80 text-base sm:text-lg leading-relaxed mb-10">
              Nous ne sommes ni un site de l'État, ni France Rénov', et nous ne délivrons aucune
              aide. Chaque page cite ses sources officielles, chaque questionnaire précise le
              destinataire des informations, et nous affichons volontairement nos limites.
            </p>

            <div className="space-y-4 mb-12">
              {[
                { icon: Compass, title: "Informer avant de vendre", text: "Nos guides expliquent les mécanismes sans promettre de montants ni d'éligibilité garantie." },
                { icon: FileText, title: "Cibler le solaire thermique", text: "Notre étude gratuite porte en priorité sur le système solaire combiné (SSC) et la combinaison pompe à chaleur + SSC." },
                { icon: ShieldCheck, title: "Protéger vos données", text: "Aucune pièce d'identité ni avis fiscal demandé. Consentement explicite, destinataire nommé, données minimisées." },
              ].map((b, i) => (
                <Reveal key={b.title} delay={i * 0.08}>
                  <div className="card p-6 flex gap-4">
                    <b.icon className="h-6 w-6 text-brand-green shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-brand-ink mb-1">{b.title}</p>
                      <p className="text-sm text-brand-ink/70 leading-relaxed">{b.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="card p-6 border-l-4 border-l-brand-gold">
              <p className="font-serif text-xl text-brand-ink mb-2">Ce que nous ne sommes pas</p>
              <p className="text-sm text-brand-ink/70 leading-relaxed">
                Nous ne sommes pas un service public : nous ne pouvons pas accorder MaPrimeRénov',
                verser une prime CEE ou délivrer un chèque énergie. Pour les démarches officielles,
                passez par France Rénov' et les guichets publics cités sur chaque page.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-brand-line">
              <img
                src="https://images.unsplash.com/photo-1779777847968-6e6ee105dcbd?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Maison individuelle à la campagne"
                className="h-80 w-full object-cover"
              />
            </div>
            <div className="card p-6 mt-5 bg-brand-green text-white border-none">
              <p className="font-serif text-2xl mb-3">Prêt à faire le point ?</p>
              <p className="text-sm text-white/80 mb-5">2 minutes suffisent pour décrire votre projet et déclencher une étude gratuite.</p>
              <Link to="/simulation/" data-testid="a-propos-cta" className="btn-gold w-full">
                Je teste mon éligibilité <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
