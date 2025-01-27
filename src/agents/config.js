// src/agents/config.js
export const SAMBANOVA_CONFIG = {
  API_BASE_URL: 'https://api.sambanova.ai/v1',
  API_KEY: window.env?.REACT_APP_SAMBANOVA_API_KEY || process.env.REACT_APP_SAMBANOVA_API_KEY
};

export const MAPBOX_CONFIG = {
  TOKEN: window.env?.REACT_APP_MAPBOX_TOKEN || process.env.REACT_APP_MAPBOX_TOKEN
};