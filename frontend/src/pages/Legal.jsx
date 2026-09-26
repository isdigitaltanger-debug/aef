import Seo from "../lib/seo";
import Breadcrumb from "../components/Breadcrumb";

function LegalShell({ title, description, path, testid, children }) {
  return (
    <>
      <Seo title={`${title} — Aides Énergie France`} description={description} path={path} />
      <div className="container-x pt-8 pb-20">
        <Breadcrumb items={[{ label: title, to: "" }]} />
        <div className="mt-8 max-w-3xl mx-auto" data-testid={testid}>
          <h1 className="h-serif text-3xl sm:text-5xl font-semibold mb-8">{title}</h1>
          <div className="prose-editorial card p-6 sm:p-10">{children}</div>
        </div>
      </div>
    </>
  );
}

const PLACEHOLDER = "bg-[#FFF7E0] border border-[#E8CFA0] text-brand-ink px-2 py-0.5 rounded";

export function MentionsLegales() {
  return (
    <LegalShell
      title="Mentions légales"
      description="Mentions légales de la plateforme Aides Énergie France."
      path="/mentions-legales/"
      testid="legal-mentions"
    >
      <h2>Éditeur</h2>
      <p>
        Le site Aides Énergie France est édité par <strong>Holding SMIE</strong> —{" "}
        <span className={PLACEHOLDER}>[à compléter : forme juridique, capital, SIREN, siège social]</span>.
        Contact : <a href="mailto:demandes@aidesenergiefrance.fr">demandes@aidesenergiefrance.fr</a>.
      </p>
      <h2>Responsable de publication</h2>
      <p><span className={PLACEHOLDER}>[à compléter : nom du responsable de publication]</span></p>
      <h2>Hébergement</h2>
      <p><span className={PLACEHOLDER}>[à compléter : hébergeur, adresse, pays — avant mise en production]</span></p>
      <h2>Nature du service</h2>
      <p>
        Aides Énergie France est une plateforme privée d'information et de mise en relation,
        indépendante de l'administration et de France Rénov'. Elle ne délivre aucune aide publique
        et ne garantit aucune éligibilité ni montant d'aide.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>Les contenus éditoriaux sont la propriété de l'éditeur, sauf mention contraire. Les marques citées appartiennent à leurs titulaires respectifs.</p>
      <p className="text-xs text-brand-ink/50 mt-6">Document à relire et compléter avant tout lancement public.</p>
    </LegalShell>
  );
}

export function Confidentialite() {
  return (
    <LegalShell
      title="Politique de confidentialité"
      description="Comment Aides Énergie France collecte, utilise et protège vos données."
      path="/confidentialite/"
      testid="legal-confidentialite"
    >
      <h2>Qui traite vos données ?</h2>
      <p>
        Pour la demande d'étude de votre projet, vos données sont transmises au destinataire
        désigné du dossier, dont la raison sociale est affichée au moment de votre consentement
        dans le formulaire. Pour la navigation et les messages de contact, le responsable est
        Holding SMIE — <span className={PLACEHOLDER}>[à compléter : coordonnées complètes du responsable de traitement]</span>.
      </p>
      <h2>Quelles données, pourquoi ?</h2>
      <p>
        Nous collectons uniquement les informations du formulaire (projet, logement, situation,
        coordonnées), les horodatages techniques et la provenance de la visite (campagne). Finalité
        : vous recontacter pour mener l'étude demandée. Base légale : votre consentement explicite.
      </p>
      <h2>Ce que nous ne demandons pas</h2>
      <p>Aucune pièce d'identité, aucun avis fiscal, aucun justificatif de revenus n'est demandé au premier formulaire.</p>
      <h2>Durée de conservation</h2>
      <p><span className={PLACEHOLDER}>[à compléter : durée de conservation par catégorie — paramétrable]</span></p>
      <h2>Vos droits</h2>
      <p>
        Vous pouvez accéder à vos données, les rectifier, les effacer, retirer votre consentement
        ou vous opposer au démarchage à tout moment : écrivez à{" "}
        <a href="mailto:demandes@aidesenergiefrance.fr">demandes@aidesenergiefrance.fr</a>. Vous
        pouvez aussi saisir la CNIL (cnil.fr).
      </p>
      <h2>Sécurité</h2>
      <p>Transmission chiffrée, accès restreint côté serveur, aucune donnée personnelle exposée dans les URL ni les journaux publics.</p>
      <p className="text-xs text-brand-ink/50 mt-6">Document à relire juridiquement avant lancement public.</p>
    </LegalShell>
  );
}

export function ConditionsUtilisation() {
  return (
    <LegalShell
      title="Conditions d'utilisation"
      description="Conditions d'utilisation de la plateforme Aides Énergie France."
      path="/conditions-utilisation/"
      testid="legal-cgu"
    >
      <h2>Objet</h2>
      <p>
        Les présentes conditions régissent l'utilisation de la plateforme privée Aides Énergie
        France : information éditoriale sur les aides énergétiques et recueil volontaire de
        demandes d'étude pour des travaux.
      </p>
      <h2>Préqualifications affichées</h2>
      <p>
        Le résultat présenté après le questionnaire est une <strong>préqualification commerciale
        indicative</strong>. Il ne constitue ni une décision d'éligibilité, ni un engagement de
        montant d'aide, ni un accord de financement. Seuls les organismes officiels accordent les
        aides.
      </p>
      <h2>Responsabilités</h2>
      <p>
        Les contenus sont rédigés avec soin et sourcés vers les sites officiels, mais ne remplacent
        pas les textes en vigueur. L'éditeur ne saurait être tenu responsable des décisions prises
        sur la seule base des informations du site.
      </p>
      <h2>Utilisation du service</h2>
      <p>
        Vous vous engagez à fournir des informations exactes et à ne pas utiliser le service à des
        fins frauduleuses. Tout abus (soumissions automatisées, usurpation) peut donner lieu à un
        blocage technique.
      </p>
      <h2>Modification</h2>
      <p>Ces conditions peuvent évoluer ; la version applicable est celle publiée sur cette page au moment de votre utilisation.</p>
      <p className="text-xs text-brand-ink/50 mt-6">Document à relire juridiquement avant lancement public.</p>
    </LegalShell>
  );
}
