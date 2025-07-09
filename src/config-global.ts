// routes
import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

interface EnvOptions extends ImportMeta {
  env: {
    VITE_HOST_API: string;
    VITE_ASSETS_API: string;
    VITE_API_URL: string;
    VITE_API_VERSION: string;
    VITE_MAPBOX_API: string;
  };
}

export const HOST_API = (import.meta as EnvOptions).env.VITE_HOST_API;
export const ASSETS_API = (import.meta as EnvOptions).env.VITE_ASSETS_API;
export const MAPBOX_API = (import.meta as EnvOptions).env.VITE_MAPBOX_API;

export const JWTconfig = {
  apiUrl: (import.meta as EnvOptions).env.VITE_API_URL,
  apiV: (import.meta as EnvOptions).env.VITE_API_VERSION
};

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'
