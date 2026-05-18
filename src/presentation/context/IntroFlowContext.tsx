import React, { createContext, useContext } from 'react';

export type AuthEntryRoute = 'Login' | 'SignUp';

type IntroFlowContextType = {
  finishIntro: (route?: AuthEntryRoute) => void | Promise<void>;
};

const IntroFlowContext = createContext<IntroFlowContextType | null>(null);

export function IntroFlowProvider({
  children,
  finishIntro,
}: {
  children: React.ReactNode;
  finishIntro: (route?: AuthEntryRoute) => void | Promise<void>;
}) {
  return (
    <IntroFlowContext.Provider value={{ finishIntro }}>
      {children}
    </IntroFlowContext.Provider>
  );
}

export function useIntroFlow() {
  const context = useContext(IntroFlowContext);
  if (!context) {
    throw new Error('useIntroFlow must be used within IntroFlowProvider');
  }
  return context;
}
