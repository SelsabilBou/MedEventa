function NavigationButtons({ currentStep, onNext, onPrevious, isFormSubmit }) {
  return (
    <div className="navigation-buttons">
      <button
        type="button"
        className="btn-previous"
        onClick={onPrevious}
        disabled={currentStep === 1}
      >
        Précédent
      </button>

      <button
        type={isFormSubmit ? "submit" : "button"}
        className="btn-next"
        onClick={isFormSubmit ? undefined : onNext}
      >
        {currentStep === 4 ? "Terminer" : "Suivant"}
      </button>
    </div>
  );
}

export default NavigationButtons;
