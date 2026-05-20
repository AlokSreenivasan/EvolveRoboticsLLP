import React, { createContext, useCallback, useContext } from 'react';

type AuthFlowContextType = {
  /** Call after a successful sign-in or sign-up so root navigation can reach Home. */
  notifyAuthSuccess: () => void;
};

const AuthFlowContext = createContext<AuthFlowContextType | null>(null);

export function AuthFlowProvider({
  children,
  onAuthSuccess,
}: {
  children: React.ReactNode;
  onAuthSuccess: () => void;
}) {
  const notifyAuthSuccess = useCallback(() => {
    onAuthSuccess();
  }, [onAuthSuccess]);

  return (
    <AuthFlowContext.Provider value={{ notifyAuthSuccess }}>
      {children}
    </AuthFlowContext.Provider>
  );
}

export function useAuthFlow() {
  const context = useContext(AuthFlowContext);
  if (!context) {
    throw new Error('useAuthFlow must be used within AuthFlowProvider');
  }
  return context;
}
