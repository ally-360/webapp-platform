import { createContext, useContext } from 'react';
import { settingProviderInterface } from './settings-provider';

// ----------------------------------------------------------------------

export const SettingsContext = createContext<settingProviderInterface | null>(null);

export const useSettingsContext = (): settingProviderInterface => {
  const context = useContext(SettingsContext);

  if (!context) throw new Error('useSettingsContext must be use inside SettingsProvider');

  return context;
};
