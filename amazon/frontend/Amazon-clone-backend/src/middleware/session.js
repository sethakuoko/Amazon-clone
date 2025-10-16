import { v4 as uuid } from "uuid";

const COOKIE_NAME = "sid";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export function sessionCookie() {
  return function sessionCookieMiddleware(req, res, next) {
    let sid = req.cookies?.[COOKIE_NAME];
    if (!sid) {
      sid = uuid();
      res.cookie(COOKIE_NAME, sid, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: ONE_YEAR_MS,
      });
    }
    req.sessionId = sid;
    next();
  };
}
