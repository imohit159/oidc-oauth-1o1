import { env } from "./env";

export const authConfig = {
  privateKey: env.JWT_PRIVATE_KEY,
  publicKey: env.JWT_PUBLIC_KEY,
  algorithm: env.JWT_ALGORITHM,
  accessTokenExpiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN,
} as const;
