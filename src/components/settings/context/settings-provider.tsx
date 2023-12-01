import isEqual from 'lodash/isEqual';
import React, { useMemo, useCallback, useState } from 'react';
// hooks
import { useLocalStorage } from 'src/hooks/use-local-storage';
// utils
//
import { SettingsContext } from './settings-context';
// ----------------------------------------------------------------------
export interface defaultSettingsInterface {
  themeMode: 'light' | 'dark';
  themeDirection: 'rtl' | 'ltr';
  themeContrast: 'default' | 'bold';
  themeLayout: 'vertical' | 'horizontal' | 'mini';
  themeColorPresets: 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red';
  themeStretch: boolean;
}

interface SettingProps {
  children: React.ReactNode;
  defaultSettings: defaultSettingsInterface;
}
export function SettingsProvider({ children, defaultSettings }: SettingProps) {
  const [openDrawer, setOpenDrawer] = useState(false);

  const [settings, setSettings] = useLocalStorage('settings', defaultSettings);

  const onUpdate = useCallback(
    (name: string, value: string) => {
      setSettings((prevState: object) => ({
        ...prevState,
        [name]: value
      }));
    },
    [setSettings]
  );

  // Reset
  const onReset = useCallback(() => {
    setSettings(defaultSettings);
  }, [defaultSettings, setSettings]);

  // Drawer
  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(settings, defaultSettings);

  const memoizedValue = useMemo(
    () => ({
      ...settings,
      onUpdate,
      canReset,
      onReset,
      open: openDrawer,
      onToggle: onToggleDrawer,
      onClose: onCloseDrawer
    }),
    [onReset, onUpdate, settings, canReset, openDrawer, onCloseDrawer, onToggleDrawer]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}
