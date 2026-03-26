import { useNavigate } from 'react-router-dom';
import { isFlowCanvasMode, flowCanvasNavigate } from '../utils/flowcanvas';

export function useFlowCanvasNavigate() {
  const navigate = useNavigate();

  return (to: string, data?: Record<string, unknown>) => {
    if (isFlowCanvasMode()) {
      flowCanvasNavigate(to, data);
    } else {
      navigate(to);
    }
  };
}
