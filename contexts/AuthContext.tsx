// AuthContext.tsx
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { User } from '../Types/UserStructure';

interface AuthContextData {
  user: User | undefined
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>()

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook de uso do contexto
export const useAuth = () => useContext(AuthContext);
