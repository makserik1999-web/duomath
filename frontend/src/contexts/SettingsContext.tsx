import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SettingsContextType {
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

function detectReducedMotion(): boolean {
  const stored = localStorage.getItem("duomath-motion");
  if (stored !== null) return stored === "reduced";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotionState] = useState(detectReducedMotion);
  const [soundEnabled, setSoundEnabledState] = useState(() => localStorage.getItem("duomath-sound") !== "off");

  const setReducedMotion = useCallback((v: boolean) => {
    setReducedMotionState(v);
    localStorage.setItem("duomath-motion", v ? "reduced" : "normal");
  }, []);

  const setSoundEnabled = useCallback((v: boolean) => {
    setSoundEnabledState(v);
    localStorage.setItem("duomath-sound", v ? "on" : "off");
  }, []);

  return (
    <SettingsContext.Provider value={{ reducedMotion, setReducedMotion, soundEnabled, setSoundEnabled }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
