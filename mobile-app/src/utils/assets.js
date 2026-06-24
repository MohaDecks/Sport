import { getApiUrl } from '../constants/theme';

export function getAssetUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = getApiUrl().replace(/\/api$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
