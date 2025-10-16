const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "secret";

function parseToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
}

const auth = {
  required: (req, res, next) => {
    const token = parseToken(req);
    if (!token)
      return res
        .status(401)
        .json({ success: false, error: { message: "Auth token missing" } });
    try {
      const payload = jwt.verify(token, secret);
      req.user = { id: payload.id, isAdmin: payload.isAdmin };
      next();
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, error: { message: "Invalid token" } });
    }
  },
  optional: (req, res, next) => {
    const token = parseToken(req);
    if (!token) return next();
    try {
      const payload = jwt.verify(token, secret);
      req.user = { id: payload.id, isAdmin: payload.isAdmin };
    } catch (err) {
      // ignore
    }
    next();
  },
};

module.exports = auth;
