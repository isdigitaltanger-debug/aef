import { createContext, useContext, useEffect, useMemo, useState } from "react";

const emptyAnswers = {
  projet: "",
  statut: "",
  type_logement: "",
  plus_de_2_ans: "",
  surface: "",
  code_postal: "",
  commune: "",
  occupants: "",
  chauffage_actuel: "",
  emetteurs: "",
  toiture_orientation: "",
  surface_toiture_16m2: "",
  espace_technique: "",
};

const emptyContact = { prenom: "", nom: "", telephone: "", email: "" };

const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(emptyAnswers);
  const [contact, setContact] = useState(emptyContact);
  const [contactOk, setContactOk] = useState(false);
  const [marketingOk, setMarketingOk] = useState(false);
  const [utm, setUtm] = useState({});

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const u = {};
    ["source", "medium", "campaign"].forEach((k) => {
      const v = p.get(`utm_${k}`);
      if (v) u[k] = v;
    });
    if (Object.keys(u).length) setUtm(u);
  }, []);

  const value = useMemo(
    () => ({
      step,
      setStep,
      answers,
      setAnswer: (k, v) => setAnswers((a) => ({ ...a, [k]: v })),
      answersRef: answers,
      contact,
      setContactField: (k, v) => setContact((c) => ({ ...c, [k]: v })),
      contactOk,
      setContactOk,
      marketingOk,
      setMarketingOk,
      utm,
      reset: () => {
        setStep(0);
        setAnswers(emptyAnswers);
        setContact(emptyContact);
        setContactOk(false);
        setMarketingOk(false);
      },
    }),
    [step, answers, contact, contactOk, marketingOk, utm]
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  return useContext(WizardContext);
}
