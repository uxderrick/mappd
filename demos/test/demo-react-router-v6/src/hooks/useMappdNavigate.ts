import { useNavigate } from 'react-router-dom';
import { isMappdMode, mappdNavigate } from '../utils/mappd';

export function useMappdNavigate() {
  const navigate = useNavigate();

  return (to: string, data?: Record<string, unknown>) => {
    if (isMappdMode()) {
      mappdNavigate(to, data);
    } else {
      navigate(to);
    }
  };
}
