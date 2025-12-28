import { useState } from "react";
import StepOne from "./StepOne";

export default function MultiStepForm() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    photo: null,
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    setStep((s) => s + 1);
  };

  return (
    <>
      {step === 1 && (
        <StepOne
          formData={formData}
          updateFormData={updateFormData}
          nextStep={nextStep}
        />
      )}

      {step === 2 && <div>Step 2 here…</div>}
    </>
  );
}
