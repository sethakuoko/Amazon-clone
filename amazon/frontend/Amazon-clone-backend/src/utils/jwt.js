import jwt from "jsonwebtoken";

const DEFAULT_EXPIRES = "7d";

export function signJwt(payload, options = {}) {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.sign(payload, secret, { expiresIn: DEFAULT_EXPIRES, ...options });
}

export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.verify(token, secret);
}
