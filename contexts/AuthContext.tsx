// AuthContext.tsx
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { User } from '../Types/UserStructure';
import { Form, FormItem } from '../Types/FormStructure';

interface AuthContextData {
  user: User | undefined
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>
  newForm: Form | undefined
  setNewForm: React.Dispatch<React.SetStateAction<Form | undefined>>

}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<User>()
  const [newForm, setNewForm] = useState<Form | undefined>()

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        setNewForm,
        newForm
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook de uso do contexto
export const useAuth = () => useContext(AuthContext);
