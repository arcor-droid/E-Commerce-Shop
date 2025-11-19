const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000';

export const environment = {
  production: true,
  apiUrl: defaultOrigin || 'http://localhost:8000',
  assetFallbackBaseUrl: defaultOrigin || 'http://localhost:8000'
};
