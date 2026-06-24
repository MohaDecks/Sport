import { Platform } from 'react-native';
import Constants from 'expo-constants';

const CONFIGURED_API = Constants.expoConfig?.extra?.apiUrl;

function getDevPort() {
  if (!CONFIGURED_API) return 5001;
  try {
    return new URL(CONFIGURED_API).port || 5001;
  } catch {
    return 5001;
  }
}

function getWebApiUrl() {
  const port = getDevPort();
  return `http://localhost:${port}/api`;
}

export function getApiUrl() {
  if (Platform.OS === 'web') {
    return getWebApiUrl();
  }

  // .env (EXPO_PUBLIC_API_URL) — server ama local, had iyo jeer ka hormari
  if (CONFIGURED_API) {
    return CONFIGURED_API;
  }

  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    return `http://${host}:${getDevPort()}/api`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${getDevPort()}/api`;
  }

  return getWebApiUrl();
}

export const API_URL = getApiUrl();

export const COLORS = {
  light: {
    primary: '#2563eb',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
  },
  dark: {
    primary: '#3b82f6',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
};
