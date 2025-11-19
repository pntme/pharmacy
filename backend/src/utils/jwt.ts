import jwt from 'jsonwebtoken';
import config from '../config';

export interface TokenPayload {
  user_id: number;
  username: string;
  email: string;
  role_id: number;
  location_id?: number;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiry,
  } as any);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  } as any);
};

export const verifyAccessToken = (token: string): DecodedToken => {
  try {
    return jwt.verify(token, config.jwt.secret) as DecodedToken;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): DecodedToken => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as DecodedToken;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwt.decode(token) as DecodedToken;
  } catch (error) {
    return null;
  }
};
