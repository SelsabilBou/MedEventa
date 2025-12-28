function SuccessModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icons">
          <span className="party-icon">🎉</span>
          <span className="party-icon">🎉</span>
        </div>

        <h2>Félicitations</h2>

        <div className="modal-icons">
          <span className="party-icon">🎉</span>
          <span className="party-icon">🎉</span>
        </div>

        <p>
          Votre compte est créé avec succès ! Veillez effectuer les tests pour
          commencer à travailler avec nous
        </p>

        <button className="btn-ok" onClick={onClose}>
          Ok
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;
