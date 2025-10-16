import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { readJson, writeJson } from "../utils/fileStore.js";
import { signJwt, verifyJwt } from "../utils/jwt.js";

const router = Router();
const USERS_FILE = "users.json";
const COOKIE_NAME = "token";

async function getUsers() {
  return (await readJson(USERS_FILE, [])) || [];
}

async function saveUsers(users) {
  await writeJson(USERS_FILE, users);
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });
    const users = await getUsers();
    if (users.find((u) => u.email === email))
      return res.status(409).json({ error: "email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: uuid(),
      name: name || "",
      email,
      passwordHash,
      roles: ["user"],
    };
    users.push(user);
    await saveUsers(users);
    const token = signJwt({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res
      .status(201)
      .json({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });
    const users = await getUsers();
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(401).json({ error: "invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });
    const token = signJwt({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "unauthorized" });
    const payload = verifyJwt(token);
    const users = await getUsers();
    const user = users.find((u) => u.id === payload.sub);
    if (!user) return res.status(401).json({ error: "unauthorized" });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    });
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
});

export default router;
