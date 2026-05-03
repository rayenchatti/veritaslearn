import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import { lightColors, darkColors, ThemeColors } from './colors';

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  // null = follow system, true = force dark, false = force light
  const [manualDark, setManualDark] = useState<boolean | null>(null);

  const isDark = manualDark !== null ? manualDark : systemScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => setManualDark(prev => {
    // If following system, start from current resolved value then flip
    if (prev === null) return !isDark;
    return !prev;
  });

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export function useStyles<T extends StyleSheet.NamedStyles<T>>(
  createFactory: (colors: ThemeColors) => T
): T {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(createFactory(colors)), [colors, createFactory]);
}
