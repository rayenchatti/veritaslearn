export type ThemeColors = {
  background: string;
  surface: string;
  surfaceHighlight: string;
  primary: string;
  primaryHover: string;
  text: string;
  textMuted: string;
  border: string;
  borderLight: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  success: string;
  successBg: string;
  successBorder: string;
};

export const lightColors: ThemeColors = {
  background: '#f5f3ff', // bg-indigo-50
  surface: '#ffffff',
  surfaceHighlight: '#eef2ff', // bg-indigo-50 (alternate)
  primary: '#4f46e5', // indigo-600
  primaryHover: '#6366f1', // indigo-500
  text: '#111827', // gray-900
  textMuted: '#6b7280', // gray-500
  border: '#e5e7eb', // gray-200
  borderLight: '#f3f4f6', // gray-100
  error: '#dc2626', // red-600
  errorBg: '#fef2f2', // red-50
  errorBorder: '#fecaca', // red-200
  success: '#16a34a', // green-600
  successBg: '#f0fdf4', // green-50
  successBorder: '#bbf7d0', // green-200
};

export const darkColors: ThemeColors = {
  background: '#0f172a', // slate-900
  surface: '#1e293b', // slate-800
  surfaceHighlight: '#334155', // slate-700
  primary: '#818cf8', // indigo-400
  primaryHover: '#6366f1', // indigo-500
  text: '#f8fafc', // slate-50
  textMuted: '#94a3b8', // slate-400
  border: '#334155', // slate-700
  borderLight: '#1e293b', // slate-800
  error: '#f87171', // red-400
  errorBg: '#451a1a', // dark red bg
  errorBorder: '#7f1d1d', // red-900
  success: '#4ade80', // green-400
  successBg: '#14532d', // dark green bg
  successBorder: '#166534', // green-800
};
