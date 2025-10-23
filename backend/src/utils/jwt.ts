import { PublicKeyInput, JsonWebKeyInput } from 'crypto';
import jwt from 'jsonwebtoken'

const jwtAlgorithm = process.env.JWT_ALGORITHM as jwt.Algorithm || 'HS256';

// Promisified jwt.sign
export const signPromise = (payload: string | object | Buffer<ArrayBufferLike>, secret: string, options: jwt.SignOptions) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, { ...options, algorithm: jwtAlgorithm }, (err, token) => {
      if (err) {
        return reject(err);
      }
      resolve(token);
    });
  });
};

// Promisified jwt.verify
export const verifyPromise = (token: string, secret: string, options: jwt.VerifyOptions) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, { ...options, algorithms: [jwtAlgorithm] }, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

