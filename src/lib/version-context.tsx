'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { CURRENT_VERSION, VERSION_REGISTRY } from './versions';

interface VersionContextType {
  currentVersion: number;
  setCurrentVersion: (v: number) => void;
  isFeatureAvailable: (featureKey: string) => boolean;
}

const VersionContext = createContext<VersionContextType>({
  currentVersion: CURRENT_VERSION,
  setCurrentVersion: () => {},
  isFeatureAvailable: () => true,
});

export function VersionProvider({ children }: { children: ReactNode }) {
  const [currentVersion, setCurrentVersion] = useState(CURRENT_VERSION);

  const isFeatureAvailable = (featureKey: string): boolean => {
    return VERSION_REGISTRY.some(
      (v) => v.version <= currentVersion && v.features.includes(featureKey)
    );
  };

  return (
    <VersionContext.Provider value={{ currentVersion, setCurrentVersion, isFeatureAvailable }}>
      {children}
    </VersionContext.Provider>
  );
}

export function useVersion() {
  return useContext(VersionContext);
}
