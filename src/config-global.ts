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
    VITE_FIREBASE_API_KEY: string;
    VITE_FIREBASE_AUTH_DOMAIN: string;
    VITE_FIREBASE_PROJECT_ID: string;
    VITE_FIREBASE_STORAGE_BUCKET: string;
    VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    VITE_FIREBASE_APPID: string;
    VITE_FIREBASE_MEASUREMENT_ID: string;
    VITE_AWS_AMPLIFY_USER_POOL_ID: string;
    VITE_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID: string;
    VITE_AWS_AMPLIFY_REGION: string;
    VITE_AUTH0_CLIENT_ID: string;
    VITE_AUTH0_DOMAIN: string;
    VITE_AUTH0_CALLBACK_URL: string;
    VITE_MAPBOX_API: string;
  };
}

export const HOST_API = (import.meta as EnvOptions).env.VITE_HOST_API;
export const ASSETS_API = (import.meta as EnvOptions).env.VITE_ASSETS_API;

export const JWTconfig = {
  apiUrl: (import.meta as EnvOptions).env.VITE_API_URL,
  apiV: (import.meta as EnvOptions).env.VITE_API_VERSION
};

export const FIREBASE_API = {
  apiKey: (import.meta as EnvOptions).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as EnvOptions).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as EnvOptions).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as EnvOptions).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as EnvOptions).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as EnvOptions).env.VITE_FIREBASE_APPID,
  measurementId: (import.meta as EnvOptions).env.VITE_FIREBASE_MEASUREMENT_ID
};

export const AMPLIFY_API = {
  userPoolId: (import.meta as EnvOptions).env.VITE_AWS_AMPLIFY_USER_POOL_ID,
  userPoolWebClientId: (import.meta as EnvOptions).env.VITE_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID,
  region: (import.meta as EnvOptions).env.VITE_AWS_AMPLIFY_REGION
};

export const AUTH0_API = {
  clientId: (import.meta as EnvOptions).env.VITE_AUTH0_CLIENT_ID,
  domain: (import.meta as EnvOptions).env.VITE_AUTH0_DOMAIN,
  callbackUrl: (import.meta as EnvOptions).env.VITE_AUTH0_CALLBACK_URL
};

export const MAPBOX_API = (import.meta as EnvOptions).env.VITE_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'
