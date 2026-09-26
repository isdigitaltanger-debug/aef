import Seo from "../lib/seo";
import Breadcrumb from "../components/Breadcrumb";
import EligibilityForm from "../wizard/EligibilityForm";

export default function Simulation() {
  return (
    <>
      <Seo
        title="Tester mon éligibilité en 2 minutes — Aides Énergie France"
        description="Questionnaire en 4 étapes : projet, logement, situation, coordonnées. Première étude gratuite et sans engagement."
        path="/simulation/"
      />
      <div className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: "Simulation", to: "" }]} />
        <div className="mt-8 max-w-3xl">
          <p className="eyebrow mb-4">Étude gratuite</p>
          <h1 className="h-serif text-3xl sm:text-5xl font-semibold leading-tight mb-5">
            Je teste mon éligibilité en 2 minutes.
          </h1>
          <p className="text-brand-ink/75 text-base sm:text-lg leading-relaxed mb-10">
            Découvrez les aides et solutions énergétiques adaptées à votre logement. Quatre étapes,
            aucune création de compte. Gratuit et sans engagement.
          </p>
        </div>
        <div className="max-w-3xl" data-testid="simulation-form-zone">
          <EligibilityForm variant="page" />
        </div>
      </div>
    </>
  );
}
