'use client';

import { useTheme } from 'next-themes';

import { type ThemeName, getDomTheme, resolveThemeName } from './shared';

export function useActiveTheme() {
  const { resolvedTheme } = useTheme();
  const theme: ThemeName =
    resolveThemeName(resolvedTheme) ||
    (typeof document === 'undefined' ? 'light' : getDomTheme());

  return theme;
}
