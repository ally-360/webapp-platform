export interface tokenSchema {
  id: string;
  verified: boolean;
  verifyToken: unknown;
  profile: ProfileToken;
  iat: number;
  exp: number;
}

export interface ProfileToken {
  email: string;
  company: {
    id?: string | null;
  };
}
