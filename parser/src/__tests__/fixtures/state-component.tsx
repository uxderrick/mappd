import { useState, useReducer } from 'react';
import { useUserStore } from './stores/userStore';
import { useSelector } from 'react-redux';

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const { isAuth } = useUserStore();
  const theme = useSelector((state: any) => state.theme);

  return (
    <div>
      {step === 0 && <div className="step-details">Details Form</div>}
      {step === 1 && <div className="step-team">Team Selection</div>}
      {step === 2 && <div className="step-review">Review & Submit</div>}

      {showModal && <div className="modal">Quick Add Modal</div>}

      {isAuth && <div className="auth-only">Authenticated Content</div>}
    </div>
  );
}
