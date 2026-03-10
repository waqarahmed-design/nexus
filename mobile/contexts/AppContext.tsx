import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  isNewUser: boolean;
  connectedExchanges: string[];
  coachMarksSeen: string[];
  lastConnectedExchange: string | null;
  signUp: () => void;
  signIn: () => void;
  addExchange: (id: string) => void;
  markCoachMarkSeen: (id: string) => void;
  hasSeenCoachMark: (id: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isNewUser, setIsNewUser] = useState(false);
  const [connectedExchanges, setConnectedExchanges] = useState<string[]>([]);
  const [coachMarksSeen, setCoachMarksSeen] = useState<string[]>([]);
  const [lastConnectedExchange, setLastConnectedExchange] = useState<string | null>(null);

  function signUp() {
    setIsNewUser(true);
    setConnectedExchanges([]);
    setCoachMarksSeen([]);
    setLastConnectedExchange(null);
  }

  function signIn() {
    setIsNewUser(false);
    // Simulate a returning user with all exchanges already connected
    setConnectedExchanges(['binance', 'coinbase', 'kraken']);
    setLastConnectedExchange(null);
  }

  function addExchange(id: string) {
    setConnectedExchanges(prev => prev.includes(id) ? prev : [...prev, id]);
    setLastConnectedExchange(id);
  }

  function markCoachMarkSeen(id: string) {
    setCoachMarksSeen(prev => prev.includes(id) ? prev : [...prev, id]);
  }

  function hasSeenCoachMark(id: string) {
    return coachMarksSeen.includes(id);
  }

  return (
    <AppContext.Provider value={{
      isNewUser, connectedExchanges, coachMarksSeen, lastConnectedExchange,
      signUp, signIn, addExchange, markCoachMarkSeen, hasSeenCoachMark,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
