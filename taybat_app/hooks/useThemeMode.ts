import { useThemeStore } from '@/stores/theme.store';

export function useThemeMode() {
  const { mode, isLoading, errorMessage, setMode, initializeThemeMode, resetTheme } =
    useThemeStore();

  return {
    mode,
    isLoading,
    errorMessage,
    setMode,
    initializeThemeMode,
    resetTheme,
  };
}
