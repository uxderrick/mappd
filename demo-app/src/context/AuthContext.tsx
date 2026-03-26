import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  username: string | null;
  setUsername: (name: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  username: null,
  setUsername: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  return (
    <AuthContext.Provider value={{ username, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
